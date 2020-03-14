// project.ts
import { basename, dirname, join } from 'path';
import { Checksum } from './file/checksum';
import { fs, file } from './file';
import * as semver from 'semver';


export interface ProjectBuild {
    name: string,
    version: string,
    updated: Date,
    authors: string[],
}
export interface ProjectSpec {
    tags: string[],
    labels: string[],
}
export interface Artifact {
    name: string,
    path: string,
    checksum: string,
    updated: Date,
}

export class Project {
    private build: ProjectBuild;
    private artifact: Artifact[];
    private spec: ProjectSpec;

    private constructor(build: ProjectBuild, spec: ProjectSpec, artifacts: Artifact[]) {
        this.build = build;
        this.artifact = artifacts;
        this.spec = spec;
    }

    public get name(): string { return this.build.name; }
    public get version(): string { return this.build.version; }
    public get updated(): Date { return this.build.updated; }
    public get artifacts(): Artifact[] { return [ ...this.artifact ]; }
    public get image(): ProjectSpec { return { ...this.spec }; }

    public find(artifact: string | RegExp | ((artifact: Artifact) => boolean)): Artifact | undefined {
        if (typeof artifact === 'string') return this.find(a => a.name === artifact);
        else if (artifact instanceof RegExp) return this.find(a => artifact.test(a.name));

        return this.artifact.find(artifact);
    }
    public async release(version: string | undefined, tracked?: string[]) {
        tracked = (tracked !== undefined ? tracked : []);

        const { build } = this;
        build.updated = new Date();

        if (typeof version === 'string' && semver.gt(version, this.version)) {
            build.version = version;
            this.spec = {
                tags: [ `${build.name}:${version}`, `${build.name}:latest` ],
                labels: [
                    `org.opencontainers.image.title="${build.name}"`,
                    `org.opencontainers.image.version="${version}"`,
                    `org.opencontainers.image.authors="${build.authors.join('; ')}"`,
                    `org.opencontainers.image.created="${build.updated.toISOString()}"`
                ]
            };
        }

        // Update artifact tracking list
        const artifacts = new Set(this.artifact.map(({ path, name }) => join(path, name)).concat(tracked));
        this.artifact = await Promise.all(Array.from(artifacts)
            .filter(path => fs.exists(path))
            .map(async path => {
                const checksum = await fs.read(path, { checksum: true }) as Checksum;
                return {
                    updated: this.updated,
                    name: basename(path),
                    path: dirname(path),
                    checksum: checksum.toString()
                };
            }));
    }
    public async save(): Promise<void> {
        const { build, artifact, spec } = this;
        await fs.write('.project', { build, artifact, spec }, { process: file.toml() });
    }

    public static empty(name: string, version: string): Promise<Project> {
        const updated = new Date();
        const build = { name, version, updated, authors: [ 'Luis Gutierrez <legua.2507@gmail.com>' ] };
        const spec = {
            tags: [ `${name}:${version}`, `${name}:latest` ],
            labels: [
                `org.opencontainers.image.title="${name}"`,
                `org.opencontainers.image.version="${version}"`,
                `org.opencontainers.image.authors="${build.authors.join('; ')}"`,
                `org.opencontainers.image.created="${updated.toISOString()}"`
            ]
        };

        return Promise.resolve(new Project(build, spec, []));
    }
    public static async read(): Promise<Project> {
        const { build, spec, artifact } = await fs.read('.project', { process: file.toml() }) as Project;
        return new Project(build, spec, artifact);
    }

}
