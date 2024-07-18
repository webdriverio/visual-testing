import { resolve as pathResolve } from 'node:path'
import { writeFileSync } from 'node:fs'
import type { BoundingBox, IgnoreBoxes } from './images.interfaces.js'
import type { CompareData } from 'src/resemble/compare.interfaces.js'
import type { TestContext } from 'src/commands/check.interfaces.js'

export function createCompareReport({
    boundingBoxes,
    data,
    fileName,
    folders,
    testContext:{ parent, title },
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
        testContext: TestContext
}) {
    const { misMatchPercentage, rawMisMatchPercentage } = data
    const jsonFileName = fileName.split('.').slice(0, -1).join('.')
    const jsonFilePath = pathResolve(folders.actualFolderPath, `${jsonFileName}.json`)
    const jsonData = {
        [parent]: {
            test: title,
            boundingBoxes,
            fileData: {
                actualFilePath: pathResolve(folders.actualFolderPath, fileName),
                baselineFilePath: pathResolve(folders.baselineFolderPath, fileName),
                diffFilePath: pathResolve(folders.diffFolderPath, fileName),
                fileName,
            },
            misMatchPercentage,
            rawMisMatchPercentage,
        }
    }

    writeFileSync(jsonFilePath, JSON.stringify(jsonData), 'utf8')
}

