import { resolve as pathResolve } from 'node:path'
import { writeFileSync } from 'node:fs'
import type { BoundingBox } from './images.interfaces.js'
import type { CompareData } from 'src/resemble/compare.interfaces.js'
import { processDiffPixels } from './pixelDiffProcessing.js'

export function processAndWriteDiffPixels({
    diffFolderPath,
    data,
    fileName,
    proximity,
}: {
    diffFolderPath: string;
    data: CompareData;
    fileName: string;
    proximity: number;
}): BoundingBox[] {
    const { diffBounds, diffPixels, misMatchPercentage, rawMisMatchPercentage } = data
    const jsonFileName = fileName.split('.').slice(0, -1).join('.')
    const jsonFilePath = pathResolve(diffFolderPath, `${jsonFileName}.json`)
    const boundingBoxes = processDiffPixels(diffPixels, proximity)
    const jsonData = {
        boundingBoxes,
        diffBounds,
        misMatchPercentage,
        rawMisMatchPercentage,
    }

    writeFileSync(jsonFilePath, JSON.stringify(jsonData), 'utf8')

    return boundingBoxes
}

