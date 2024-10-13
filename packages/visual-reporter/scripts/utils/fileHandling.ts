import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'

export function listItems({
    folderPath,
    includeFiles,
}: {
  folderPath: string;
  includeFiles: boolean;
}) {
    const items = readdirSync(folderPath, { withFileTypes: true })
    const choices = items
        .filter((item) => {
            const trimmedName = item.name.trim()
            if (item.isDirectory() && !item.name.startsWith('node_modules')) {
                return true
            }

            if (includeFiles) {
                return /\.json$/i.test(trimmedName)
            }

            return false
        })
        .map((item) => {
            const isDirectory = item.isDirectory()
            const value = item.name + (isDirectory ? '/' : '')
            return {
                name: value,
                value,
            }
        })

    if (resolve(folderPath) !== resolve('/')) {
        choices.push({
            name: '\x1b[36m↩ Go Back\x1b[0m',
            value: '..',
        })
    }

    if (!includeFiles) {
        choices.unshift({
            name: `This folder: ${folderPath}`,
            value: `selected-folder:${folderPath}`,
        })
    }

    return choices
}
