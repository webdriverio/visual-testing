#!/usr/bin/env node
import { confirm, select } from '@inquirer/prompts';
import { execSync } from 'node:child_process';
import { readdirSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
import {rimraf} from 'rimraf';

const currentPath = process.cwd();
const packagesDir = join(currentPath, 'packages');
const header = `
==========================
🤖 Package update Wizard 🧙
==========================
`

async function updatePackages(dir, target, updateFiles) {
    console.log(`${updateFiles ? 'Updating' : 'Checking' } packages for ${target} updates in ${dir}...`);
    const command = `npx npm-check-updates ${updateFiles ? '-u' : ''} --target ${target}`;
    execSync(command, { stdio: 'inherit', cwd: dir });
}

function removeDependencies(dir) {
    console.log(`Removing root dependencies in ${dir}...`);
    const rootNodeModulesPath = join(dir, 'node_modules');
    rimraf.sync(rootNodeModulesPath);

    const packagesDir = join(dir, 'packages');

    readdirSync(packagesDir).forEach(packageDir => {
        const fullPath = join(packagesDir, packageDir);

        if (lstatSync(fullPath).isDirectory()) {
            console.log(`Removing dependencies in ${packageDir}...`);
            const nodeModulesPath = join(fullPath, 'node_modules');
            rimraf.sync(nodeModulesPath);
        }
    });
}



function installDependencies(dir) {
    console.log(`Installing dependencies in ${dir}...`);
    execSync('pnpm pnpm.install.workaround', { stdio: 'inherit', cwd: dir });
}


function isPnpmInstalled() {
    try {
        execSync('pnpm --version', { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

async function main() {
    console.log(header);

    const target = await select({
        message: 'Which version target would you like to update to?',
        choices: [
            { name: 'Minor', value: 'minor' },
            { name: 'Latest', value: 'latest' }
        ],
        default: 'minor'
    });

    const updateFiles = await confirm({
        message: 'Do you want to update the package.json files?',
        default: true
    });

    console.log(`${updateFiles ? 'Updating' : 'Checking' } root 'package.json' for ${target} updates...`);
    await updatePackages(currentPath, target, updateFiles);

    readdirSync(packagesDir).forEach(async (packageDir) => {
        const fullPath = join(packagesDir, packageDir);
        if (lstatSync(fullPath).isDirectory()) {
            await updatePackages(fullPath, target, updateFiles);
        }
    });

    if (updateFiles) {
        const removeNodeModules = await confirm({
            message: 'Do you want to remove all "node_modules" and reinstall dependencies?',
            default: true
        });

        if (removeNodeModules) {
            removeDependencies(currentPath);
            const usePnpm = await confirm({
                message: 'Would you like reinstall the dependencies?',
                default: true
            });

            if (usePnpm) {
                if (isPnpmInstalled()) {
                    installDependencies(currentPath);
                } else {
                    console.error('pnpm is not installed. Please install pnpm and try again.');
                }
            }
        }
    }

    console.log(`All packages ${updateFiles ? 'updated': 'checked'}!`);
}

main().catch((error) => {
    console.error('An unexpected error occurred:', error);
    process.exit(1);
});
