import fs from 'node:fs'
import { join } from 'node:path'
import logger from '@wdio/logger'
import type { ResultReport } from 'webdriver-image-comparison'

const log = logger('@wdio/visual-service:webdriver-image-comparison-reporter')

class VisualReportGenerator {
    directoryPath: string

    constructor({ directoryPath }:{directoryPath: string}) {
        this.directoryPath = directoryPath
    }

    public generate(): void {
        try {
            log.info('Generating visual report...')
            const testData = this.readJsonFilesRecursively(this.directoryPath)
            log.info('Read all json files')
            const groupedAndSortedData = this.groupAndSortTestData(testData)
            log.info('Grouped and sorted data')
            this.writeJsonToFile(join(this.directoryPath, 'output.json'), groupedAndSortedData)
            log.info('Report generated')
        } catch (e) {
            log.error('Error generating visual report:', e)
        }
    }

    private readJsonFilesRecursively(directory: string): ResultReport[] {
        log.info(`Reading json files from ${directory}`)
        const testData: ResultReport[] = []
        this.readDirectory(directory, testData)
        return testData
    }

    private readDirectory(dir: string, testData: ResultReport[]): void {
        const items = fs.readdirSync(dir)

        items.forEach(item => {
            const fullPath = join(dir, item)
            const stat = fs.statSync(fullPath)

            if (stat.isDirectory()) {
                this.readDirectory(fullPath, testData)
            } else if (stat.isFile() && item.endsWith('-report.json')) {
                this.readJsonFile(fullPath, testData)
            }
        })
    }

    private readJsonFile(filePath: string, testData: ResultReport[]): void {
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const jsonContent: ResultReport = JSON.parse(fileContent)
        testData.push(jsonContent) // Add JSON content to testData array
    }

    private groupAndSortTestData(testData: ResultReport[]): any {
        const groupedData: any = {}

        // Grouping by main test name
        testData.forEach(report => {
            for (const mainTestName in report) {
                const data = report[mainTestName]
                if (!groupedData[mainTestName]) {
                    groupedData[mainTestName] = { tests: {} }
                }
                if (!groupedData[mainTestName].tests[data.test]) {
                    groupedData[mainTestName].tests[data.test] = []
                }
                groupedData[mainTestName].tests[data.test].push(data)
            }
        })

        // Sorting within each group
        for (const mainTestName in groupedData) {
            for (const testName in groupedData[mainTestName].tests) {
                groupedData[mainTestName].tests[testName].sort((a: ResultReport[keyof ResultReport], b: ResultReport[keyof ResultReport]) => {
                    // Sort by commandName
                    if (a.commandName !== b.commandName) {
                        return a.commandName.localeCompare(b.commandName)
                    }
                    // Sort by instanceData (browser first, then device, then platform)
                    const aBrowserName = a.instanceData.browser?.name || ''
                    const bBrowserName = b.instanceData.browser?.name || ''
                    if (aBrowserName !== bBrowserName) {
                        return aBrowserName.localeCompare(bBrowserName)
                    }

                    const aDeviceName = a.instanceData.deviceName || ''
                    const bDeviceName = b.instanceData.deviceName || ''
                    if (aDeviceName !== bDeviceName) {
                        return aDeviceName.localeCompare(bDeviceName)
                    }

                    if (a.instanceData.platform.name !== b.instanceData.platform.name) {
                        return a.instanceData.platform.name.localeCompare(b.instanceData.platform.name)
                    }

                    return 0
                })
            }
        }

        return groupedData
    }

    private writeJsonToFile(filePath: string, data: any): void {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    }
}

export default VisualReportGenerator
