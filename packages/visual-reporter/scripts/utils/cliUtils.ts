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

export const retry = (
    { fn, debug = false, delay = 500, retries = 3,  }:{ fn: () => void, debug?: boolean, delay?: number, retries?: number }
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const attempt = (n: number) => {
            try {
                fn()
                resolve()
            } catch (error) {
                if (n === 1) {
                    reject(error)
                } else {
                    if (debug) {
                        console.log(`Retrying... (${retries - n + 1})`)
                    }
                    setTimeout(() => attempt(n - 1), delay)
                }
            }
        }
        attempt(retries)
    })
}
