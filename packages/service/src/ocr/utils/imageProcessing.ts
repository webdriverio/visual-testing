import logger from '@wdio/logger'
import Jimp from 'jimp'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { TargetOptions } from '../types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const log = logger('@wdio/visual-service:ocr:imageProcessing')

export async function drawTarget({ filePath, targetX, targetY }: TargetOptions) {
    try {
        const targetImagePath = join(__dirname, '..', '..', '..', 'assets', 'target.png')
        const [sourceImage, targetImage] = await Promise.all([
            Jimp.read(filePath),
            Jimp.read(targetImagePath)
        ])
        const xPosition = targetX - (targetImage.bitmap.width / 2)
        const yPosition = targetY - (targetImage.bitmap.height / 2)
        sourceImage.composite(targetImage, xPosition, yPosition)
        await sourceImage.writeAsync(filePath)
    } catch (error) {
        log.error('Failed to draw target on image:', error)
    }
}
