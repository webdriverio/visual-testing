import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'
import { promises as fsPromises, readFileSync, writeFileSync } from 'node:fs'
import logger from '@wdio/logger'
import { DEFAULT_RESIZE_DIMENSIONS } from '../helpers/constants.js'
import {
    checkIfImageExists,
    removeDiffImageIfExists,
    checkBaselineImageExists,
    getRotatedImageIfNeeded,
    logDimensionWarning,
    getAdjustedAxis,
    handleIOSBezelCorners,
    cropAndConvertToDataURL,
    makeCroppedBase64Image,
    makeFullPageBase64Image,
    rotateBase64Image,
    takeResizedBase64Screenshot,
} from './images.js'
import type { WicElement } from '../commands/element.interfaces.js'

const log = logger('test')

vi.mock('jimp', () => ({
    Jimp: Object.assign(vi.fn().mockImplementation(() => ({
        composite: vi.fn().mockReturnThis(),
        getBase64: vi.fn().mockResolvedValue('data:image/png;base64,mockImageData'),
        opacity: vi.fn().mockReturnThis(),
        rotate: vi.fn().mockReturnThis(),
        crop: vi.fn().mockReturnThis(),
    })), {
        read: vi.fn(),
        MIME_PNG: 'image/png',
    }),
    JimpMime: {
        png: 'image/png',
    },
}))
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))
vi.mock('node:fs', async () => {
    const actual = await vi.importActual('node:fs')
    return {
        ...actual,
        promises: {
            access: vi.fn(),
            unlink: vi.fn(),
        },
        readFileSync: vi.fn(),
        writeFileSync: vi.fn(),
        constants: {
            R_OK: 4,
        },
    }
})
vi.mock('../helpers/utils.js', () => ({
    getBase64ScreenshotSize: vi.fn(),
    getAndCreatePath: vi.fn(),
    getIosBezelImageNames: vi.fn(),
    updateVisualBaseline: vi.fn(),
    calculateDprData: vi.fn(),
}))
vi.mock('../helpers/constants.js', () => ({
    DEFAULT_RESIZE_DIMENSIONS: { top: 0, right: 0, bottom: 0, left: 0 },
    supportedIosBezelDevices: [
        'iphonex', 'iphonexs', 'iphonexsmax', 'iphonexr', 'iphone11', 'iphone11pro', 'iphone11promax',
        'iphone12', 'iphone12mini', 'iphone12pro', 'iphone12promax', 'iphone13', 'iphone13mini',
        'iphone13pro', 'iphone13promax', 'iphone14', 'iphone14plus', 'iphone14pro', 'iphone14promax',
        'iphone15', 'ipadmini', 'ipadair', 'ipadpro11', 'ipadpro129'
    ],
}))
vi.mock('./rectangles.js', () => ({
    isWdioElement: vi.fn(),
    determineStatusAddressToolBarRectangles: vi.fn(),
}))
vi.mock('./screenshots.js', () => ({
    takeBase64Screenshot: vi.fn(),
}))

describe('checkIfImageExists', () => {
    let accessSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        accessSpy = vi.spyOn(fsPromises, 'access')
    })

    afterEach(() => {
        vi.clearAllMocks()
        accessSpy.mockRestore()
    })

    it('should return true when file exists', async () => {
        accessSpy.mockResolvedValue(undefined)

        const result = await checkIfImageExists('/path/to/image.png')

        expect(result).toMatchSnapshot()
    })

    it('should return false when file does not exist', async () => {
        accessSpy.mockRejectedValue(new Error('File not found'))

        const result = await checkIfImageExists('/path/to/image.png')

        expect(result).toMatchSnapshot()
    })
})

describe('removeDiffImageIfExists', () => {
    let accessSpy: ReturnType<typeof vi.spyOn>
    let unlinkSpy: ReturnType<typeof vi.spyOn>
    let logInfoSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        accessSpy = vi.spyOn(fsPromises, 'access')
        unlinkSpy = vi.spyOn(fsPromises, 'unlink')
        logInfoSpy = vi.spyOn(log, 'info').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.clearAllMocks()
        accessSpy.mockRestore()
        unlinkSpy.mockRestore()
        logInfoSpy.mockRestore()
    })

    // Note: We mock fsPromises.access here because removeDiffImageIfExists calls checkIfImageExists internally,
    // which in turn calls fsPromises.access. This allows us to test the real integration between the functions
    // without artificial mocking of internal dependencies.

    it('should remove file when it exists', async () => {
        accessSpy.mockResolvedValue(undefined)
        unlinkSpy.mockResolvedValue(undefined)

        await removeDiffImageIfExists('/path/to/diff.png')

        expect(accessSpy).toHaveBeenCalledWith('/path/to/diff.png', 4)
        expect(unlinkSpy).toHaveBeenCalledWith('/path/to/diff.png')
        expect(logInfoSpy).toHaveBeenCalledWith('Successfully removed the diff image before comparing at /path/to/diff.png')
    })

    it('should do nothing when file does not exist', async () => {
        accessSpy.mockRejectedValue(new Error('File not found'))

        await removeDiffImageIfExists('/path/to/diff.png')

        expect(accessSpy).toHaveBeenCalledWith('/path/to/diff.png', 4)
        expect(unlinkSpy).not.toHaveBeenCalled()
        expect(logInfoSpy).not.toHaveBeenCalled()
    })

    it('should throw error when file exists but cannot be removed', async () => {
        accessSpy.mockResolvedValue(undefined)
        const unlinkError = new Error('Permission denied')
        unlinkSpy.mockRejectedValue(unlinkError)

        await expect(removeDiffImageIfExists('/path/to/diff.png')).rejects.toThrow(
            'Could not remove the diff image. The following error was thrown: Error: Permission denied'
        )

        expect(accessSpy).toHaveBeenCalledWith('/path/to/diff.png', 4)
        expect(unlinkSpy).toHaveBeenCalledWith('/path/to/diff.png')
        expect(logInfoSpy).not.toHaveBeenCalled()
    })
})

