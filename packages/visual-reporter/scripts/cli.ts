#!/usr/bin/env node
import { confirm, input, select } from '@inquirer/prompts'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import ora from 'ora'
import { chooseItems } from './utils/inquirerUtils.js'
import { cleanUpEnvironmentVariables, getArgValue } from './utils/cliUtils.js'
import { CONFIG_HELPER_INTRO } from './utils/constants.js'
import { validateOutputJson } from './utils/validateOutput.js'
import { copyDirectory } from './utils/fileHandling.js'

async function main() {
    //
    // Set some initial variables
    let filePath = getArgValue('--jsonOutput')
    let reportPath = getArgValue('--reportFolder')
    const logLevel = getArgValue('--logLevel')
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const visualReporterProjectRoot = resolve(__dirname, '..')
    const currentPath = process.cwd()
    const isLocalDev = process.env.VISUAL_REPORT_LOCAL_DEV === 'true'
    const isCliMode = filePath && reportPath

    if (!isCliMode) {
        console.log(CONFIG_HELPER_INTRO)
    }

    //
    // Get the output.json file path
    if (!filePath) {
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
    } else {
        try {
            const fileContent = JSON.parse(readFileSync(filePath, 'utf8'))
            if (!validateOutputJson(fileContent)) {
                throw new Error(`❌ The provided output.json file in '${filePath}'is not valid.`)
            }
        } catch (error) {
            throw error
        }
    }

    process.env.VISUAL_REPORT_OUTPUT_JSON_PATH = filePath

    if (!reportPath) {
        //
        // Choose the report output folder
        const reportFolderChoice = await select<{ method: 'explore' | 'type' }>({
            message: 'Where do you want the Visual Report to be created?',
            choices: [
                { name: 'Use a "file explorer"', value: { method: 'explore' } },
                { name: 'Type the file path manually', value: { method: 'type' } },
            ],
        })

        reportPath = await (reportFolderChoice.method === 'explore' ? chooseItems({ currentPath }) : input({
            message: 'Please enter the file path:',
        }))
    }

    const reporterPath = join(reportPath, 'report')
    process.env.VISUAL_REPORT_REPORTER_FOLDER = reporterPath

    //
    // Check if the user wants to run in debug mode
    const runInDebugMode = logLevel === 'debug' || (!isCliMode && await confirm({
        message: 'Would you like to run in debug mode?',
    }))

    if (runInDebugMode) {
        process.env.VISUAL_REPORT_DEBUG_LEVEL = 'debug'
    }

    if (!isLocalDev) {
        //
        // Copy the report to the specified folder
        const copyReportSpinner = ora(
            `Copying report to ${reporterPath}...\n`
        ).start()
        try {
            if (!existsSync(reporterPath)) {
                mkdirSync(reporterPath, { recursive: true })
            }
            copyDirectory(
                join(visualReporterProjectRoot, 'build', 'client'),
                reporterPath
            )
            copyReportSpinner.succeed(
                `Build output copied successfully to "${reporterPath}".`
            )
        } catch (error) {
            copyReportSpinner.fail(`Failed to copy the output to "${reporterPath}".`)
            throw error
        }
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

    if (!isCliMode) {
        //
        // Check if the user wants to start the server and if so, start the server on the specified port
        const startServer = await confirm({
            message: 'Would you like to start the server to show the report?',
        })

        if (startServer) {
            console.log('Starting the report server...')
            try {
                execSync(`npx sirv ${reporterPath}`, {
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
            console.log(`npx sirv ${reporterPath}\n`)
        }
    }

    cleanUpEnvironmentVariables()
    process.exit(0)
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
