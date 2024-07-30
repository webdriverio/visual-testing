import { resolve as pathResolve } from 'node:path'
import { writeFileSync } from 'node:fs'
import type { BoundingBox, IgnoreBoxes } from './images.interfaces.js'
import type { CompareData } from '../resemble/compare.interfaces.js'
import type { TestContext } from '../commands/check.interfaces.js'

export type ResultReport = {
    description: string;
    test: string;
    tag: string;
    instanceData: {
        app?: string;
        browser?: { name: string; version: string };
        deviceName?: string;
        platform: { name: string; version: string };
    };
    commandName: string;
    framework: string;
    boundingBoxes: {
        diffBoundingBoxes: BoundingBox[];
        ignoredBoxes: IgnoreBoxes[];
    };
    fileData: {
        actualFilePath: string;
        baselineFilePath: string;
        diffFilePath: string;
        fileName: string;
        size: {
            actual: { width: number; height: number };
            baseline: { width: number; height: number };
            diff?: { width: number; height: number };
        };
    };
    misMatchPercentage: string;
    rawMisMatchPercentage: number;
}

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
}: {
        boundingBoxes: {
            diffBoundingBoxes: BoundingBox[];
            ignoredBoxes: IgnoreBoxes[],
        }
        data: CompareData;
        folders: {
            actualFolderPath: string;
            baselineFolderPath: string;
            diffFolderPath: string;
        }
        fileName: string;
        size: {
            actual: { width: number; height: number };
            baseline: { width: number; height: number };
            diff?: { width: number; height: number };
        };
        testContext: TestContext
}) {
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