describe('checkBaselineImageExists', () => {
    let accessSpy: ReturnType<typeof vi.spyOn>
    let logInfoSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        accessSpy = vi.spyOn(fsPromises, 'access')
        logInfoSpy = vi.spyOn(log, 'info').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.clearAllMocks()
        accessSpy.mockRestore()
        logInfoSpy.mockRestore()
    })

    it('should do nothing when baseline exists and no flags are set', async () => {
        accessSpy.mockResolvedValue(undefined)

        await checkBaselineImageExists({
            actualFilePath: '/path/to/actual.png',
            baselineFilePath: '/path/to/baseline.png'
        })

        expect(accessSpy).toHaveBeenCalledWith('/path/to/baseline.png', 4)
        expect(logInfoSpy).not.toHaveBeenCalled()
    })

    it('should auto-save baseline when file does not exist and autoSaveBaseline is true', async () => {
        accessSpy.mockRejectedValue(new Error('File not found'))
        vi.mocked(readFileSync).mockReturnValue(Buffer.from('image data'))
        vi.mocked(writeFileSync).mockImplementation(() => {})

        await checkBaselineImageExists({
            actualFilePath: '/path/to/actual.png',
            baselineFilePath: '/path/to/baseline.png',
            autoSaveBaseline: true
        })

        expect(accessSpy).toHaveBeenCalledWith('/path/to/baseline.png', 4)
        expect(vi.mocked(readFileSync)).toHaveBeenCalledWith('/path/to/actual.png')
        expect(vi.mocked(writeFileSync)).toHaveBeenCalledWith('/path/to/baseline.png', Buffer.from('image data'))
        expect(logInfoSpy.mock.calls).toMatchSnapshot()
    })

    it('should update baseline when updateBaseline is true', async () => {
        vi.mocked(readFileSync).mockReturnValue(Buffer.from('image data'))
        vi.mocked(writeFileSync).mockImplementation(() => {})

        await checkBaselineImageExists({
            actualFilePath: '/path/to/actual.png',
            baselineFilePath: '/path/to/baseline.png',
            updateBaseline: true
        })

        expect(vi.mocked(readFileSync)).toHaveBeenCalledWith('/path/to/actual.png')
        expect(vi.mocked(writeFileSync)).toHaveBeenCalledWith('/path/to/baseline.png', Buffer.from('image data'))
        expect(logInfoSpy.mock.calls).toMatchSnapshot()
    })

    it('should throw error when file does not exist and autoSaveBaseline is false', async () => {
        accessSpy.mockRejectedValue(new Error('File not found'))

        await expect(checkBaselineImageExists({
            actualFilePath: '/path/to/actual.png',
            baselineFilePath: '/path/to/baseline.png',
            autoSaveBaseline: false
        })).rejects.toThrow()

        expect(accessSpy).toHaveBeenCalledWith('/path/to/baseline.png', 4)
        expect(vi.mocked(readFileSync)).not.toHaveBeenCalled()
        expect(vi.mocked(writeFileSync)).not.toHaveBeenCalled()
        expect(logInfoSpy).not.toHaveBeenCalled()
    })

    it('should throw error when copying fails', async () => {
        accessSpy.mockRejectedValue(new Error('File not found'))
        const copyError = new Error('Permission denied')
        vi.mocked(readFileSync).mockImplementation(() => { throw copyError })

        await expect(checkBaselineImageExists({
            actualFilePath: '/path/to/actual.png',
            baselineFilePath: '/path/to/baseline.png',
            autoSaveBaseline: true
        })).rejects.toThrow()

        expect(accessSpy).toHaveBeenCalledWith('/path/to/baseline.png', 4)
        expect(vi.mocked(readFileSync)).toHaveBeenCalledWith('/path/to/actual.png')
        expect(vi.mocked(writeFileSync)).not.toHaveBeenCalled()
        expect(logInfoSpy).not.toHaveBeenCalled()
    })
})

describe('rotateBase64Image', () => {
    let jimpReadMock: ReturnType<typeof vi.fn>

    beforeEach(async () => {
        const jimp = await import('jimp')
        jimpReadMock = vi.mocked(jimp.Jimp.read)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should rotate image by specified degrees', async () => {
        const mockImage = {
            rotate: vi.fn().mockReturnThis(),
            getBase64: vi.fn().mockResolvedValue('data:image/png;base64,rotatedImageData')
        }
        jimpReadMock.mockResolvedValue(mockImage)

        const result = await rotateBase64Image({
            base64Image: 'originalImageData',
            degrees: 90
        })

        expect(result).toMatchSnapshot()
        expect(jimpReadMock.mock.calls).toMatchSnapshot()
        expect(mockImage.rotate.mock.calls).toMatchSnapshot()
        expect(mockImage.getBase64.mock.calls).toMatchSnapshot()
    })

    it('should rotate image by 180 degrees', async () => {
        const mockImage = {
            rotate: vi.fn().mockReturnThis(),
            getBase64: vi.fn().mockResolvedValue('data:image/png;base64,rotatedImageData')
        }
        jimpReadMock.mockResolvedValue(mockImage)

        const result = await rotateBase64Image({
            base64Image: 'originalImageData',
            degrees: 180
        })

        expect(result).toMatchSnapshot()
        expect(mockImage.rotate.mock.calls).toMatchSnapshot()
    })

    it('should handle different base64 input', async () => {
        const mockImage = {
            rotate: vi.fn().mockReturnThis(),
            getBase64: vi.fn().mockResolvedValue('data:image/png;base64,differentRotatedData')
        }
        jimpReadMock.mockResolvedValue(mockImage)

        const result = await rotateBase64Image({
            base64Image: 'differentImageData',
            degrees: 270
        })

        expect(result).toMatchSnapshot()
        expect(jimpReadMock.mock.calls).toMatchSnapshot()
        expect(mockImage.rotate.mock.calls).toMatchSnapshot()
    })
})

describe('getRotatedImageIfNeeded', () => {
    let getBase64ScreenshotSizeMock: ReturnType<typeof vi.fn>

    beforeEach(async () => {
        const utils = await import('../helpers/utils.js')

        getBase64ScreenshotSizeMock = vi.mocked(utils.getBase64ScreenshotSize)

        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should return original image when no rotation is needed', async () => {
        getBase64ScreenshotSizeMock.mockReturnValue({ width: 1920, height: 1080 })

        const result = await getRotatedImageIfNeeded({
            isWebDriverElementScreenshot: false,
            isLandscape: false,
            base64Image: 'originalImageData'
        })

        expect(result).toMatchSnapshot()
        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
    })

    it('should call rotateBase64Image when landscape and height > width', async () => {
        getBase64ScreenshotSizeMock.mockReturnValue({ width: 1080, height: 1920 })

        // We'll test that the function calls rotateBase64Image by checking the result
        // Since we can't easily mock the internal function, we'll verify the logic works
        const result = await getRotatedImageIfNeeded({
            isWebDriverElementScreenshot: false,
            isLandscape: true,
            base64Image: 'originalImageData'
        })

        expect(result).toMatchSnapshot()
        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
    })

    it('should not rotate when isWebDriverElementScreenshot is true', async () => {
        getBase64ScreenshotSizeMock.mockReturnValue({ width: 1080, height: 1920 })

        const result = await getRotatedImageIfNeeded({
            isWebDriverElementScreenshot: true,
            isLandscape: true,
            base64Image: 'originalImageData'
        })

        expect(result).toMatchSnapshot()
        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
    })

    it('should not rotate when width >= height', async () => {
        getBase64ScreenshotSizeMock.mockReturnValue({ width: 1920, height: 1080 })

        const result = await getRotatedImageIfNeeded({
            isWebDriverElementScreenshot: false,
            isLandscape: true,
            base64Image: 'originalImageData'
        })

        expect(result).toMatchSnapshot()
        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
    })

    it('should not rotate when not landscape', async () => {
        getBase64ScreenshotSizeMock.mockReturnValue({ width: 1080, height: 1920 })

        const result = await getRotatedImageIfNeeded({
            isWebDriverElementScreenshot: false,
            isLandscape: false,
            base64Image: 'originalImageData'
        })

        expect(result).toMatchSnapshot()
        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
    })
})

