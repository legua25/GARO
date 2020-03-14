// vinyl.d.ts
declare module 'vinyl' {
    import { Stats } from 'fs';


    namespace Vinyl {
        export interface FileConfig {
            path?: string | null,
            cwd?: string,
            base?: string,
            contents?: NodeJS.ArrayBufferView | null,
            history?: string[],
            stat?: Stats | null,
            [prop: string]: any,
        }

        // File hierarchy: to leverage type inference
        export interface File {
            contents: NodeJS.ArrayBufferView | null;
            path: string;
            cwd: string;
            relative: string;
            dirname: string;
            basename: string;
            stem: string;
            extname: string;
            symlink: string;
            stat: Stats | null;
            readonly history: string[];
            base?: string | null;
            [prop: string]: any;

            isBuffer(): this is BufferFile;
            isStream(): false;
            isNull(): this is EmptyFile;
            isDirectory(): this is Directory;
            isSymbolic(): this is Symlink;
            clone(opts?: { contents?: boolean, deep?: boolean }): this;
            inspect(): string;

        }
        export interface BufferFile extends File {
            contents: Buffer;

            isBuffer(): true;
            isNull(): this is never;
            isDirectory(): this is never;
            isSymbolic(): this is never;
        }
        export interface EmptyFile extends File {
            contents: null;

            isBuffer(): this is never;
            isNull(): true;
            isDirectory(): this is never;
            isSymbolic(): this is never;
        }
        export interface Directory extends File {
            contents: null;
            stat: Stats;

            isBuffer(): this is never;
            isNull(): true;
            isDirectory(): true;
            isSymbolic(): this is never;
        }
        export interface Symlink extends File {
            contents: null;
            stat: Stats;

            isBuffer(): this is never;
            isNull(): true;
            isDirectory(): this is never;
            isSymbolic(): true;
        }
    }


    const Vinyl: {
        new(opts: Vinyl.FileConfig & { content: NodeJS.ArrayBufferView | Buffer }): Vinyl.BufferFile;
        new(opts: Vinyl.FileConfig & { content: null }): Vinyl.EmptyFile;
        new(opts?: Vinyl.FileConfig): Vinyl.File;

        isVinyl(obj: any): obj is Vinyl.File;
        isCustomProp(obj: string): boolean;
        prototype: Vinyl.File;
    };
    export = Vinyl;
}
