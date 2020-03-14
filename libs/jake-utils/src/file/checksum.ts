// checksum.ts
import { createHash as Hash } from "crypto";


export class Checksum {
    private constructor(private readonly value: string) {}

    public compare(other: string | Checksum): boolean {
        if (typeof other === 'string') return (this.value === other);
        else return (this.value === other.value);
    }
    public toString(): string { return this.value; }

    public static from<B extends NodeJS.ArrayBufferView>(data: B, algorithm: string = 'sha256'): Checksum {
        const buffer = Buffer.from(data);
        const hash = Hash(algorithm);
        return new Checksum(hash.update(buffer).digest('hex'));
    }
}