describe('logDimensionWarning', () => {
    let logWarnSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        logWarnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.clearAllMocks()
        logWarnSpy.mockRestore()
    })

    it('should log warning for LEFT type', () => {
        logDimensionWarning({
            dimension: 60,
            maxDimension: 1000,
            position: -10,
            type: 'LEFT'
        })

        expect(logWarnSpy.mock.calls).toMatchSnapshot()
    })

    it('should log warning for RIGHT type', () => {
        logDimensionWarning({
            dimension: 50,
            maxDimension: 1000,
            position: 1100,
            type: 'RIGHT'
        })

        expect(logWarnSpy.mock.calls).toMatchSnapshot()
    })

    it('should log warning for TOP type', () => {
        logDimensionWarning({
            dimension: 30,
            maxDimension: 800,
            position: -5,
            type: 'TOP'
        })

        expect(logWarnSpy.mock.calls).toMatchSnapshot()
    })

    it('should log warning for BOTTOM type', () => {
        logDimensionWarning({
            dimension: 40,
            maxDimension: 800,
            position: 850,
            type: 'BOTTOM'
        })

        expect(logWarnSpy.mock.calls).toMatchSnapshot()
    })
})

describe('getAdjustedAxis', () => {
    it('should return adjusted coordinates within bounds', () => {
        const result = getAdjustedAxis({
            length: 100,
            maxDimension: 1000,
            paddingEnd: 10,
            paddingStart: 5,
            start: 50,
            warningType: 'WIDTH'
        })

        expect(result).toMatchSnapshot()
    })

    it('should handle zero padding', () => {
        const result = getAdjustedAxis({
            length: 100,
            maxDimension: 1000,
            paddingEnd: 0,
            paddingStart: 0,
            start: 50,
            warningType: 'WIDTH'
        })

        expect(result).toMatchSnapshot()
    })

    it('should clamp start position to 0 when it goes below 0', () => {
        const result = getAdjustedAxis({
            length: 100,
            maxDimension: 1000,
            paddingEnd: 10,
            paddingStart: 60, // This will make adjustedStart = 50 - 60 = -10
            start: 50,
            warningType: 'WIDTH'
        })

        expect(result).toMatchSnapshot()
    })

    it('should clamp end position to maxDimension when it exceeds maxDimension', () => {
        const result = getAdjustedAxis({
            length: 100,
            maxDimension: 1000,
            paddingEnd: 50, // This will make adjustedEnd = 950 + 100 + 50 = 1100
            paddingStart: 10,
            start: 950,
            warningType: 'WIDTH'
        })

        expect(result).toMatchSnapshot()
    })

    it('should handle both start and end clamping', () => {
        const result = getAdjustedAxis({
            length: 100,
            maxDimension: 1000,
            paddingEnd: 50,
            paddingStart: 60,
            start: 50,
            warningType: 'WIDTH'
        })

        expect(result).toMatchSnapshot()
    })

    it('should handle HEIGHT warning type correctly', () => {
        const result = getAdjustedAxis({
            length: 100,
            maxDimension: 800,
            paddingEnd: 50,
            paddingStart: 60,
            start: 50,
            warningType: 'HEIGHT'
        })

        expect(result).toMatchSnapshot()
    })

    it('should handle edge case where start is exactly at maxDimension', () => {
        const result = getAdjustedAxis({
            length: 100,
            maxDimension: 1000,
            paddingEnd: 10,
            paddingStart: 0,
            start: 1000,
            warningType: 'WIDTH'
        })

        expect(result).toMatchSnapshot()
    })

    it('should handle edge case where start is 0', () => {
        const result = getAdjustedAxis({
            length: 100,
            maxDimension: 1000,
            paddingEnd: 10,
            paddingStart: 0,
            start: 0,
            warningType: 'WIDTH'
        })

        expect(result).toMatchSnapshot()
    })

    it('should handle large padding values', () => {
        const result = getAdjustedAxis({
            length: 50,
            maxDimension: 100,
            paddingEnd: 100,
            paddingStart: 100,
            start: 50,
            warningType: 'WIDTH'
        })

        expect(result).toMatchSnapshot()
    })

    it('should handle zero length', () => {
        const result = getAdjustedAxis({
            length: 0,
            maxDimension: 1000,
            paddingEnd: 10,
            paddingStart: 5,
            start: 50,
            warningType: 'WIDTH'
        })

        expect(result).toMatchSnapshot()
    })

    it('should handle negative start position', () => {
        const result = getAdjustedAxis({
            length: 100,
            maxDimension: 1000,
            paddingEnd: 10,
            paddingStart: 0,
            start: -10,
            warningType: 'WIDTH'
        })

        expect(result).toMatchSnapshot()
    })
})

