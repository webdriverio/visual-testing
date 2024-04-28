import inquirer from 'inquirer'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { RectReturn } from './ocr/types.js'
import ocrGetData from './ocr/utils/ocrGetData.js'
import { createOcrDir } from './ocr/utils/index.js'

export const CONFIG_HELPER_INTRO = `
====================================
🤖 WDIO Visual-Service OCR Wizard 🧙
====================================
`
const currentPath = process.cwd()

function convertFileToBase64(filePath:string): string {
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
        const value =  item.name + (isDirectory ? '/' : '')
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
        const answers = await inquirer.prompt([{
            type: 'list',
            name: 'path',
            message: `Please choose a folder (current folder: ${srcPath})`,
            choices: choices
        }])
        const newPath = join(srcPath, answers.path)

        if (answers.path === '..') {
            // Clears the previous line
            process.stdout.write('\u001b[1A\u001b[2K')
            return prompt(newPath)
        }
        if (answers.path.endsWith('/')) {
            // Clears the previous line
            process.stdout.write('\u001b[1A\u001b[2K')
            return prompt(newPath)
        }

        return newPath

    }

    return prompt(currentPath)
}

async function main() {
    const ocrDir = createOcrDir(
        { ocr: { imagesPath: '.tmp/ocr' } },
        { actualFolder: '', baselineFolder: '', diffFolder: '' },
    )
    const defaultOptions = {
        contrast: 0.25,
        isTesseractAvailable: false,
        language: 'eng',
        ocrImagesPath: ocrDir,
    }
    let filePath: string

    console.log(CONFIG_HELPER_INTRO)

    const initialChoice = await inquirer.prompt<{ method: 'explore' | 'type' }>({
        type: 'list',
        name: 'method',
        message: 'How would you like to specify the file?',
        choices: [
            { name: 'Use a "file explorer"', value: 'explore' },
            { name: 'Type the file path manually', value: 'type' },
        ],
    })
    if (initialChoice.method === 'explore') {
        filePath = await chooseFolder(currentPath)
    } else {
        const pathInput = await inquirer.prompt<{ path: string }>({
            type: 'input',
            name: 'path',
            message: 'Please enter the file path:',
        })
        filePath = pathInput.path
    }

    const useHaystack = await inquirer.prompt<{ use: boolean }>({
        type: 'confirm',
        name: 'use',
        message: 'Would you like to use a haystack?',
    })

    let haystack: RectReturn | undefined

    if (useHaystack.use) {
        const { x } = await inquirer.prompt<{ x: number }>({
            type: 'input',
            name: 'x',
            message: 'Enter the x coordinate:',
            filter: (input:string) => Number(input),
        })

        const { y } = await inquirer.prompt<{ y: number }>({
            type: 'input',
            name: 'y',
            message: 'Enter the y coordinate:',
            filter: (input:string) => Number(input),
        })

        const { width } = await inquirer.prompt<{ width: number }>({
            type: 'input',
            name: 'width',
            message: 'Enter the width:',
            filter: (input:string) => Number(input),
        })

        const { height } = await inquirer.prompt<{ height: number }>({
            type: 'input',
            name: 'height',
            message: 'Enter the height:',
            filter: (input:string) => Number(input),
        })

        haystack = { x, y, width, height }
    }

    let options = {
        ...defaultOptions,
        ...{ haystack },
        cliFile: convertFileToBase64(filePath),
    }

    const { useAdvanced } = await inquirer.prompt([{
        type: 'confirm',
        name: 'useAdvanced',
        message: 'Do you want to use the advanced mode?',
    }])

    if (useAdvanced) {
        const advancedOptions = await inquirer.prompt([
            {
                type: 'input',
                name: 'contrast',
                message: 'Enter new contrast (0.0 - 1.0):',
                default: defaultOptions.contrast.toString(),
                validate: (input) => {
                    const value = parseFloat(input)
                    return (value >= 0.0 && value <= 1.0) || 'Please enter a contrast between 0.0 and 1.0'
                },
                filter: (input) => input ? parseFloat(input) : defaultOptions.contrast
            },
            // {
            //     type: 'input',
            //     name: 'language',
            //     message: 'Enter OCR language code (e.g., "eng", "deu"):',
            //     default: defaultOptions.language
            // }
        ])

        options = {
            ...options,
            contrast: advancedOptions.contrast,
            language: advancedOptions.language
        }
    }
    console.log('\nProcessing image...\n')
    await ocrGetData(options)
    console.log('\nDone!')
}

main()
