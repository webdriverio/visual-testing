import { resolve as pathResolve } from 'node:path'
import { writeFileSync, readFileSync } from 'node:fs'
import type { CreateCompareReportOptions, CreateJsonReportIfNeededOptions, ResultReport } from './compareReport.interfaces.js'
import { getBase64ScreenshotSize } from '../helpers/utils.js'

export function createCompareReport({
    boundingBoxes,
    data,
    fileName,
    folders,
    size,
    testContext: {
        commandName,
        instanceData: {
            app,
            browser,
            deviceName,
            isIOS,
            isMobile,
            platform,
        },
        framework,
        parent,
        tag,
        title
    },
}: CreateCompareReportOptions) {
    const { misMatchPercentage, rawMisMatchPercentage } = data
    const jsonFileName = fileName.split('.').slice(0, -1).join('.')
    const jsonFilePath = pathResolve(folders.actualFolderPath, `${jsonFileName}-report.json`)
    const browserContext = {
        browser,
        platform,
    }
    const mobileContext = {
        ...(app !== 'not-known'
            ? { app }
            : { browser: { name: browser.name, version: isIOS ? platform.version: browser.version } }),
        deviceName,
        platform,
    }
    const jsonData: ResultReport = {
        description: parent,
        test: title,
        tag,
        instanceData: isMobile ? mobileContext : browserContext,
        commandName,
        framework,
        boundingBoxes,
        fileData: {
            actualFilePath: pathResolve(folders.actualFolderPath, fileName),
            baselineFilePath: pathResolve(folders.baselineFolderPath, fileName),
            diffFilePath: pathResolve(folders.diffFolderPath, fileName),
            fileName,
            size,
        },
        misMatchPercentage: misMatchPercentage.toString(),
        rawMisMatchPercentage,
    }

    writeFileSync(jsonFilePath, JSON.stringify(jsonData), 'utf8')
}

/**
 * Create JSON report if requested
 */
export async function createJsonReportIfNeeded({
    boundingBoxes,
    data,
    fileName,
    filePaths,
    devicePixelRatio,
    imageCompareOptions,
    testContext,
    storeDiffs,
}: CreateJsonReportIfNeededOptions): Promise<void> {
    if (imageCompareOptions.createJsonReportFiles) {
        createCompareReport({
            boundingBoxes,
            data,
            fileName,
            folders: {
                actualFolderPath: filePaths.actualFolderPath,
                baselineFolderPath: filePaths.baselineFolderPath,
                diffFolderPath: filePaths.diffFolderPath,
            },
            size: {
                actual: getBase64ScreenshotSize(readFileSync(filePaths.actualFilePath).toString('base64'), devicePixelRatio),
                baseline: getBase64ScreenshotSize(readFileSync(filePaths.baselineFilePath).toString('base64'), devicePixelRatio),
                ...(storeDiffs && filePaths.diffFilePath && { diff: getBase64ScreenshotSize(readFileSync(filePaths.diffFilePath).toString('base64'), devicePixelRatio) }),
            },
            testContext,
        })
    }
}