describe('handleIOSBezelCorners', () => {
    let logWarnSpy: ReturnType<typeof vi.spyOn>
    let getIosBezelImageNamesMock: ReturnType<typeof vi.spyOn>
    let readFileSyncMock: ReturnType<typeof vi.spyOn>
    let getBase64ScreenshotSizeMock: ReturnType<typeof vi.spyOn>
    let mockImage: any

    beforeEach(async () => {
        logWarnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {})

        const utilsModule = vi.mocked(await import('../helpers/utils.js'))
        getIosBezelImageNamesMock = vi.spyOn(utilsModule, 'getIosBezelImageNames')
        getBase64ScreenshotSizeMock = vi.spyOn(utilsModule, 'getBase64ScreenshotSize')

        const fsModule = vi.mocked(await import('node:fs'))
        readFileSyncMock = vi.spyOn(fsModule, 'readFileSync')

        mockImage = {
            composite: vi.fn().mockReturnThis(),
            getBase64: vi.fn().mockResolvedValue('data:image/png;base64,mockImageData'),
            opacity: vi.fn().mockReturnThis(),
            rotate: vi.fn().mockReturnThis(),
        }
    })

    afterEach(() => {
        vi.clearAllMocks()
        logWarnSpy.mockRestore()
    })

    it('should do nothing when addIOSBezelCorners is false', async () => {
        await handleIOSBezelCorners({
            addIOSBezelCorners: false,
            image: mockImage,
            deviceName: 'iPhone 14 Pro',
            devicePixelRatio: 3,
            height: 844,
            isLandscape: false,
            width: 390,
        })

        expect(getIosBezelImageNamesMock).not.toHaveBeenCalled()
        expect(readFileSyncMock).not.toHaveBeenCalled()
        expect(logWarnSpy).not.toHaveBeenCalled()
    })

    it('should handle supported iPhone device', async () => {
        getIosBezelImageNamesMock.mockReturnValue({
            topImageName: 'iphone14pro-top',
            bottomImageName: 'iphone14pro-bottom'
        })
        readFileSyncMock.mockReturnValue('mockImageData')
        getBase64ScreenshotSizeMock.mockReturnValue({ width: 100, height: 50 })

        await handleIOSBezelCorners({
            addIOSBezelCorners: true,
            image: mockImage,
            deviceName: 'iPhone 14 Pro',
            devicePixelRatio: 3,
            height: 844,
            isLandscape: false,
            width: 390,
        })

        expect(getIosBezelImageNamesMock.mock.calls).toMatchSnapshot()
        expect(readFileSyncMock).toHaveBeenCalledTimes(2)
        expect(mockImage.composite).toHaveBeenCalledTimes(2)
        expect(logWarnSpy).not.toHaveBeenCalled()
    })

    it('should handle supported iPhone device in landscape mode', async () => {
        getIosBezelImageNamesMock.mockReturnValue({
            topImageName: 'iphone14pro-top',
            bottomImageName: 'iphone14pro-bottom'
        })
        readFileSyncMock.mockReturnValue('mockImageData')
        getBase64ScreenshotSizeMock.mockReturnValue({ width: 100, height: 50 })

        await handleIOSBezelCorners({
            addIOSBezelCorners: true,
            image: mockImage,
            deviceName: 'iPhone 14 Pro',
            devicePixelRatio: 3,
            height: 390,
            isLandscape: true,
            width: 844,
        })

        expect(getIosBezelImageNamesMock.mock.calls).toMatchSnapshot()
        expect(readFileSyncMock).toHaveBeenCalledTimes(2)
        expect(mockImage.composite).toHaveBeenCalledTimes(2)
        expect(logWarnSpy).not.toHaveBeenCalled()
    })

    it('should handle supported iPad device with sufficient dimensions', async () => {
        getIosBezelImageNamesMock.mockReturnValue({
            topImageName: 'ipadair-top',
            bottomImageName: 'ipadair-bottom'
        })
        readFileSyncMock.mockReturnValue('mockImageData')
        getBase64ScreenshotSizeMock.mockReturnValue({ width: 100, height: 50 })

        await handleIOSBezelCorners({
            addIOSBezelCorners: true,
            image: mockImage,
            deviceName: 'iPad Air',
            devicePixelRatio: 2,
            height: 2400, // 2400 / 2 = 1200 >= 1133
            isLandscape: false,
            width: 1600, // 1600 / 2 = 800 < 1133, but height meets requirement
        })

        expect(getIosBezelImageNamesMock.mock.calls).toMatchSnapshot()
        expect(readFileSyncMock).toHaveBeenCalledTimes(2)
        expect(mockImage.composite).toHaveBeenCalledTimes(2)
        expect(logWarnSpy).not.toHaveBeenCalled()
    })

    it('should not handle iPad device with insufficient dimensions', async () => {
        await handleIOSBezelCorners({
            addIOSBezelCorners: true,
            image: mockImage,
            deviceName: 'iPad Air',
            devicePixelRatio: 2,
            height: 800, // Below 1133 threshold
            isLandscape: false,
            width: 600,
        })

        expect(getIosBezelImageNamesMock).not.toHaveBeenCalled()
        expect(readFileSyncMock).not.toHaveBeenCalled()
        expect(logWarnSpy.mock.calls).toMatchSnapshot()
    })

    it('should handle device name normalization', async () => {
        getIosBezelImageNamesMock.mockReturnValue({
            topImageName: 'iphone14pro-top',
            bottomImageName: 'iphone14pro-bottom'
        })
        readFileSyncMock.mockReturnValue('mockImageData')
        getBase64ScreenshotSizeMock.mockReturnValue({ width: 100, height: 50 })

        await handleIOSBezelCorners({
            addIOSBezelCorners: true,
            image: mockImage,
            deviceName: 'iPhone 14 Pro Simulator (5th generation)',
            devicePixelRatio: 3,
            height: 844,
            isLandscape: false,
            width: 390,
        })

        expect(getIosBezelImageNamesMock.mock.calls).toMatchSnapshot()
        expect(readFileSyncMock).toHaveBeenCalledTimes(2)
        expect(mockImage.composite).toHaveBeenCalledTimes(2)
        expect(logWarnSpy).not.toHaveBeenCalled()
    })

    it('should handle unsupported device', async () => {
        await handleIOSBezelCorners({
            addIOSBezelCorners: true,
            image: mockImage,
            deviceName: 'iPhone 6',
            devicePixelRatio: 2,
            height: 667,
            isLandscape: false,
            width: 375,
        })

        expect(getIosBezelImageNamesMock).not.toHaveBeenCalled()
        expect(readFileSyncMock).not.toHaveBeenCalled()
        expect(logWarnSpy.mock.calls).toMatchSnapshot()
    })

    it('should handle missing bezel image names', async () => {
        getIosBezelImageNamesMock.mockReturnValue({
            topImageName: null,
            bottomImageName: null
        })

        await handleIOSBezelCorners({
            addIOSBezelCorners: true,
            image: mockImage,
            deviceName: 'iPhone 14 Pro',
            devicePixelRatio: 3,
            height: 844,
            isLandscape: false,
            width: 390,
        })

        expect(getIosBezelImageNamesMock.mock.calls).toMatchSnapshot()
        expect(readFileSyncMock).not.toHaveBeenCalled()
        expect(mockImage.composite).not.toHaveBeenCalled()
        expect(logWarnSpy.mock.calls).toMatchSnapshot()
    })

    it('should handle partial bezel image names', async () => {
        getIosBezelImageNamesMock.mockReturnValue({
            topImageName: 'iphone14pro-top',
            bottomImageName: null
        })

        await handleIOSBezelCorners({
            addIOSBezelCorners: true,
            image: mockImage,
            deviceName: 'iPhone 14 Pro',
            devicePixelRatio: 3,
            height: 844,
            isLandscape: false,
            width: 390,
        })

        expect(getIosBezelImageNamesMock.mock.calls).toMatchSnapshot()
        expect(readFileSyncMock).not.toHaveBeenCalled()
        expect(mockImage.composite).not.toHaveBeenCalled()
        expect(logWarnSpy.mock.calls).toMatchSnapshot()
    })

    it('should handle Android device (not iOS)', async () => {
        await handleIOSBezelCorners({
            addIOSBezelCorners: true,
            image: mockImage,
            deviceName: 'Samsung Galaxy S21',
            devicePixelRatio: 3,
            height: 2400,
            isLandscape: false,
            width: 1080,
        })

        expect(getIosBezelImageNamesMock).not.toHaveBeenCalled()
        expect(readFileSyncMock).not.toHaveBeenCalled()
        expect(logWarnSpy.mock.calls).toMatchSnapshot()
    })
})

