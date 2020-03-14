// index.ts
import http, { AxiosRequestConfig as Request } from 'axios';
import {FileSource, FileSystemSource} from './source';
import { Checksum } from './checksum';
import * as nunjucks from 'nunjucks';


function coerce<T>(data: T, process?: WriteProcessor<T>): Buffer | undefined {
    if (data instanceof Buffer) return data;
    else if (typeof data === 'string') return Buffer.from(data, 'utf8');
    return process?.write(data);
}


export interface ReadProcessor<T> { read: (buffer: Buffer) => T }
export interface WriteProcessor<T> { write: (data: T) => Buffer }
export interface ReadWriteProcessor<T> extends ReadProcessor<T>, WriteProcessor<T> {}
export type Renderer = (buffer: Buffer, context: { [key: string]: any }) => Buffer;

export interface ReadConfig<T> {
    process?: ReadProcessor<T>,
    checksum?: boolean
}
export interface WriteConfig<T> {
    process?: WriteProcessor<T>,
    checksum?: boolean,
    stat?: { mode: number },
}
export interface RenderConfig {
    renderer?: Renderer,
    checksum?: boolean
}
export interface PullConfig<T> {
    request?: Request,
    process?: ReadProcessor<T>,
    checksum?: boolean,
}
export interface ListConfig {
    summary?: boolean,
    checksum?: boolean,
}

export interface ChecksumSummary { [path: string]: Checksum | undefined }
export interface FileSummary {
    name: string,
    path: string,
    checksum?: Checksum
}

export class FileSystem {
    private readonly source: FileSource;
    private readonly default_renderer: Renderer;

    public constructor(renderer?: Renderer) {
        this.source = new FileSystemSource();
        this.default_renderer = renderer ?? ((data: Buffer, context: { [key: string]: any }) => {
            const rendered = nunjucks.renderString(data.toString('utf8'), context);
            return Buffer.from(rendered, 'utf8');
        });
    }

    public get cwd(): string { return process.cwd(); }
    public exists(path: string): boolean {
        return this.source.stat(path) !== undefined;
    }
    public file(path: string): boolean {
        const stat = this.source.stat(path);
        return stat?.type === 'file';
    }
    public dir(path: string): boolean {
        const stat = this.source.stat(path);
        return stat?.type === 'dir';
    }
    public empty(path: string): boolean {
        return this.source.empty(path);
    }

    public async read<T>(path: string, opts?: ReadConfig<T>): Promise<Buffer | Checksum | T> {
        const file = await this.source.read(path);
        if (!file.isBuffer()) throw new Error('Attempted to read a non-file.');

        const { contents } = file;
        if (opts?.checksum) return Checksum.from(contents);
        return opts?.process?.read(contents) ?? contents;
    }
    public async write<T>(path: string, data: string | Buffer | T, opts?: WriteConfig<T>): Promise<Checksum | void> {
        const buffer = coerce(data, opts?.process);
        if (!buffer) throw new Error('Failed to process data into buffer');

        const file = await this.source.write(path, buffer, opts?.stat);
        if (!file.isBuffer()) throw new Error('Assertion failed: file should be a buffer at this point');

        const { contents } = file;
        if (opts?.checksum === undefined || opts?.checksum) return Checksum.from(contents);
    }
    public async render(path: string, source: string | Buffer, context: { [key: string]: any }, opts?: RenderConfig): Promise<Checksum | void> {
        if (typeof source === 'string') {
            const file = await this.source.read(source);
            if (!file.isBuffer()) throw new Error('Failed to read template file');

            source = file.contents;
        }

        const renderer = opts?.renderer ?? this.default_renderer;
        const result = renderer(source, context);
        return this.write(path, result, { checksum: opts?.checksum });
    }
    public async pull<T>(url: string, opts?: PullConfig<T>): Promise<Buffer | Checksum | T>;
    public async pull<T>(path: string, url?: string | PullConfig<T>, opts?: PullConfig<T>): Promise<Checksum | Buffer | T | void> {
        const target = (!url || typeof url !== 'string' ? path : url);
        if (!opts && typeof url !== 'string') opts = url;

        const request = opts?.request ?? {};
        request.method = request.method ?? 'get';
        request.responseType = 'arraybuffer';
        request.url = target;

        const response = await http(request);
        if (response.status >= 400) throw new Error(`Request to URL ${request.url} failed with status ${response.status}`);

        const buffer = response.data as Buffer;
        if (typeof url !== 'string') {
            if (opts?.process) return opts.process.read(buffer);
            return (opts?.checksum ? Checksum.from(buffer) : buffer);
        }
        return this.write(path, buffer, { checksum: opts?.checksum });
    }
    public async copy(source: string | string[], path: string): Promise<string[]> {
        const files = await this.source.copy(source, path);
        return files.map(file => file.path);
    }
    public async move(source: string | string[], path: string): Promise<string[]> {
        const files = await this.source.move(source, path);
        return files.map(file => file.path);
    }
    public async delete(path: string | string[]): Promise<string[]> {
        const files = await this.source.walk(path, async file => {
            await this.source.delete(file.path);
        });

        return files.map(file => file.path);
    }
    public async list(path: string | string[]): Promise<string[]>;
    public async list(path: string | string[], opts: ListConfig & { summary: true }): Promise<FileSummary[]>;
    public async list(path: string | string[], opts?: ListConfig & { checksum: true, summary?: false }): Promise<ChecksumSummary>;
    public async list(path: string | string[], opts?: ListConfig): Promise<string[] | ChecksumSummary | FileSummary[]> {
        const items = await this.source.walk(path);
        if (opts !== undefined) {
            const { summary, checksum } = opts;
            if (summary) return items.map(file => ({
                name: file.basename,
                path: file.path,
                checksum: (checksum && file.isBuffer()) ? Checksum.from(file.contents) : undefined
            }));
            if (checksum) return items.reduce((output: ChecksumSummary, file) => {
                output[file.path] = file.isBuffer() ? Checksum.from(file.contents) : undefined;
                return output;
            }, {});
        }
        return items.map(file => file.path);
    }

}

export const fs = new FileSystem();
export namespace file {
    const TOML = require('@iarna/toml');

    export function json<T>(): ReadWriteProcessor<T> {
        return {
            read: (buffer: Buffer) => JSON.parse(buffer.toString('utf8')),
            write: (data: T) => Buffer.from(JSON.stringify(data), 'utf8')
        }
    }
    export function toml<T extends {}>(): ReadWriteProcessor<T> {
        return {
            read: (buffer: Buffer) => TOML.parse(buffer.toString('utf8')),
            write: (data: T) => Buffer.from(TOML.stringify(data), 'utf8')
        };
    }
}
