// connection.ts
import { Client as SSHConnection, ConnectConfig } from 'ssh2';
import { existsSync, statSync, readFileSync } from 'fs';
import { join } from 'path';
import { URL } from 'url';

import inquirer = require('inquirer');


export type AuthConfig = PasswordAuth | PrivateKeyAuth | UnsetAuth | KeyboardAuth;
export interface UnsetAuth { type: 'unset' }
export interface KeyboardAuth {
    type: 'keyboard',
    fallback?: PasswordAuth | PrivateKeyAuth | UnsetAuth,
}
export interface PasswordAuth {
    type: 'password',
    password: string,
}
export interface PrivateKeyAuth {
    type: 'private-key',
    key_file?: string | Buffer,
    passphrase?: string,
}

export type ConnectionSetup = (config: ConnectConfig) => (void | Promise<void>);
export interface ConnectionConfig {
    hostname: string,
    port?: number,
    username: string,
    auth?: AuthConfig,
    cwd?: string,
}

export class Connection {
    public readonly hostname: string;
    public readonly port: number;
    public readonly username: string;
    public readonly auth: AuthConfig;
    public readonly cwd?: string;
    private handler?: SSHConnection;

    public constructor(config: string | ConnectionConfig, auth?: AuthConfig) {
        if (typeof config === 'string') config = from_url(new URL(config), auth);
        else if (auth !== undefined) config.auth = auth;

        this.hostname = config.hostname;
        this.port = config.port ?? 22;
        this.username = config.username;
        this.auth = config.auth ?? { type: 'unset' };
        this.cwd = config.cwd;
    }

    public async open(): Promise<SSHConnection> {
        const connection = new SSHConnection();
        const config = await this.resolve(connection);

        this.handler = connection;
        return new Promise((resolve, reject) => {
            connection.on('ready', () => resolve(connection));
            connection.on('error', reject);
            connection.connect(config);
        });
    }
    public async close(): Promise<void> {
        if (this.handler === undefined) throw new Error('Cannot close connection; already closed.');

        this.handler.end();
        this.handler = undefined;
    }
    public toString(): string {
        let { hostname, username, port, cwd, auth } = this;
        cwd = (cwd !== undefined ? decodeURI(cwd) : '');

        return `ssh://${username}@${hostname}:${port}/${cwd}?auth=${auth}`;
    }

    private async resolve(connection: SSHConnection): Promise<ConnectConfig> {
        const config = await authenticate(this.auth, {
            host: this.hostname,
            port: this.port,
            username: this.username
        });

        if (config.tryKeyboard) {
            connection.on('keyboard-interactive', keyboard(async prompts => {
                const responses = await inquirer.prompt(prompts.map(({ prompt, echo }, i) => ({
                    type: echo ? 'input' : 'password',
                    name: i.toString(),
                    message: prompt,
                    default: ''
                })));

                const output: string[] = [];
                for (let i = 0; i < prompts.length; i++) output.push(responses[i.toString()] as string);
                return output;
            }));
        }
        return config;
    }

}


type Prompt = { prompt: string, echo?: boolean };
type KeyboardHandler = (name: string, instr: string, lang: string, prompts: Prompt[], finish: (responses: string[]) => void) => void;

async function authenticate(auth: AuthConfig, config: ConnectConfig): Promise<ConnectConfig> {
    switch (auth.type) {
        // No authentication mechanism provided
        case 'unset': break;
        // Password-based authentication
        case 'password': config.password = auth.password; break;
        // Keyboard-interactive authentication; usually acts as a fallback to another auth method
        case 'keyboard':
            config.tryKeyboard = true;
            if (auth.fallback) return authenticate(auth.fallback, config);

            break;
        // Private key file; provides the key as a buffer (optionally with a passphrase for decoding)
        case 'private-key':
            const file = auth.key_file ?? join(homedir(), '.ssh', 'id_rsa');
            if (typeof file === 'string') {
                if (!existsSync(file)) throw new Error('Path does not refer to a file.');
                if (!statSync(file).isFile()) throw new Error('Provided path is not a file.');

                config.privateKey = readFileSync(file);
            }
            else config.privateKey = file;

            config.passphrase = auth.passphrase;
            break;
    }

    return config;
}

function homedir(): string {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']!;
}
function keyboard(callback: (prompts: Prompt[]) => Promise<string[]>): KeyboardHandler {
    return (_name, _instr, _lang, prompts, finish) => {
        callback(prompts).then(finish);
    };
}
function from_url(url: URL, auth?: AuthConfig): ConnectionConfig {
    if (url.protocol !== 'ssh:') throw new Error('Can only process URLs with "ssh://" protocol.');
    if (!url.hostname) throw new Error('Hostname is required.');
    if (!url.username) throw new Error('Username is required.');

    // Derive a port; if unavailable, default is "22"
    const { username, hostname } = url;
    const port = (url.port ? parseInt(url.port) : undefined);

    // Derive current working directory from path
    let cwd = undefined;
    if (url.pathname) {
        const path = url.pathname.substr(1);
        if (path.length > 0) cwd = decodeURI(path);
    }

    return { hostname, username, port, cwd, auth };
}