describe('cropAndConvertToDataURL', () => {
    let mockImage: any
    let mockCroppedImage: any

    const defaultCropOptions = {
        addIOSBezelCorners: false,
        base64Image: 'originalImageData',
        deviceName: 'iPhone 14 Pro',
        devicePixelRatio: 3,
        height: 100,
        isIOS: false,
        isLandscape: false,
        sourceX: 50,
        sourceY: 25,
        width: 200,
    }

    beforeEach(async () => {
        mockCroppedImage = {
            getBase64: vi.fn().mockResolvedValue('data:image/png;base64,croppedImageData'),
        }
        mockImage = {
            crop: vi.fn().mockReturnValue(mockCroppedImage),
        }

        const jimpModule = vi.mocked(await import('jimp'))
        vi.spyOn(jimpModule.Jimp, 'read').mockResolvedValue(mockImage)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should crop image and return base64 data without iOS bezel corners', async () => {
        const result = await cropAndConvertToDataURL(defaultCropOptions)

        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCroppedImage.getBase64.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should crop image and add iOS bezel corners when isIOS is true', async () => {
        const result = await cropAndConvertToDataURL({
            ...defaultCropOptions,
            addIOSBezelCorners: true,
            isIOS: true,
        })

        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCroppedImage.getBase64.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle landscape orientation with iOS bezel corners', async () => {
        const result = await cropAndConvertToDataURL({
            ...defaultCropOptions,
            addIOSBezelCorners: true,
            isIOS: true,
            isLandscape: true,
        })

        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCroppedImage.getBase64.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle Android device (isIOS false) without bezel corners', async () => {
        const result = await cropAndConvertToDataURL({
            ...defaultCropOptions,
            addIOSBezelCorners: true,
            deviceName: 'Samsung Galaxy S21',
            isIOS: false,
        })

        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCroppedImage.getBase64.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle zero dimensions', async () => {
        const result = await cropAndConvertToDataURL({
            ...defaultCropOptions,
            height: 0,
            sourceX: 0,
            sourceY: 0,
            width: 0,
        })

        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCroppedImage.getBase64.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle large crop dimensions', async () => {
        const result = await cropAndConvertToDataURL({
            ...defaultCropOptions,
            height: 2000,
            sourceX: 1000,
            sourceY: 500,
            width: 3000,
        })

        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCroppedImage.getBase64.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle different base64 input data', async () => {
        const result = await cropAndConvertToDataURL({
            ...defaultCropOptions,
            base64Image: 'differentImageData123',
        })

        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCroppedImage.getBase64.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle different device pixel ratios', async () => {
        const result = await cropAndConvertToDataURL({
            ...defaultCropOptions,
            addIOSBezelCorners: true,
            devicePixelRatio: 2,
            isIOS: true,
        })

        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCroppedImage.getBase64.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })
})

describe('makeCroppedBase64Image', () => {
    let getBase64ScreenshotSizeMock: ReturnType<typeof vi.spyOn>
    let mockImage: any
    let mockCroppedImage: any

    const defaultCropOptions = {
        addIOSBezelCorners: false,
        base64Image: 'originalImageData',
        deviceName: 'iPhone 14 Pro',
        devicePixelRatio: 3,
        isWebDriverElementScreenshot: false,
        isIOS: false,
        isLandscape: false,
        rectangles: {
            height: 100,
            width: 200,
            x: 50,
            y: 25,
        },
        resizeDimensions: { top: 0, right: 0, bottom: 0, left: 0 },
    }

    beforeEach(async () => {
        const utilsModule = vi.mocked(await import('../helpers/utils.js'))
        getBase64ScreenshotSizeMock = vi.spyOn(utilsModule, 'getBase64ScreenshotSize')
        mockCroppedImage = {
            getBase64: vi.fn().mockResolvedValue('data:image/png;base64,finalCroppedImageData'),
            composite: vi.fn().mockReturnThis(),
            opacity: vi.fn().mockReturnThis(),
        }
        mockImage = {
            crop: vi.fn().mockReturnValue(mockCroppedImage),
            composite: vi.fn().mockReturnThis(),
            getBase64: vi.fn().mockResolvedValue('data:image/png;base64,mockImageData'),
            opacity: vi.fn().mockReturnThis(),
            rotate: vi.fn().mockReturnThis(),
        }

        const jimpModule = vi.mocked(await import('jimp'))
        vi.spyOn(jimpModule.Jimp, 'read').mockResolvedValue(mockImage)

        getBase64ScreenshotSizeMock.mockReturnValue({ width: 1000, height: 2000 })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should create cropped base64 image with default settings', async () => {
        const result = await makeCroppedBase64Image(defaultCropOptions)

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCroppedImage.getBase64.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle landscape orientation with rotation', async () => {
        const result = await makeCroppedBase64Image({
            ...defaultCropOptions,
            isLandscape: true,
        })

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle web driver element screenshots', async () => {
        const result = await makeCroppedBase64Image({
            ...defaultCropOptions,
            isWebDriverElementScreenshot: true,
        })

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle iOS devices with bezel corners', async () => {
        const result = await makeCroppedBase64Image({
            ...defaultCropOptions,
            addIOSBezelCorners: true,
            isIOS: true,
        })

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle custom resize dimensions', async () => {
        const result = await makeCroppedBase64Image({
            ...defaultCropOptions,
            resizeDimensions: { top: 10, right: 20, bottom: 15, left: 5 },
        })

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle different rectangle dimensions', async () => {
        const result = await makeCroppedBase64Image({
            ...defaultCropOptions,
            rectangles: {
                height: 300,
                width: 400,
                x: 100,
                y: 75,
            },
        })

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle different screenshot sizes', async () => {
        getBase64ScreenshotSizeMock.mockReturnValue({ width: 800, height: 600 })

        const result = await makeCroppedBase64Image(defaultCropOptions)

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle different device pixel ratios', async () => {
        const result = await makeCroppedBase64Image({
            ...defaultCropOptions,
            devicePixelRatio: 2,
        })

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle zero rectangle dimensions', async () => {
        const result = await makeCroppedBase64Image({
            ...defaultCropOptions,
            rectangles: {
                height: 0,
                width: 0,
                x: 0,
                y: 0,
            },
        })

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle edge case with padding that exceeds image bounds', async () => {
        const result = await makeCroppedBase64Image({
            ...defaultCropOptions,
            rectangles: {
                height: 100,
                width: 200,
                x: 950, // Very close to image width (1000)
                y: 1900, // Very close to image height (2000)
            },
            resizeDimensions: { top: 50, right: 100, bottom: 50, left: 50 },
        })

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })
})

