import net from 'node:net'
import ora from 'ora'

export function clearPreviousPromptLines(message: string) {
    const terminalWidth = process.stdout.columns || 80
    const lineCount = Math.ceil(message.length / terminalWidth)

    for (let i = 0; i < lineCount; i++) {
        process.stdout.write('\u001b[1A')
        process.stdout.write('\u001b[2K')
    }
}

export function cleanUpEnvironmentVariables() {
    delete process.env.NEXT_PUBLIC_VISUAL_REPORT_OUTPUT_JSON_PATH
    delete process.env.VISUAL_REPORT_DEBUG_LEVEL
}

function checkPortAvailability(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const server = net.createServer()

        server.once('error', () => {
            resolve(false)
        })

        server.once('listening', () => {
            server.close(() => {
                resolve(true)
            })
        })

        server.listen(port)
    })
}

export async function findAvailablePort(startingPort: number) {
    let port = startingPort
    let isAvailable = false
    console.log(`Checking for available ports starting from "${port}"...`)

    while (!isAvailable) {
        const spinner = ora(`Trying port ${port}...`).start()
        isAvailable = await checkPortAvailability(port)
        if (!isAvailable) {
            spinner.fail(`Port ${port} is in use.`)
            port += 1
        } else {
            spinner.succeed(`Found available port ${port}.`)
        }
    }

    return port
}
