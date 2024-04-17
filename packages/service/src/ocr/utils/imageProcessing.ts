import logger from '@wdio/logger'
import Jimp from 'jimp'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DrawHighlightedWords, ProcessImage, ProcessImageOptions, TargetOptions } from '../types.js'

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

export async function drawHighlightedWords({ filePath, highlights }: DrawHighlightedWords) {
    try {
        const image = await Jimp.read(filePath)
        const highlightColor = { r: 57, g: 170, b: 86, a: 0.5 }

        highlights.forEach(({ left, right, top, bottom }) => {
            const width = right - left
            const height = bottom - top

            // Apply the semi-transparent highlight
            for (let y = top; y < top + height; y++) {
                for (let x = left; x < left + width; x++) {
                    // Get the current pixel color
                    const currentColor = image.getPixelColor(x, y)
                    const rgba = Jimp.intToRGBA(currentColor)

                    // Calculate new color values using simple alpha blending
                    const newR = (highlightColor.r * highlightColor.a) + (rgba.r * (1 - highlightColor.a))
                    const newG = (highlightColor.g * highlightColor.a) + (rgba.g * (1 - highlightColor.a))
                    const newB = (highlightColor.b * highlightColor.a) + (rgba.b * (1 - highlightColor.a))
                    const newA = rgba.a // Use original alpha to maintain image integrity

                    // Set the new pixel color
                    image.setPixelColor(Jimp.rgbaToInt(newR, newG, newB, newA), x, y)
                }
            }
        })

        await image.writeAsync(filePath)
    } catch (error) {
        log.error('Failed to highlight words on image:', error)
    }
}
