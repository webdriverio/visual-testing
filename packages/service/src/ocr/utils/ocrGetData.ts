import logger from '@wdio/logger'
import { browser } from '@wdio/globals'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import Jimp from 'jimp'
import { getScreenshotSize } from 'webdriver-image-comparison/dist/helpers/utils.js'
import { addBlockOuts, saveBase64Image } from 'webdriver-image-comparison/dist/methods/images.js'
import { getNodeOcrData } from './tesseract.js'
import type { GetOcrData, OcrGetData, OcrGetDataOptions } from '../types.js'

const log = logger('@wdio/visual-service:ocrGetData')

export default async function ocrGetData(options: OcrGetDataOptions): Promise<OcrGetData> {
    const {
        element,
        isTesseractAvailable,
        language,
        ocrImagesPath,
    } = options

    try {
        const screenSize = await driver.getWindowSize()
        const screenshot = await driver.takeScreenshot()
        const { height, width } = getScreenshotSize(screenshot)
        const dpr = width / screenSize.width

        // Make it grey which will be better for OCR
        const image = await Jimp.read(Buffer.from(screenshot, 'base64'))
        image.greyscale()
        // TODO: Make this configurable? Think of different options?
        image.contrast(0.25)
        const greyscaleImage = (await image.getBufferAsync(Jimp.MIME_PNG)).toString('base64')

        const fileName = `${browser.isAndroid ? 'android' : browser.isIOS ? 'ios': 'desktop'}-${new Date().getTime()}.png`
        const filePath = join(ocrImagesPath, fileName)
        writeFileSync(filePath, greyscaleImage, { encoding: 'base64' })

        // Get the element rect if an element is provided, otherwise use the full image to be scanned
        let rectangle = { top: 0, left: 0, width, height }
        if (element) {
            const elementRect = await browser.getElementRect((await element).elementId)
            rectangle = { top: elementRect.y, left: elementRect.x, width: elementRect.width, height: elementRect.height }
        }

        // OCR the image
        let ocrData: any
        const start = process.hrtime()

        if (isTesseractAvailable) {
            log.info('Using system installed version of Tesseract')
        } else {
            log.info('Using NodeJS version of Tesseract')
            ocrData = await getNodeOcrData({ filePath, language: language, rectangle })
        }

        const diff = process.hrtime(start)
        const processTime = ((diff[0] * 1000000 + diff[1] / 1000) / 1000000).toFixed(3)

        log.info(`It took '${processTime}s' to process the image.`)
        log.info(
            `The following text was found through OCR:\n\n${ocrData.text.replace(
                /[\r\n]{2,}/g,
                '\n'
            )}`
        )

        // Get all words and highlight them
        const highlights = (ocrData as GetOcrData).words.map((word) => word.bbox)
        const highlightedImage = await addBlockOuts(greyscaleImage, highlights)
        await saveBase64Image(highlightedImage, filePath)

        log.info(`OCR Image with found text can be found here:\n\n${filePath}`)

        const parsedOcrData = {
            ...ocrData,
            ...{ dpr },
        }

        return parsedOcrData

    } catch (e) {
        throw new Error(String(e))
    }

}
