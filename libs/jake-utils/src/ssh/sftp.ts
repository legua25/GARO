// sftp.ts
import { SFTPWrapper } from 'ssh2';


export interface PutConfig { mode?: number }

export class SFTPHandler {

    public constructor(private readonly handler: SFTPWrapper) {}

    public async resolve(path: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.handler.realpath(path, (error, abspath) => {
                if (error) return reject(error);
                resolve(abspath);
            });
        });
    }
    public async put(path: string, data: Buffer, opts?: PutConfig): Promise<void> {
        return new Promise((resolve, reject) => {
            this.handler.open(path, 'w', (error, input) => {
                if (error) return reject(error);
                this.handler.write(input, data, 0, data.length, 0, error => {
                    if (error) return reject(error);
                    if (opts && opts.mode) {
                        this.handler.fchmod(input, opts.mode, error => {
                            if (error) return reject(error);
                            resolve();
                        });
                    }
                    else resolve();
                })
            })
        });
    }
    public async get(source: string, path: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.handler.fastGet(source, path, error => {
                if (error) return reject(error);
                resolve();
            })
        });
    }

}
