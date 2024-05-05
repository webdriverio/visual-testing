import { join } from 'node:path'
import logger from '@wdio/logger'
import { browser as wdioBrowser } from '@wdio/globals'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import getData from '../../src/utils/getData.js'
import * as Tesseract from '../../src/utils/tesseract.js'
import * as ImageProcessing from '../../src/utils/imageProcessing.js'
import { adjustElementBbox, getScreenshotSize, isRectanglesObject } from '../../src/utils/index.js'

const browser = wdioBrowser
const log = logger('test')
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))

vi.mock('../../src/utils/tesseract.js')
vi.mock('../../src/utils/imageProcessing.js')
vi.mock('../../src/utils/index.js')
vi.mock('webdriver-image-comparison/dist/helpers/utils', () => ({
    getScreenshotSize: vi.fn(() => ({ width: 1200 })),
}))
vi.mock('../../src/utils/tesseract.js', () => ({
    getNodeOcrData: vi.fn().mockResolvedValue({
        text: 'Sample OCR text',
        lines: [],
        words: []
    }),
    getSystemOcrData: vi.fn().mockResolvedValue({
        text: 'Sample OCR text',
        lines: [{ text: 'Sample OCR text', bbox: { left: 1, right: 1, top: 1, bottom: 1 } }],
        words: [
            { text: 'Sample', bbox: { left: 1, right: 1, top: 1, bottom: 1 } },
            { text: 'OCR', bbox: { left: 2, right: 2, top: 2, bottom: 2 } },
            { text: 'text', bbox: { left: 3, right: 3, top: 3, bottom: 3 } },
        ]
    })
}))
vi.mock('../../src/utils/imageProcessing.js', () => ({
    processImage: vi.fn().mockResolvedValue({ filePath: '/fake/path/image.png' }),
    drawHighlightedWords: vi.fn().mockResolvedValue('')
}))
vi.mock('@wdio/globals', () => ({
    browser: {
        isAndroid: false,
        isIOS: false,
        getElementRect:vi.fn().mockResolvedValue({ x: 10, y: 20, width: 300, height: 400 }),
        getScreenshotSize:vi.fn().mockReturnValue({ width: 1200 }),
        getWindowSize: vi.fn().mockResolvedValue({ width: 1200, height: 800 }),
        takeScreenshot:vi.fn().mockResolvedValue('screenshotData'),
    }
}))

describe('getData', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('processes OCR data correctly using system Tesseract when available', async () => {
        const logInfoMock = vi.spyOn(log, 'info')
        const options = {
            contrast: 1.0,
            isTesseractAvailable: true,
            language: 'ENG',
            ocrImagesPath: '/fake/ocr/path'
        }
        vi.mocked(getScreenshotSize).mockReturnValue({ height: 1200, width: 1200 })

        const result = await getData(options)

        expect(browser.getWindowSize).toHaveBeenCalled()
        expect(browser.takeScreenshot).toHaveBeenCalled()
        expect(getScreenshotSize).toHaveBeenCalledWith('screenshotData')
        expect(isRectanglesObject).not.toHaveBeenCalled()
        expect(ImageProcessing.processImage).toHaveBeenCalledTimes(1)
        expect(Tesseract.getSystemOcrData).toHaveBeenCalledWith({
            filePath: '/fake/path/image.png',
            language: 'ENG'
        })
        expect(adjustElementBbox).not.toHaveBeenCalled()
        expect(logInfoMock.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('processes OCR data correctly using NodeJS Tesseract', async () => {
        const logInfoMock = vi.spyOn(log, 'info')
        const options = {
            contrast: 1.0,
            isTesseractAvailable: false,
            language: 'ENG',
            ocrImagesPath: '/fake/ocr/path'
        }
        vi.mocked(getScreenshotSize).mockReturnValue({ height: 1200, width: 1200 })

        const result = await getData(options)

        expect(browser.getWindowSize).toHaveBeenCalled()
        expect(browser.takeScreenshot).toHaveBeenCalled()
        expect(getScreenshotSize).toHaveBeenCalledWith('screenshotData')
        expect(isRectanglesObject).not.toHaveBeenCalled()
        expect(ImageProcessing.processImage).toHaveBeenCalledTimes(1)
        expect(Tesseract.getNodeOcrData).toHaveBeenCalledWith({
            filePath: '/fake/path/image.png',
            language: 'ENG'
        })
        expect(adjustElementBbox).not.toHaveBeenCalled()
        expect(logInfoMock.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('processes OCR data correctly using a haystack', async () => {
        const logInfoMock = vi.spyOn(log, 'info')
        const options = {
            contrast: 1.0,
            isTesseractAvailable: true,
            haystack: { x: 5, y: 5, width: 50, height: 50 },
            language: 'ENG',
            ocrImagesPath: '/fake/ocr/path'
        }
        vi.mocked(getScreenshotSize).mockReturnValue({ height: 1200, width: 1200 })

        const result = await getData(options)

        expect(browser.getWindowSize).toHaveBeenCalled()
        expect(browser.takeScreenshot).toHaveBeenCalled()
        expect(getScreenshotSize).toHaveBeenCalledWith('screenshotData')
        expect(isRectanglesObject).toHaveBeenCalledTimes(1)
        expect(ImageProcessing.processImage).toHaveBeenCalledTimes(2)
        expect(Tesseract.getSystemOcrData).toHaveBeenCalledWith({
            filePath: '/fake/path/image.png',
            language: 'ENG'
        })
        expect(adjustElementBbox).toHaveBeenCalledTimes(4)
        expect(logInfoMock.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle haystack that requires fetching RectReturn from browser.getElementRect', async () => {
        const logInfoMock = vi.spyOn(log, 'info')
        const options = {
            contrast: 1.0,
            isTesseractAvailable: true,
            language: 'ENG',
            ocrImagesPath: '/fake/ocr/path',
            haystack: { elementId: 'element123' } as WebdriverIO.Element
        }
        // @ts-ignore
        isRectanglesObject.mockReturnValue(false)
        browser.getElementRect = vi.fn().mockResolvedValue({ x: 10, y: 20, width: 300, height: 400 })
        const result = await getData(options)

        expect(isRectanglesObject).toHaveBeenCalledWith(options.haystack)
        expect(browser.getElementRect).toHaveBeenCalledWith('element123')
        expect(result).toHaveProperty('filePath', '/fake/path/image.png')
        expect(logInfoMock.mock.calls).toMatchSnapshot()
    })

    it('handles errors when screenshot capture fails', async () => {
        const options = {
            contrast: 1.0,
            haystack: { x: 5, y: 5, width: 50, height: 50 },
            isTesseractAvailable: true,
            language: 'ENG',
            ocrImagesPath: '/fake/ocr/path'
        }
        browser.takeScreenshot = vi.fn().mockRejectedValue(new Error('Failed to take screenshot'))

        await expect(getData(options)).rejects.toThrow('Failed to take screenshot')
    })
})
