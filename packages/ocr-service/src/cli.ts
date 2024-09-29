#!/usr/bin/env node
import { input, confirm, select } from '@inquirer/prompts'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { RectReturn } from './types.js'
import getData from './utils/getData.js'
import { createOcrDir } from './utils/index.js'
import { isSystemTesseractAvailable } from './utils/tesseract.js'
import { SUPPORTED_LANGUAGES } from './utils/constants.js'
import { remote } from 'webdriverio'

export const CONFIG_HELPER_INTRO = `
=============================
🤖 WDIO OCR-Service Wizard 🧙
=============================
`
const currentPath = process.cwd()

function convertFileToBase64(filePath: string): string {
    if (!existsSync(filePath)) {
        throw new Error(`File does not exist at: "${filePath}"`)
    }
    const fileBuffer = readFileSync(filePath)
    const base64String = fileBuffer.toString('base64')

    return base64String
}

function listFilesAndFolders(folderPath: string) {
    const items = readdirSync(folderPath, { withFileTypes: true })
    const choices = items.filter(item => {
        if (item.isDirectory() && !item.name.startsWith('node_modules')) {
            return true
        }

        return /\.(jpg|jpeg|png|gif)$/i.test(item.name)
    }).map(item => {
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
            value: '..'
        })
    }

    return choices
}

async function chooseFolder(currentPath: string): Promise<string> {
    async function prompt(srcPath: string): Promise<string> {
        const choices = listFilesAndFolders(srcPath)
        const answers = await select({
            message: `Please choose a folder (current folder: ${srcPath})`,
            choices: choices
        })
        const newPath = join(srcPath, answers)

        if (answers === '..') {
            // Clears the previous line
            process.stdout.write('\u001b[1A\u001b[2K')
            return prompt(newPath)
        }
        if (answers.endsWith('/')) {
            // Clears the previous line
            process.stdout.write('\u001b[1A\u001b[2K')
            return prompt(newPath)
        }

        return newPath
    }

    return prompt(currentPath)
}

async function main() {
    const ocrDir = createOcrDir('.tmp/')
    const defaultOptions = {
        contrast: 0.25,
        isTesseractAvailable: isSystemTesseractAvailable(),
        language: SUPPORTED_LANGUAGES.ENGLISH,
        ocrImagesPath: ocrDir,
    }
    let filePath: string

    console.log(CONFIG_HELPER_INTRO)

    const initialChoice = await select<{ method: 'explore' | 'type'; }>({
        message: 'How would you like to specify the file?',
        choices: [
            { name: 'Use a "file explorer"', value: { method: 'explore' } },
            { name: 'Type the file path manually', value: { method: 'type' } },
        ],
    })

    if (initialChoice.method === 'explore') {
        filePath = await chooseFolder(currentPath)
    } else {
        const pathInput = await input({
            message: 'Please enter the file path:',
        })
        filePath = pathInput
    }

    const useHaystack = await confirm({
        message: 'Would you like to use a haystack?',
    })

    let haystack: RectReturn | undefined

    if (useHaystack) {
        const x = await input({
            message: 'Enter the x coordinate:',
            validate: (input) => isNaN(Number(input)) ? 'Please enter a valid number' : true,
        })

        const y = await input({
            message: 'Enter the y coordinate:',
            validate: (input) => isNaN(Number(input)) ? 'Please enter a valid number' : true,
        })

        const width = await input({
            message: 'Enter the width:',
            validate: (input) => isNaN(Number(input)) ? 'Please enter a valid number' : true,
        })

        const height = await input({
            message: 'Enter the height:',
            validate: (input) => isNaN(Number(input)) ? 'Please enter a valid number' : true,
        })

        haystack = { x: Number(x), y: Number(y), width: Number(width), height: Number(height) }
    }

    let options = {
        ...defaultOptions,
        haystack,
        cliFile: convertFileToBase64(filePath),
    }

    const useAdvanced = await confirm({
        message: 'Do you want to use the advanced mode?',
    })

    if (useAdvanced) {
        const advancedOptions = await input({
            message: 'Enter new contrast (0.0 - 1.0):',
            default: defaultOptions.contrast.toString(),
            validate: (input) => {
                const value = parseFloat(input)
                return (value >= 0.0 && value <= 1.0) || 'Please enter a contrast between 0.0 and 1.0'
            },
        })

        options = {
            ...options,
            contrast: parseFloat(advancedOptions),
        }
    }

    // For cli use, empty browser context to pass into getData
    const browser = await remote({ capabilities: { browserName: 'stub' }, automationProtocol: './protocol-stub.js' })

    console.log('\nProcessing image...\n')
    await getData(browser, options)
    console.log('\nDone!')
}

main()
