import { accessSync } from 'node:fs'

/**
 * Check if a file exists
 */
export function fileExists(filePath: string) {
    try {
        console.log('Checking file:', filePath)
        accessSync(filePath)
        return true
    } catch (err) {
        console.log('An error occurred while checking the file path:', err)
        return false
    }
}
