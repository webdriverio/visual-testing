import { join } from 'node:path'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import logger from '@wdio/logger'
import { drawHighlightedWords, drawTarget, processImage } from '../../src/utils/imageProcessing.js'

vi.mock('jimp', () => {
    const mockJimpInstance = {
        bitmap: { width: 100, height: 100 },
        composite: vi.fn().mockReturnThis(),
        contrast: vi.fn().mockReturnThis(),
        crop: vi.fn().mockReturnThis(),
        getPixelColor: vi.fn(() => 0xFFFFFFFF),
        greyscale: vi.fn().mockReturnThis(),
        setPixelColor: vi.fn(),
        writeAsync: vi.fn().mockResolvedValue('foo'),
    }
    const mockTargetJimpInstance = {
        ...mockJimpInstance,
        bitmap: { width: 50, height: 50 }
    }
    const mockRead = vi.fn((filePath) => {
        if (filePath.includes('target.png')) {
            return Promise.resolve(mockTargetJimpInstance)
        } else if (filePath === 'path/that/fails') {
            return Promise.reject(new Error('Failed to load image'))
        }

        return Promise.resolve(mockJimpInstance)
    })
    const intToRGBA = vi.fn(() => ({ r: 255, g: 255, b: 255, a: 1 }))
    const rgbaToInt = vi.fn(() => 0x391aa56a)

    return {
        default: {
            intToRGBA,
            read: mockRead,
            rgbaToInt,
        }
    }
})

const log = logger('test')
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))

describe('processImage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('processes and writes an image without cropping', async () => {
        const options = {
            contrast: 0.5,
            isAndroid: false,
            isIOS:false,
            ocrImagesPath: '/fake/path',
            screenshot: Buffer.from('fakeimage', 'base64').toString('base64')
        }
        const Jimp = (await import('jimp')).default
        const mockJimpInstance = await Jimp.read(Buffer.from(options.screenshot, 'base64'))
        const result = await processImage(options)

        expect(Jimp.read).toHaveBeenCalledWith(Buffer.from(options.screenshot, 'base64'))

        expect(mockJimpInstance.greyscale).toHaveBeenCalled()
        expect(mockJimpInstance.contrast).toHaveBeenCalledWith(options.contrast)
        expect(mockJimpInstance.writeAsync).toHaveBeenCalledWith(expect.stringContaining(options.ocrImagesPath))
        expect(result.filePath).toContain(`${options.ocrImagesPath}/desktop-`)
    })

    it('handles cases when Android is specified', async () => {
        const options = {
            contrast: 0.5,
            isAndroid: true,
            isIOS: false,
            ocrImagesPath: '/fake/path',
            screenshot: Buffer.from('fakeimage', 'base64').toString('base64')
        }
        const result = await processImage(options)

        expect(result.filePath).toContain('/fake/path/android-')
    })

    it('handles cases when iOS is specified', async () => {
        const options = {
            contrast: 0.5,
            isAndroid: false,
            isIOS: true,
            ocrImagesPath: '/fake/path',
            screenshot: Buffer.from('fakeimage', 'base64').toString('base64')
        }
        const result = await processImage(options)

        expect(result.filePath).toContain(`${options.ocrImagesPath}/ios-`)
    })

    it('ensures cropping stays withing image dimensions', async () => {
        const options = {
            contrast: 0.5,
            isAndroid: false,
            isIOS: false,
            ocrImagesPath: '/fake/path',
            screenshot: Buffer.from('fakeimage', 'base64').toString('base64'),
            elementRectangles: { x: 5, y: 10, width: 25, height: 20 }
        }

        const Jimp = (await import('jimp')).default
        const mockJimpInstance = await Jimp.read(Buffer.from(options.screenshot, 'base64'))
        const result = await processImage(options)

        expect(mockJimpInstance.crop).toHaveBeenCalledWith(5, 10, 25, 20)
        expect(mockJimpInstance.writeAsync).toHaveBeenCalledWith(expect.stringContaining(options.ocrImagesPath))
        expect(result.filePath).toContain(`${options.ocrImagesPath}/desktop-`)
    })

    it('ensures cropping does not exceed image dimensions', async () => {
        const options = {
            contrast: 0.5,
            isAndroid: false,
            isIOS: false,
            ocrImagesPath: '/fake/path',
            screenshot: Buffer.from('fakeimage', 'base64').toString('base64'),
            elementRectangles: { x: 5, y: 10, width: 200, height: 200 }
        }
        const Jimp = (await import('jimp')).default
        const mockJimpInstance = await Jimp.read(Buffer.from(options.screenshot, 'base64'))
        const result = await processImage(options)

        expect(mockJimpInstance.crop).toHaveBeenCalledWith(5, 10, 95, 90)
        expect(mockJimpInstance.writeAsync).toHaveBeenCalledWith(expect.stringContaining(options.ocrImagesPath))
        expect(result.filePath).toContain(`${options.ocrImagesPath}/desktop-`)
    })
})

describe('drawTarget', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('composites a target image onto a source image at the correct position and saves it', async () => {
        const targetOptions = {
            filePath: '/path/to/source.png',
            targetX: 75,
            targetY: 75
        }

        const Jimp = (await import('jimp')).default
        const mockJimpInstance = await Jimp.read(Buffer.from('fakeimage', 'base64'))

        await drawTarget(targetOptions)

        expect(Jimp.read).toHaveBeenCalledWith(targetOptions.filePath)
        expect(Jimp.read).toHaveBeenCalledWith(expect.stringContaining('target.png'))

        const expectedXPosition = 50
        const expectedYPosition = 50
        expect(mockJimpInstance.composite).toHaveBeenCalledWith(expect.any(Object), expectedXPosition, expectedYPosition)
        expect(mockJimpInstance.writeAsync).toHaveBeenCalledWith(targetOptions.filePath)
    })

    it('logs an error if the operation fails', async () => {
        const logErrorMock = vi.spyOn(log, 'error')
        const targetOptions = {
            filePath: 'path/that/fails',
            targetX: 75,
            targetY: 75
        }

        await drawTarget(targetOptions)
        expect(logErrorMock).toHaveBeenCalledWith('Failed to draw target on image:', expect.any(Error))
    })
})

describe('drawHighlightedWords', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('applies highlights to specified areas of the image and saves it', async () => {
        const filePath = '/path/to/image.png'
        const highlights = [{ left: 10, right: 20, top: 10, bottom: 20 }]

        await drawHighlightedWords({ filePath, highlights })

        const Jimp = (await import('jimp')).default
        const mockJimpInstance = await Jimp.read(Buffer.from('fakeimage', 'base64'))

        expect(Jimp.read).toHaveBeenCalledWith(filePath)
        expect(mockJimpInstance.getPixelColor).toHaveBeenCalledTimes(100)
        expect(Jimp.intToRGBA).toHaveBeenCalledTimes(100)
        expect(Jimp.rgbaToInt).toHaveBeenCalledTimes(100)
        expect(mockJimpInstance.setPixelColor).toHaveBeenCalledTimes(100)
        expect(mockJimpInstance.writeAsync).toHaveBeenCalledWith(filePath)
    })

    it('logs an error if the operation fails', async () => {
        const filePath = 'path/that/fails'
        const highlights = [{ left: 10, right: 20, top: 10, bottom: 20 }]
        const logErrorMock = vi.spyOn(log, 'error')

        await drawHighlightedWords({ filePath, highlights })

        expect(logErrorMock).toHaveBeenCalledWith('Failed to highlight words on image:', expect.any(Error))
    })
})
