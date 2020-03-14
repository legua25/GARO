// pipes.ts
import { createWriteStream } from 'fs';

import through = require('through');


export type StdioOption = number | string | 'inherit' | 'ignore' | 'pipe' | NodeJS.ReadWriteStream;
export function connect(target: 'stdout' | 'stderr', mode: StdioOption): NodeJS.ReadWriteStream {
    if (typeof mode === 'string') {
        switch (mode) {
            case 'pipe': return pipe();
            case 'inherit': return inherit(target);
            case 'ignore': return ignore();
            default: return file(mode);
        }
    }
    else if (typeof mode === 'number') return file(mode);
    return mode;
}

function file(file: number | string): NodeJS.ReadWriteStream {
    const stream = (typeof file === 'string' ? createWriteStream(file) : createWriteStream('', { fd: file }));
    return through(
        data => stream.write(data),
        () => stream.end()
    );
}
function inherit(target: 'stdout' | 'stderr'): NodeJS.ReadWriteStream {
    return through(data => process[target].write(data));
}
function ignore(): NodeJS.ReadWriteStream {
    return through();
}
function pipe(): NodeJS.ReadWriteStream {
    const buffer: string[] = [];
    const pipe = through(
        function (data) { buffer.push(data); this.emit('data', data); },
        function () { this.emit('end'); }
    );

    pipe.toString = () => buffer.join('');
    return pipe;
}
