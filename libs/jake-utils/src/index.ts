// index.ts
import chalk = require('chalk');
import { Task } from 'jake';

import inquirer = require('inquirer');


// Task management utilities
export async function call(name: string, ...args: any[]): Promise<void> {
    const task: Task | undefined = (Task as any)[name];
    if (!task) throw new Error(`Undefined task ${name}`);

    return new Promise((resolve, reject) => {
        task.reenable(true);
        task.on('error', reject);
        task.on('complete', resolve);

        task.invoke(...args);
    });
}

// File system utilities
export * from './file';
export * from './project';

// Logging utilities
export function log(message: string, ...args: any[]): void {
    console.log(chalk.bold(message), ...args);
}
export namespace log {
    export const ok = chalk.bold.green;
    export const info = chalk.bold.blueBright;
    export const warn = chalk.bold.keyword('orange');
    export const error = chalk.bold.red;
}

// Command execution
export const exec = require('execa');
export * from './ssh';

// Task parameters
export const query = inquirer.prompt;
export namespace param {
    export function bool(key: string, or?: boolean): boolean {
        const value = process.env[key];
        if (value !== undefined) {
            switch (value.toLowerCase()) {
                case 'true': case 'yes': case 'on': case 'y': case '1': return true;
                case 'false': case 'no': case 'off': case 'n': case '0': case '': return false;
                default: break;
            }
        }

        if (or === undefined) throw new Error(`Failed to interpret param ${key}=${value} as boolean`);
        return or;
    }
    export function number(key: string, or?: number): number {
        const value = process.env[key];
        if (value !== undefined) {
            try { return parseFloat(value); }
            catch {}
        }

        if (or === undefined) throw new Error(`Failed to interpret param ${key}=${value} as number`);
        return or;
    }
    export function string(key: string, or?: string): string {
        const value = process.env[key];
        return value ?? or ?? '';
    }
}
