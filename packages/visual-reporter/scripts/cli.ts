#!/usr/bin/env node
import { confirm, input, select } from '@inquirer/prompts'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import ora from 'ora'
import { chooseItems } from './utils/inquirerUtils.js'
import { cleanUpEnvironmentVariables, findAvailablePort } from './utils/cliUtils.js'
import { CONFIG_HELPER_INTRO } from './utils/constants.js'
import { validateOutputJson } from './utils/validateOutput.js'

async function main() {
    //
    // Set some initial variables
    let filePath: string = ''
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const visualReporterProjectRoot = resolve(__dirname, '..')
    const buildFolder = resolve(visualReporterProjectRoot, 'build')
    const currentPath = process.cwd()

    console.log(CONFIG_HELPER_INTRO)

    //
    // Get the output.json file path
    const initialChoice = await select<{ method: 'explore' | 'type' }>({
        message: 'How would you like to specify the file?',
        choices: [
            { name: 'Use a "file explorer"', value: { method: 'explore' } },
            { name: 'Type the file path manually', value: { method: 'type' } },
        ],
    })

    let isValidFile = false
    while (!isValidFile) {
        filePath = await (initialChoice.method === 'explore' ? chooseItems({ currentPath, includeFiles: true }) : input({
            message: 'Please enter the file path:',
        }))

        try {
            const fileContent = JSON.parse(readFileSync(filePath, 'utf8'))
            if (validateOutputJson(fileContent)) {
                isValidFile = true
            } else {
                console.error(
                    '❌ The selected file is not valid. Please select a correct output.json file.'
                )
            }
        } catch (_error) {
            console.log(
                'Failed to read or parse the file. Please select a correct output.json file.'
            )
        }
    }

    process.env.VISUAL_REPORT_OUTPUT_JSON_PATH = filePath

    //
    // Check if the user wants to run in debug mode
    const runInDebugMode = await confirm({
        message: 'Would you like to run in debug mode?',
    })

    if (runInDebugMode) {
        process.env.VISUAL_REPORT_DEBUG_LEVEL = 'debug'
    }

    //
    // Generate the thumbnails
    const thumbnailSpinner = ora('Prepare report assets...\n').start()
    try {
        execSync('npm run script:prepare.report', {
            stdio: 'inherit',
            cwd: visualReporterProjectRoot,
        })
        thumbnailSpinner.succeed('Successfully generated the report assets.')
    } catch (_error) {
        if (runInDebugMode){
            console.log('Failed generating the report assets = ', _error)
        }
        thumbnailSpinner.fail('Failed to generate thumbnails.')
    }

    //
    // Copy the report to the specified folder
    const buildReportSpinner = ora(
        'Building the report'
    ).start()
    try {
        // First remove the build folder if it exists
        existsSync(buildFolder) && rmSync(buildFolder, { recursive: true })
        execSync('npm run build', {
            stdio: 'inherit',
            cwd: visualReporterProjectRoot,
        })

        buildReportSpinner.succeed('Building the report was successful')
    } catch (error) {
        buildReportSpinner.fail(`Failed to build the report. Error: ${error}`)
        throw error
    }

    //
    // Check if the user wants to start the server and if so, start the server on the specified port
    const startServer = await confirm({
        message: 'Would you like to start the server to show the report?',
    })

    let serverPort = 3000
    if (startServer) {
        serverPort = Number(
            await input({
                message: 'Please enter a custom server port:',
                default: '3000',
            })
        )
        const availablePort = await findAvailablePort(Number(serverPort))

        console.log('Starting the report server...')
        try {
            execSync(`npx vite preview --port ${availablePort}`, {
                stdio: 'inherit',
                cwd: visualReporterProjectRoot,
            })
        } catch (_error) {
            console.log('\nManually stopped the server by pressing Ctrl + C')
        }
    } else {
        console.log(
            '\nServer not started. You can start it manually later using the following command:'
        )
        console.log(`npx vite preview --port ${serverPort}\n`)
        cleanUpEnvironmentVariables()

        process.exit(0)
    }
}

main().catch((error) => {
    if (error instanceof Error && error.message.includes('User force closed')) {
        console.log('\nProcess was closed by the user.\n')
    } else {
        console.error('An unexpected error occurred:', error)
    }

    cleanUpEnvironmentVariables()
    process.exit(1)
})
