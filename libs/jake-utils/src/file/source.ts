// source.ts
import { resolve, dirname, relative } from 'path';
import { join, posix } from 'path';
import { promisify } from 'util';


import strip_bom = require('strip-bom-buf');
import commondir = require('commondir');
import globby = require('globby');
import Vinyl = require('vinyl');


namespace fs {
    const $glob = require('glob');
    const fs = require('fs');

    export const fstat = fs.statSync;
    export const stat = promisify(fs.stat);
    export const read = promisify(fs.readFile);
    export const write = promisify(fs.writeFile);
    export const mkdir = require('mkdirp');
    export const rm = promisify(require('rimraf'));
    export const exists = fs.existsSync;
    export const readdir = fs.readdirSync;
    export function glob(path: string | string[]): string[] {
        return globby.sync(as_glob(path), { dot: true });
    }
    export function root(path: string | string[]): string {
        if (Array.isArray(path)) return commondir(path
            .filter(f => f != null && f.charAt(0) !== '!')
            .map(root)
        );

        const start = path.indexOf('*');
        if (start !== -1) path = path.substr(0, start + 1);
        else if (fs.existsSync(path) && fs.statSync(path).isDirectory()) return path;

        return dirname(path);
    }

    function as_glob(path: string | string[]): string[] {
        if (Array.isArray(path)) return path.flatMap(as_glob);
        if (!$glob.hasMagic(path)) {
            if (!fs.existsSync(path)) return [ path, posix.join(path, '**') ];
            else if (fs.statSync(path).isDirectory()) return [ posix.join(path, '**') ];
        }

        return [ path ];
    }
}

export interface FileStats {
    mode: number,
    uid: number,
    gid: number,
    size?: number,
    type: 'file' | 'dir'
}
export interface FileSource {
    read(path: string): Promise<Vinyl.File>;
    write(path: string, data: Buffer, stat?: { mode: number }): Promise<Vinyl.File>;
    delete(path: string): Promise<void>;
    copy(source: string | string[], target: string): Promise<Vinyl.File[]>;
    move(source: string | string[], target: string): Promise<Vinyl.File[]>;
    walk(path: string | string[], callback?: (file: Vinyl.File) => (void | Promise<void>)): Promise<Vinyl.File[]>;
    stat(path: string): FileStats | undefined;
    empty(path: string): boolean;
}

export class FileSystemSource implements FileSource {
    private readonly store: { [path: string]: Vinyl.File };

    public constructor() { this.store = {}; }

    public async read(path: string): Promise<Vinyl.File> {
        return await this.get(path);
    }
    public async write(path: string, data: Buffer, stat?: { mode: number }): Promise<Vinyl.File> {
        path = resolve(path);

        const dir = dirname(path);
        if (!fs.exists(dir)) await fs.mkdir(dir);

        void await fs.write(path, data, { mode: stat?.mode ?? null });
        return await this.get(path, true);
    }
    public async delete(path: string): Promise<void> {
        return fs.rm(path);
    }
    public async copy(source: string | string[], target: string): Promise<Vinyl.File[]> {
        target = resolve(target);
        const root = fs.root(source);
        return this.walk(source, async file => {
            const path = relative(root, file.path);
            const dest = join(target, path);

            if (file.isDirectory()) await fs.mkdir(file.path);
            else {
                const dir = dirname(dest);
                if (!fs.exists(dir)) await fs.mkdir(dir);

                if (!file.isBuffer()) throw new Error('Cannot copy non-file to target location.');
                void await this.write(dest, file.contents, file.stat ?? undefined);
            }
        });
    }
    public async move(source: string | string[], target: string): Promise<Vinyl.File[]> {
        target = resolve(target);
        const root = fs.root(source);
        return this.walk(source, async file => {
            const path = relative(root, file.path);
            const dest = join(target, path);

            if (file.isDirectory()) await fs.mkdir(file.path);
            else {
                const dir = dirname(dest);
                if (!fs.exists(dir)) await fs.mkdir(dir);

                if (!file.isBuffer()) throw new Error('Cannot copy non-file to target location.');
                void await this.write(dest, file.contents, file.stat ?? undefined);
                void await this.delete(file.path);
            }
        });
    }
    public async walk(path: string | string[], callback?: (file: Vinyl.File) => (void | Promise<void>)): Promise<Vinyl.File[]> {
        const files = fs.glob(path);

        if (files.length === 0) return [];
        return Promise.all(files.map(async name => {
            const file = await this.get(name);
            void await callback?.(file);

            return file;
        }));
    }
    public stat(path: string): FileStats | undefined {
        try {
            const stat = fs.fstat(path);

            if (stat.isDirectory()) return { mode: stat.mode, uid: stat.uid, gid: stat.gid, type: 'dir' };
            else if (stat.isFile()) return {
                mode: stat.mode,
                size: stat.size,
                uid: stat.uid,
                gid: stat.gid,
                type: 'file'
            };

            return undefined;
        }
        catch { return undefined; }
    }
    public empty(path: string): boolean {
        try {
            const stat = fs.fstat(path);

            if (stat.isFile()) return (stat.size === 0);
            else if (stat.isDirectory()) return (fs.readdir(path).length === 0);
            return false;
        }
        catch { return true; }
    }

    private async get(path: string, refresh: boolean = false): Promise<Vinyl.File> {
        if (this.store[path] === undefined || refresh) {
            let stat = null, contents = null;
            try {
                stat = await fs.stat(path);
                if (stat.isFile()) contents = strip_bom(await fs.read(path));
            }
            finally {
                const cwd = process.cwd();
                this.store[path] = new Vinyl({ contents, stat, path, cwd, base: cwd });
            }
        }
        return this.store[path];
    }

}
