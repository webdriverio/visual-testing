import logger from '@wdio/logger'
import { getNodeOcrData, getSystemOcrData } from './tesseract.js'
import type { GetOcrData, Line, GetData, GetDataOptions, RectReturn, Words } from '../types.js'
import { adjustElementBbox, getBase64ScreenshotSize, isRectanglesObject } from './index.js'
import { drawHighlightedWords, processImage } from './imageProcessing.js'

const log = logger('@wdio/ocr-service:getData')

export default async function getData(browser: WebdriverIO.Browser, options: GetDataOptions): Promise<GetData> {
    const {
        contrast,
        cliFile,
        haystack,
        isTesseractAvailable,
        language,
        ocrImagesPath,
    } = options

    try {
        let dpr = 1
        let screenshot
        if (!cliFile) {
            const screenSize = await browser.getWindowSize()
            screenshot = await browser.takeScreenshot()
            const { width } = getBase64ScreenshotSize(screenshot)
            dpr = width / screenSize.width
        } else {
            screenshot = cliFile
        }
        const { filePath } = await processImage({ contrast, isAndroid: browser.isAndroid, isIOS: browser.isIOS, ocrImagesPath, screenshot })
        let elementRectangles
        let croppedFilePath

        if (haystack) {
            elementRectangles = isRectanglesObject(haystack) ? haystack as RectReturn : await browser.getElementRect((await haystack as WebdriverIO.Element).elementId)
            croppedFilePath = (await processImage({
                contrast,
                elementRectangles,
                isAndroid: cliFile ? false : browser.isAndroid,
                isIOS: cliFile ? false : browser.isIOS,
                ocrImagesPath,
                screenshot,
            })).filePath
        }

        // OCR the image
        let ocrData: GetOcrData
        const start = process.hrtime()

        if (isTesseractAvailable) {
            log.info('Using system installed version of Tesseract')
            ocrData = await getSystemOcrData({ filePath: croppedFilePath || filePath, language })
        } else {
            log.info('Using NodeJS version of Tesseract')
            ocrData = await getNodeOcrData({ filePath: croppedFilePath || filePath, language })
        }

        if (haystack && elementRectangles) {
            ocrData.lines.forEach((line:Line) => {
                line.bbox = adjustElementBbox(line.bbox, elementRectangles)
            })

            ocrData.words.forEach((word:Words) => {
                word.bbox = adjustElementBbox(word.bbox, elementRectangles)
            })
        }

        const diff = process.hrtime(start)
        const processTime = ((diff[0] * 1000000 + diff[1] / 1000) / 1000000).toFixed(3)

        log.info(`It took '${processTime}s' to process the image.`)
        log.info(`The following text was found through OCR:\n\n${ocrData.text.replace(/[\r\n]{2,}/g, '\n')}`)

        // Get all words and highlight them
        const highlights = ocrData.words.map((word) => word.bbox)
        await drawHighlightedWords({ filePath, highlights })

        log.info(`OCR Image with found text can be found here:\n\n${filePath}`)

        return {
            dpr,
            filePath,
            ...ocrData,
        }
    } catch (e) {
        throw new Error(String(e))
    }
}
