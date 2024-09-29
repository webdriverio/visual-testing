#!/usr/bin/env node
import { confirm, select } from '@inquirer/prompts';
import { execSync } from 'node:child_process';
import { readdirSync, lstatSync } from 'node:fs';
import { join } from 'node:path';

const currentPath = process.cwd();
const packagesDir = join(currentPath, 'packages');
const header = `
==========================
🤖 Package update Wizard 🧙
==========================
`

// Function to update packages
async function updatePackages(dir, target, updateFiles) {
    console.log(`${updateFiles ? 'Updating' : 'Checking' } packages for ${target} updates in ${dir}...`);
    const command = `npx npm-check-updates ${updateFiles ? '-u' : ''} --target ${target}`;
    execSync(command, { stdio: 'inherit', cwd: dir });
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

    console.log(`All packages ${updateFiles ? 'updated': 'checked'}!`);
}

main().catch((error) => {
    console.error('An unexpected error occurred:', error);
    process.exit(1);
});
