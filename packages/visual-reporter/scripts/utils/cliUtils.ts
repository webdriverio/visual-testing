export function clearPreviousPromptLines(message: string) {
    const terminalWidth = process.stdout.columns || 80
    const lineCount = Math.ceil(message.length / terminalWidth)

    for (let i = 0; i < lineCount; i++) {
        process.stdout.write('\u001b[1A')
        process.stdout.write('\u001b[2K')
    }
}

export function cleanUpEnvironmentVariables() {
    delete process.env.VISUAL_REPORT_OUTPUT_JSON_PATH
    delete process.env.VISUAL_REPORT_DEBUG_LEVEL
    delete process.env.VISUAL_REPORT_LOCAL_DEV
    delete process.env.VISUAL_REPORT_REPORTER_FOLDER
}

export function getArgValue(argName: string): string {
    const arg = process.argv.find(arg => arg.startsWith(`${argName}=`))

    return arg ? arg.split('=')[1] : ''
}
