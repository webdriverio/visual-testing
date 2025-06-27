import { describe, it, expect, vi, afterEach } from 'vitest'
import { takeWebScreenshot } from './takeWebScreenshots.js'
import { takeBase64BiDiScreenshot, takeBase64Screenshot } from './screenshots.js'
import { makeCroppedBase64Image } from './images.js'
import { determineScreenRectangles } from './rectangles.js'
import type { WebScreenshotDataOptions } from './screenshots.interfaces.js'

vi.mock('./screenshots.js', () => ({
    takeBase64BiDiScreenshot: vi.fn().mockResolvedValue('bidi-screenshot-data'),
    takeBase64Screenshot: vi.fn().mockResolvedValue('screenshot-data')
}))
vi.mock('./images.js', () => ({
    makeCroppedBase64Image: vi.fn().mockResolvedValue('cropped-screenshot-data')
}))
vi.mock('./rectangles.js', () => ({
    determineScreenRectangles: vi.fn().mockReturnValue({ x: 0, y: 0, width: 100, height: 100 })
}))

describe('takeWebScreenshot', () => {
    const takeBase64BiDiScreenshotSpy = vi.mocked(takeBase64BiDiScreenshot)
    const takeBase64ScreenshotSpy = vi.mocked(takeBase64Screenshot)
    const makeCroppedBase64ImageSpy = vi.mocked(makeCroppedBase64Image)
    const determineScreenRectanglesSpy = vi.mocked(determineScreenRectangles)

    const browserInstance = {
        isAndroid: false,
        isMobile: false
    } as any

    const baseOptions: WebScreenshotDataOptions = {
        addIOSBezelCorners: false,
        deviceName: 'desktop',
        devicePixelRatio: 2,
        enableLegacyScreenshotMethod: false,
        innerHeight: 900,
        innerWidth: 1200,
        initialDevicePixelRatio: 2,
        isAndroidChromeDriverScreenshot: false,
        isAndroidNativeWebScreenshot: false,
        isEmulated: false,
        isIOS: false,
        isLandscape: false,
        isMobile: false
    }

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('BiDi screenshots', () => {
        it('should take BiDi screenshot when shouldUseBidi is true', async () => {
            const result = await takeWebScreenshot(browserInstance, baseOptions, true)

            expect(result).toEqual({
                base64Image: 'bidi-screenshot-data'
            })
            expect(takeBase64BiDiScreenshotSpy.mock.calls[0]).toMatchSnapshot()
            expect(takeBase64ScreenshotSpy).not.toHaveBeenCalled()
            expect(determineScreenRectanglesSpy).not.toHaveBeenCalled()
            expect(makeCroppedBase64ImageSpy).not.toHaveBeenCalled()
        })
    })

    describe('Legacy screenshots', () => {
        it('should take legacy screenshot when shouldUseBidi is false', async () => {
            const result = await takeWebScreenshot(browserInstance, baseOptions, false)

            expect(result).toEqual({
                base64Image: 'cropped-screenshot-data'
            })
            expect(takeBase64ScreenshotSpy.mock.calls[0]).toMatchSnapshot()
            expect(determineScreenRectanglesSpy.mock.calls[0]).toMatchSnapshot()
            expect(makeCroppedBase64ImageSpy.mock.calls[0]).toMatchSnapshot()
            expect(takeBase64BiDiScreenshotSpy).not.toHaveBeenCalled()
        })

        it('should default shouldUseBidi to false when not provided', async () => {
            const result = await takeWebScreenshot(browserInstance, baseOptions)

            expect(result).toEqual({
                base64Image: 'cropped-screenshot-data'
            })
            expect(takeBase64BiDiScreenshotSpy).not.toHaveBeenCalled()
            expect(takeBase64ScreenshotSpy).toHaveBeenCalled()
        })

        it('should handle NaN dimension values in screen rectangles', async () => {
            const optionsWithNaN = {
                ...baseOptions,
                devicePixelRatio: NaN,
                innerHeight: NaN,
                innerWidth: NaN,
                initialDevicePixelRatio: NaN
            }

            const result = await takeWebScreenshot(browserInstance, optionsWithNaN, false)

            expect(result).toMatchSnapshot()
            expect(determineScreenRectanglesSpy.mock.calls[0]).toMatchSnapshot()
            expect(makeCroppedBase64ImageSpy.mock.calls[0]).toMatchSnapshot()
        })

        it('should handle undefined dimension values in screen rectangles', async () => {
            const optionsWithUndefined = {
                ...baseOptions,
                devicePixelRatio: undefined,
                innerHeight: undefined,
                innerWidth: undefined,
                initialDevicePixelRatio: undefined
            }

            const result = await takeWebScreenshot(browserInstance, optionsWithUndefined, false)

            expect(result).toMatchSnapshot()
            expect(determineScreenRectanglesSpy.mock.calls[0]).toMatchSnapshot()
            expect(makeCroppedBase64ImageSpy.mock.calls[0]).toMatchSnapshot()
        })

        it('should pass iOS configuration correctly', async () => {
            const iOSOptions = {
                ...baseOptions,
                addIOSBezelCorners: true,
                deviceName: 'iPhone 14 Pro',
                isIOS: true,
                isLandscape: true
            }

            const result = await takeWebScreenshot(browserInstance, iOSOptions, false)

            expect(result).toMatchSnapshot()
            expect(determineScreenRectanglesSpy.mock.calls[0]).toMatchSnapshot()
            expect(makeCroppedBase64ImageSpy.mock.calls[0]).toMatchSnapshot()
        })

        it('should handle Android configurations', async () => {
            const androidOptions = {
                ...baseOptions,
                deviceName: 'Pixel 4',
                isAndroidChromeDriverScreenshot: true,
                isAndroidNativeWebScreenshot: false,
                isMobile: true
            }

            const result = await takeWebScreenshot(browserInstance, androidOptions, false)

            expect(result).toMatchSnapshot()
            expect(determineScreenRectanglesSpy.mock.calls[0]).toMatchSnapshot()
        })

        it('should handle emulated device configuration', async () => {
            const emulatedOptions = {
                ...baseOptions,
                isEmulated: true,
                enableLegacyScreenshotMethod: true
            }

            const result = await takeWebScreenshot(browserInstance, emulatedOptions, false)

            expect(result).toMatchSnapshot()
            expect(determineScreenRectanglesSpy.mock.calls[0]).toMatchSnapshot()
        })

        it('should handle native web screenshot configuration', async () => {
            const nativeWebOptions = {
                ...baseOptions,
                isAndroidNativeWebScreenshot: true,
                isAndroidChromeDriverScreenshot: false
            }

            const result = await takeWebScreenshot(browserInstance, nativeWebOptions, false)

            expect(result).toMatchSnapshot()
            expect(determineScreenRectanglesSpy.mock.calls[0]).toMatchSnapshot()
        })
    })
})
