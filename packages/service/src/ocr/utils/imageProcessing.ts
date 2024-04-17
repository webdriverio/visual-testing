import logger from '@wdio/logger'
import Jimp from 'jimp'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ProcessImage, ProcessImageOptions, TargetOptions } from '../types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const log = logger('@wdio/visual-service:ocr:imageProcessing')

export async function processImage({ contrast, elementRectangles, isAndroid, isIOS, ocrImagesPath, screenshot }:ProcessImageOptions
): Promise<ProcessImage>{
    const image = await Jimp.read(Buffer.from(screenshot, 'base64'))
    image.greyscale()
    image.contrast(contrast)
    const timestamp = new Date().getTime()
    const platform = isAndroid ? 'android' : isIOS ? 'ios' : 'desktop'
    let fileName = `${platform}-${timestamp}.png`
    let filePath = join(ocrImagesPath, fileName)
    const screenshotSize = { width: image.bitmap.width, height: image.bitmap.height }

    if (elementRectangles) {
        // Make sure it doesn't crop outside of the screenshot
        const cropX = Math.max(0, elementRectangles.x)
        const cropY = Math.max(0, elementRectangles.y)
        const cropWidth = Math.min(elementRectangles.width, screenshotSize.width - cropX)
        const cropHeight = Math.min(elementRectangles.height, screenshotSize.height - cropY)

        image.crop(cropX, cropY, cropWidth, cropHeight)
        fileName = `${platform}-${timestamp}-cropped.png`
        filePath = join(ocrImagesPath, fileName)
    }

    await image.writeAsync(filePath)

    return { filePath }
}

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
