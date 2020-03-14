// index.js
import { ConnectionConfig, Connection, AuthConfig, PasswordAuth, PrivateKeyAuth, UnsetAuth } from './connection';
import { PutConfig, SFTPHandler } from './sftp';
import { connect, StdioOption } from './pipes';
import { Client as SSHClient } from 'ssh2';
import { resolve, posix } from 'path';
import { readFileSync } from 'fs';


// Command execution options
export { StdioOption } from './pipes';
export interface ExecCommand {
    readonly code: number,
    readonly signal?: string,
    readonly stdout: NodeJS.ReadWriteStream,
    readonly stderr: NodeJS.ReadWriteStream,
}
export interface ExecConfig {
    cwd?: string,
    environ?: { [key: string]: string },
    stdout?: StdioOption,
    stderr?: StdioOption,
}

// SFTP options
export { PutConfig } from './sftp';


export type SSHConfig = string | ConnectionConfig;
export interface Client {
    readonly hostname: string;
    readonly username: string;
    readonly port: number;
    environ: { [key: string]: string };
    cwd: string;

    exec(command: string | string[], opts?: ExecConfig): Promise<ExecCommand>;
    put(local: string | Buffer, remote: string, opts?: PutConfig): Promise<void>;
    pull(remote: string, local: string): Promise<void>;
}

export type SSHSession<T> = (client: Client) => (T | Promise<T>);

export async function ssh<T>(config: SSHConfig, callback: SSHSession<T>): Promise<T>;
export async function ssh<T>(config: SSHConfig, auth: AuthConfig | SSHSession<T>, callback?: SSHSession<T>): Promise<T> {
    if (typeof auth === 'object') {
        if (typeof callback !== 'function') throw new Error('A handler must be provided for the SSH session');
    }
    else {
        callback = auth;
        auth = { type: 'unset' };
    }
    const connection = new Connection(config, auth);

    const client = await DefaultClient.create(connection, await connection.open());
    const output = await callback(client);
    await connection.close();

    return output;
}

export namespace ssh {
    export function passwd(value: string): AuthConfig {
        return { type: 'password', password: value };
    }
    export function key(file: string | Buffer, passphrase?: string): AuthConfig {
        return { type: 'private-key', key_file: file, passphrase };
    }
    export function interactive(fallback?: PasswordAuth | PrivateKeyAuth | UnsetAuth): AuthConfig {
        return { type: 'keyboard', fallback };
    }
}

class DefaultClient implements Client {
    private readonly connection: Connection;
    private readonly handle: SSHClient;

    public environ: { [key: string]: string; };
    public cwd: string;

    private constructor(connection: Connection, handle: SSHClient) {
        this.connection = connection;
        this.handle = handle;
        this.environ = {};

        this.cwd = (this.connection.cwd ?? '.');
    }

    public get hostname(): string { return this.connection.hostname; }
    public get port(): number { return this.connection.port; }
    public get username(): string { return this.connection.username; }

    public async exec(command: string | string[], opts?: ExecConfig): Promise<ExecCommand> {
        if (typeof command === 'string') command = [ command ];

        const cwd = (opts?.cwd ?? this.cwd);
        const env: { [key: string]: string } = Object.assign({}, this.environ, opts?.environ);
        const cmd = command as string[];
        return new Promise((resolve, reject) => {
            const command = [ `cd "${cwd}"`, ...cmd ].join('\n');
            this.handle.exec(command, { env }, (error, channel) => {
                if (error) return reject(error);

                const stdout = connect('stdout', opts?.stdout ?? 'pipe');
                const stderr = connect('stderr', opts?.stderr ?? 'pipe');

                channel.stdout.pipe(stdout);
                channel.stderr.pipe(stderr);
                channel.on('close', (code: number | null, signal?: string) => {
                    resolve({
                        code: code ?? 0,
                        signal,
                        stdout,
                        stderr
                    });
                })
            });
        });
    }
    public async put(local: string | Buffer, remote: string, opts?: PutConfig): Promise<void> {
        if (!remote.startsWith('/')) remote = posix.join(this.cwd, remote);
        if (typeof local === 'string') {
            const path = resolve(local);
            local = readFileSync(path);
        }

        const sftp = await this.sftp();
        return sftp.put(remote, local, opts);
    }
    public async pull(remote: string, local: string): Promise<void> {
        if (!remote.startsWith('/')) remote = posix.join(this.cwd, remote);
        local = resolve(local);

        const sftp = await this.sftp();
        return sftp.get(remote, local);
    }

    private async resolve(): Promise<this> {
        const sftp = await this.sftp();
        this.cwd = await sftp.resolve(this.cwd);

        return this;
    }
    private async sftp(): Promise<SFTPHandler> {
        return new Promise((resolve, reject) => {
            this.handle.sftp((error, sftp) => {
                if (error) return reject(error);
                resolve(new SFTPHandler(sftp));
            })
        });
    }

    public static async create(connection: Connection, handle: SSHClient): Promise<Client> {
        const client = new DefaultClient(connection, handle);
        return client.resolve();
    }

}
