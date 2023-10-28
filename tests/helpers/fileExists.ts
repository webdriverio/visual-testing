import { accessSync } from 'node:fs'

/**
 * Check if a file exists
 */
export function fileExists(filePath: string) {
    try {
        accessSync(filePath)
        return true
    } catch (err) {
        return false
    }
}