describe('makeFullPageBase64Image', () => {
    let getBase64ScreenshotSizeMock: ReturnType<typeof vi.spyOn>
    let mockCanvas: any
    let mockImage: any

    const defaultScreenshotsData = {
        fullPageHeight: 2000,
        fullPageWidth: 1000,
        data: [
            {
                canvasWidth: 1000,
                canvasYPosition: 0,
                imageHeight: 800,
                imageWidth: 1000,
                imageXPosition: 0,
                imageYPosition: 0,
                screenshot: 'screenshot1-data'
            },
            {
                canvasWidth: 1000,
                canvasYPosition: 800,
                imageHeight: 800,
                imageWidth: 1000,
                imageXPosition: 0,
                imageYPosition: 0,
                screenshot: 'screenshot2-data'
            },
            {
                canvasWidth: 1000,
                canvasYPosition: 1600,
                imageHeight: 400,
                imageWidth: 1000,
                imageXPosition: 0,
                imageYPosition: 0,
                screenshot: 'screenshot3-data'
            }
        ]
    }

    const defaultOptions = {
        devicePixelRatio: 2,
        isLandscape: false
    }

    beforeEach(async () => {
        const utilsModule = vi.mocked(await import('../helpers/utils.js'))
        getBase64ScreenshotSizeMock = vi.spyOn(utilsModule, 'getBase64ScreenshotSize')
        mockCanvas = {
            composite: vi.fn().mockReturnThis(),
            getBase64: vi.fn().mockResolvedValue('data:image/png;base64,fullPageImageData'),
        }
        mockImage = {
            crop: vi.fn().mockReturnThis(),
            composite: vi.fn().mockReturnThis(),
            getBase64: vi.fn().mockResolvedValue('data:image/png;base64,mockImageData'),
            opacity: vi.fn().mockReturnThis(),
            rotate: vi.fn().mockReturnThis(),
        }
        const jimpModule = vi.mocked(await import('jimp'))

        vi.spyOn(jimpModule.Jimp, 'read').mockResolvedValue(mockImage)
        vi.mocked(jimpModule.Jimp).mockImplementation((options: any) => {
            if (options && (options.width || options.height)) {
                return mockCanvas
            }
            return mockImage
        })

        getBase64ScreenshotSizeMock.mockReturnValue({ width: 1000, height: 800 })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should create full page base64 image with multiple screenshots', async () => {
        const result = await makeFullPageBase64Image(defaultScreenshotsData, defaultOptions)

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCanvas.composite.mock.calls).toMatchSnapshot()
        expect(mockCanvas.getBase64.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle landscape mode with rotation', async () => {
        getBase64ScreenshotSizeMock.mockReturnValue({ width: 800, height: 1000 })

        const result = await makeFullPageBase64Image(defaultScreenshotsData, {
            ...defaultOptions,
            isLandscape: true
        })

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCanvas.composite.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle single screenshot', async () => {
        const singleScreenshotData = {
            fullPageHeight: 800,
            fullPageWidth: 1000,
            data: [
                {
                    canvasWidth: 1000,
                    canvasYPosition: 0,
                    imageHeight: 800,
                    imageWidth: 1000,
                    imageXPosition: 0,
                    imageYPosition: 0,
                    screenshot: 'single-screenshot-data'
                }
            ]
        }

        const result = await makeFullPageBase64Image(singleScreenshotData, defaultOptions)

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCanvas.composite.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle different device pixel ratios', async () => {
        const result = await makeFullPageBase64Image(defaultScreenshotsData, {
            ...defaultOptions,
            devicePixelRatio: 3
        })

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCanvas.composite.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle screenshots with different dimensions', async () => {
        const mixedScreenshotsData = {
            fullPageHeight: 1500,
            fullPageWidth: 1200,
            data: [
                {
                    canvasWidth: 1200,
                    canvasYPosition: 0,
                    imageHeight: 600,
                    imageWidth: 1200,
                    imageXPosition: 0,
                    imageYPosition: 0,
                    screenshot: 'wide-screenshot-data'
                },
                {
                    canvasWidth: 1200,
                    canvasYPosition: 600,
                    imageHeight: 900,
                    imageWidth: 1200,
                    imageXPosition: 0,
                    imageYPosition: 0,
                    screenshot: 'tall-screenshot-data'
                }
            ]
        }

        getBase64ScreenshotSizeMock
            .mockReturnValueOnce({ width: 1200, height: 600 })
            .mockReturnValueOnce({ width: 1200, height: 900 })

        const result = await makeFullPageBase64Image(mixedScreenshotsData, defaultOptions)

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCanvas.composite.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle screenshots with cropping positions', async () => {
        const croppedScreenshotsData = {
            fullPageHeight: 1000,
            fullPageWidth: 1000,
            data: [
                {
                    canvasWidth: 1000,
                    canvasYPosition: 0,
                    imageHeight: 500,
                    imageWidth: 500,
                    imageXPosition: 100,
                    imageYPosition: 50,
                    screenshot: 'cropped-screenshot-data'
                }
            ]
        }

        const result = await makeFullPageBase64Image(croppedScreenshotsData, defaultOptions)

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCanvas.composite.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle landscape mode without rotation when width >= height', async () => {
        getBase64ScreenshotSizeMock.mockReturnValue({ width: 1000, height: 800 })

        const result = await makeFullPageBase64Image(defaultScreenshotsData, {
            ...defaultOptions,
            isLandscape: true
        })

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCanvas.composite.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle empty screenshots array', async () => {
        const emptyScreenshotsData = {
            fullPageHeight: 0,
            fullPageWidth: 1000,
            data: []
        }

        const result = await makeFullPageBase64Image(emptyScreenshotsData, defaultOptions)

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCanvas.composite.mock.calls).toMatchSnapshot()
        expect(mockCanvas.getBase64.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle large canvas dimensions', async () => {
        const largeScreenshotsData = {
            fullPageHeight: 5000,
            fullPageWidth: 3000,
            data: [
                {
                    canvasWidth: 3000,
                    canvasYPosition: 0,
                    imageHeight: 2000,
                    imageWidth: 3000,
                    imageXPosition: 0,
                    imageYPosition: 0,
                    screenshot: 'large-screenshot-data'
                }
            ]
        }

        getBase64ScreenshotSizeMock.mockReturnValue({ width: 3000, height: 2000 })

        const result = await makeFullPageBase64Image(largeScreenshotsData, defaultOptions)

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(mockImage.crop.mock.calls).toMatchSnapshot()
        expect(mockCanvas.composite.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle different screenshot data for each iteration', async () => {
        const result = await makeFullPageBase64Image(defaultScreenshotsData, defaultOptions)

        expect(getBase64ScreenshotSizeMock.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle canvas Y positions correctly', async () => {
        const result = await makeFullPageBase64Image(defaultScreenshotsData, defaultOptions)

        expect(mockCanvas.composite.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })
})

describe('takeResizedBase64Screenshot', () => {
    let mockBrowserInstance: any
    let mockElement: any
    let mockElementRegion: any
    let takeBase64ScreenshotMock: any
    let calculateDprDataMock: any
    let isWdioElementMock: any

    const defaultOptions = {
        browserInstance: {} as any,
        element: {} as any,
        devicePixelRatio: 2,
        isIOS: false,
        resizeDimensions: { top: 0, right: 0, bottom: 0, left: 0 }
    }

    beforeEach(async () => {
        mockElementRegion = {
            height: 100,
            width: 200,
            x: 50,
            y: 25
        }
        mockElement = {
            elementId: 'test-element-id',
            takeElementScreenshot: vi.fn().mockResolvedValue('nativeScreenshotData')
        }
        mockBrowserInstance = {
            getElementRect: vi.fn().mockResolvedValue(mockElementRegion)
        }
        const utilsModule = vi.mocked(await import('../helpers/utils.js'))
        calculateDprDataMock = vi.spyOn(utilsModule, 'calculateDprData')
        const screenshotsModule = vi.mocked(await import('./screenshots.js'))
        takeBase64ScreenshotMock = vi.spyOn(screenshotsModule, 'takeBase64Screenshot')
        const rectanglesModule = vi.mocked(await import('./rectangles.js'))
        isWdioElementMock = vi.spyOn(rectanglesModule, 'isWdioElement')
        takeBase64ScreenshotMock.mockResolvedValue('base64ScreenshotData')
        calculateDprDataMock.mockReturnValue({
            height: 100,
            width: 200,
            x: 50,
            y: 25
        })
        isWdioElementMock.mockReturnValue(true)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should take resized base64 screenshot with default settings', async () => {
        const result = await takeResizedBase64Screenshot({
            ...defaultOptions,
            browserInstance: mockBrowserInstance,
            element: mockElement
        })

        expect(isWdioElementMock.mock.calls).toMatchSnapshot()
        expect(mockBrowserInstance.getElementRect.mock.calls).toMatchSnapshot()
        expect(takeBase64ScreenshotMock.mock.calls).toMatchSnapshot()
        expect(calculateDprDataMock.mock.calls).toMatchSnapshot()
        expect(result).toBeDefined()
    })

    it('should handle iOS device with device pixel ratio', async () => {
        const result = await takeResizedBase64Screenshot({
            ...defaultOptions,
            browserInstance: mockBrowserInstance,
            element: mockElement,
            devicePixelRatio: 3,
            isIOS: true
        })

        expect(isWdioElementMock.mock.calls).toMatchSnapshot()
        expect(mockBrowserInstance.getElementRect.mock.calls).toMatchSnapshot()
        expect(takeBase64ScreenshotMock.mock.calls).toMatchSnapshot()
        expect(calculateDprDataMock.mock.calls).toMatchSnapshot()
        expect(result).toBeDefined()
    })

    it('should handle custom resize dimensions', async () => {
        const customResizeDimensions = {
            top: 10,
            right: 20,
            bottom: 15,
            left: 5
        }
        const result = await takeResizedBase64Screenshot({
            ...defaultOptions,
            browserInstance: mockBrowserInstance,
            element: mockElement,
            resizeDimensions: customResizeDimensions
        })

        expect(isWdioElementMock.mock.calls).toMatchSnapshot()
        expect(mockBrowserInstance.getElementRect.mock.calls).toMatchSnapshot()
        expect(takeBase64ScreenshotMock.mock.calls).toMatchSnapshot()
        expect(calculateDprDataMock.mock.calls).toMatchSnapshot()
        expect(result).toBeDefined()
    })

    it('should handle different element regions', async () => {
        const differentElementRegion = {
            height: 300,
            width: 400,
            x: 100,
            y: 75
        }
        mockBrowserInstance.getElementRect.mockResolvedValue(differentElementRegion)
        const result = await takeResizedBase64Screenshot({
            ...defaultOptions,
            browserInstance: mockBrowserInstance,
            element: mockElement
        })

        expect(isWdioElementMock.mock.calls).toMatchSnapshot()
        expect(mockBrowserInstance.getElementRect.mock.calls).toMatchSnapshot()
        expect(takeBase64ScreenshotMock.mock.calls).toMatchSnapshot()
        expect(calculateDprDataMock.mock.calls).toMatchSnapshot()
        expect(result).toBeDefined()
    })

    it('should handle non-WDIO element with logging', async () => {
        const nonWdioElement = { someProperty: 'not-a-wdio-element' } as unknown as WicElement
        isWdioElementMock.mockReturnValue(false)
        const result = await takeResizedBase64Screenshot({
            ...defaultOptions,
            browserInstance: mockBrowserInstance,
            element: nonWdioElement
        })

        expect(isWdioElementMock.mock.calls).toMatchSnapshot()
        expect(mockBrowserInstance.getElementRect.mock.calls).toMatchSnapshot()
        expect(takeBase64ScreenshotMock.mock.calls).toMatchSnapshot()
        expect(result).toBeDefined()
    })

    it('should handle different device pixel ratios', async () => {
        const result = await takeResizedBase64Screenshot({
            ...defaultOptions,
            browserInstance: mockBrowserInstance,
            element: mockElement,
            devicePixelRatio: 1.5
        })

        expect(isWdioElementMock.mock.calls).toMatchSnapshot()
        expect(mockBrowserInstance.getElementRect.mock.calls).toMatchSnapshot()
        expect(takeBase64ScreenshotMock.mock.calls).toMatchSnapshot()
        expect(calculateDprDataMock.mock.calls).toMatchSnapshot()
        expect(result).toBeDefined()
    })

    it('should handle zero element dimensions', async () => {
        const zeroElementRegion = {
            height: 0,
            width: 0,
            x: 0,
            y: 0
        }
        mockBrowserInstance.getElementRect.mockResolvedValue(zeroElementRegion)
        const result = await takeResizedBase64Screenshot({
            ...defaultOptions,
            browserInstance: mockBrowserInstance,
            element: mockElement
        })

        expect(isWdioElementMock.mock.calls).toMatchSnapshot()
        expect(mockBrowserInstance.getElementRect.mock.calls).toMatchSnapshot()
        expect(takeBase64ScreenshotMock.mock.calls).toMatchSnapshot()
        expect(calculateDprDataMock.mock.calls).toMatchSnapshot()
        expect(result).toBeDefined()
    })

    it('should handle large element dimensions', async () => {
        const largeElementRegion = {
            height: 2000,
            width: 3000,
            x: 1000,
            y: 500
        }
        mockBrowserInstance.getElementRect.mockResolvedValue(largeElementRegion)
        const result = await takeResizedBase64Screenshot({
            ...defaultOptions,
            browserInstance: mockBrowserInstance,
            element: mockElement
        })

        expect(isWdioElementMock.mock.calls).toMatchSnapshot()
        expect(mockBrowserInstance.getElementRect.mock.calls).toMatchSnapshot()
        expect(takeBase64ScreenshotMock.mock.calls).toMatchSnapshot()
        expect(calculateDprDataMock.mock.calls).toMatchSnapshot()
        expect(result).toBeDefined()
    })

    it('should handle different screenshot data', async () => {
        takeBase64ScreenshotMock.mockResolvedValue('differentScreenshotData')
        const result = await takeResizedBase64Screenshot({
            ...defaultOptions,
            browserInstance: mockBrowserInstance,
            element: mockElement
        })

        expect(isWdioElementMock.mock.calls).toMatchSnapshot()
        expect(mockBrowserInstance.getElementRect.mock.calls).toMatchSnapshot()
        expect(takeBase64ScreenshotMock.mock.calls).toMatchSnapshot()
        expect(result).toBeDefined()
    })

    it('should handle element with different elementId', async () => {
        const elementWithDifferentId = {
            elementId: 'different-element-id'
        } as WicElement
        const result = await takeResizedBase64Screenshot({
            ...defaultOptions,
            browserInstance: mockBrowserInstance,
            element: elementWithDifferentId
        })

        expect(isWdioElementMock.mock.calls).toMatchSnapshot()
        expect(mockBrowserInstance.getElementRect.mock.calls).toMatchSnapshot()
        expect(takeBase64ScreenshotMock.mock.calls).toMatchSnapshot()
        expect(result).toBeDefined()
    })

    it('should handle Android device (non-iOS)', async () => {
        const result = await takeResizedBase64Screenshot({
            ...defaultOptions,
            browserInstance: mockBrowserInstance,
            element: mockElement,
            devicePixelRatio: 2.5,
            isIOS: false
        })

        expect(isWdioElementMock.mock.calls).toMatchSnapshot()
        expect(mockBrowserInstance.getElementRect.mock.calls).toMatchSnapshot()
        expect(takeBase64ScreenshotMock.mock.calls).toMatchSnapshot()
        expect(calculateDprDataMock.mock.calls).toMatchSnapshot()
        expect(result).toBeDefined()
    })
})

describe('takeBase64ElementScreenshot', () => {
    let mockElement: any
    let mockBrowserInstance: any
    let isWdioElementMock: any

    beforeEach(async () => {
        mockElement = {
            elementId: 'test-element-id',
            takeElementScreenshot: vi.fn().mockResolvedValue('nativeScreenshotData')
        }
        mockBrowserInstance = {
            getElementRect: vi.fn().mockResolvedValue({
                height: 100,
                width: 200,
                x: 50,
                y: 25
            })
        }
        const rectanglesModule = await import('./rectangles.js')
        isWdioElementMock = vi.spyOn(rectanglesModule, 'isWdioElement')
        isWdioElementMock.mockReturnValue(true)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should use native element screenshot when resizeDimensions equals DEFAULT_RESIZE_DIMENSIONS', async () => {
        const { takeBase64ElementScreenshot } = await import('./images.js')
        const result = await takeBase64ElementScreenshot({
            browserInstance: mockBrowserInstance,
            element: Promise.resolve(mockElement) as any,
            devicePixelRatio: 2,
            isIOS: false,
            resizeDimensions: DEFAULT_RESIZE_DIMENSIONS
        })
        expect(isWdioElementMock.mock.calls).toMatchSnapshot()
        expect(mockElement.takeElementScreenshot.mock.calls).toMatchSnapshot()
        expect(result).toBe('nativeScreenshotData')
    })

    it('should log error and still call takeElementScreenshot if element is not WDIO element', async () => {
        isWdioElementMock.mockReturnValue(false)
        const { takeBase64ElementScreenshot } = await import('./images.js')
        const errorSpy = vi.spyOn(log, 'error').mockImplementation(() => {})
        const result = await takeBase64ElementScreenshot({
            browserInstance: mockBrowserInstance,
            element: Promise.resolve(mockElement) as any,
            devicePixelRatio: 2,
            isIOS: false,
            resizeDimensions: DEFAULT_RESIZE_DIMENSIONS
        })
        expect(isWdioElementMock.mock.calls).toMatchSnapshot()
        expect(errorSpy.mock.calls).toMatchSnapshot()
        expect(mockElement.takeElementScreenshot.mock.calls).toMatchSnapshot()
        expect(result).toBe('nativeScreenshotData')
        errorSpy.mockRestore()
    })

    it('should fallback to takeResizedBase64Screenshot when takeElementScreenshot throws an error', async () => {
        const { takeBase64ElementScreenshot } = await import('./images.js')
        const errorSpy = vi.spyOn(log, 'error').mockImplementation(() => {})

        const mockElementWithError = {
            elementId: 'test-element-id',
            takeElementScreenshot: vi.fn().mockRejectedValue(new Error('Screenshot failed'))
        }
        const result = await takeBase64ElementScreenshot({
            browserInstance: mockBrowserInstance,
            element: Promise.resolve(mockElementWithError) as any,
            devicePixelRatio: 2,
            isIOS: false,
            resizeDimensions: DEFAULT_RESIZE_DIMENSIONS
        })

        expect(mockElementWithError.takeElementScreenshot.mock.calls).toMatchSnapshot()
        expect(errorSpy.mock.calls).toMatchSnapshot()
        expect(result).toBeDefined()
        expect(typeof result).toBe('string')

        errorSpy.mockRestore()
    })
})

