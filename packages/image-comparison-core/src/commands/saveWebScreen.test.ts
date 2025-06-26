import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import saveWebScreen from './saveWebScreen.js'
import { createBeforeScreenshotOptions } from '../helpers/options.js'
import type { InternalSaveScreenMethodOptions } from './save.interfaces.js'
import {
    BASE_CHECK_OPTIONS,
    BEFORE_SCREENSHOT_OPTIONS,
    createMethodOptions,
    createTestOptions,
    createBeforeScreenshotMock
} from '../mocks/mocks.js'
import { DEVICE_RECTANGLES } from '../helpers/constants.js'

vi.mock('../methods/screenshots.js', () => ({
    takeBase64BiDiScreenshot: vi.fn().mockResolvedValue('bidi-screenshot-data'),
    takeBase64Screenshot: vi.fn().mockResolvedValue('screenshot-data')
}))
vi.mock('../methods/images.js', () => ({
    makeCroppedBase64Image: vi.fn().mockResolvedValue('cropped-screenshot-data')
}))
vi.mock('../methods/rectangles.js', () => ({
    determineScreenRectangles: vi.fn().mockReturnValue({ x: 0, y: 0, width: 100, height: 100 })
}))
vi.mock('../helpers/beforeScreenshot.js', () => ({
    default: vi.fn().mockResolvedValue({
        browserName: 'chrome',
        browserVersion: '120.0.0',
        deviceName: 'desktop',
        dimensions: {
            body: {
                scrollHeight: 1000,
                offsetHeight: 1000
            },
            html: {
                clientWidth: 1200,
                scrollWidth: 1200,
                clientHeight: 900,
                scrollHeight: 1000,
                offsetHeight: 1000
            },
            window: {
                devicePixelRatio: 2,
                innerHeight: 900,
                innerWidth: 1200,
                isEmulated: false,
                isLandscape: false,
                outerHeight: 1000,
                outerWidth: 1200,
                screenHeight: 1080,
                screenWidth: 1920,
            },
        },
        isAndroid: false,
        isAndroidChromeDriverScreenshot: false,
        isAndroidNativeWebScreenshot: false,
        isIOS: false,
        isMobile: false,
        isTestInBrowser: true,
        isTestInMobileBrowser: false,
        addressBarShadowPadding: 0,
        toolBarShadowPadding: 0,
        appName: '',
        logName: 'chrome',
        name: 'chrome',
        platformName: 'desktop',
        platformVersion: '120.0.0',
        devicePixelRatio: 2,
        deviceRectangles: {
            bottomBar: { height: 0, width: 0, x: 0, y: 0 },
            homeBar: { height: 0, width: 0, x: 0, y: 0 },
            leftSidePadding: { height: 0, width: 0, x: 0, y: 0 },
            rightSidePadding: { height: 0, width: 0, x: 0, y: 0 },
            screenSize: { height: 0, width: 0 },
            statusBar: { height: 0, width: 0, x: 0, y: 0 },
            statusBarAndAddressBar: { height: 0, width: 0, x: 0, y: 0 },
            viewport: { height: 0, width: 0, x: 0, y: 0 }
        },
        initialDevicePixelRatio: 2,
        nativeWebScreenshot: false
    })
}))
vi.mock('../helpers/afterScreenshot.js', () => ({
    default: vi.fn().mockResolvedValue({
        devicePixelRatio: 2,
        fileName: 'test-screen.png'
    })
}))
vi.mock('../helpers/utils.js', () => ({
    canUseBidiScreenshot: vi.fn().mockReturnValue(false),
    getMethodOrWicOption: vi.fn().mockImplementation((method, wic, option) => method[option] ?? wic[option])
}))
vi.mock('../helpers/options.js', () => ({
    createBeforeScreenshotOptions: vi.fn().mockReturnValue({
        instanceData: { test: 'data' },
        addressBarShadowPadding: 6,
        toolBarShadowPadding: 6,
        disableBlinkingCursor: false,
        disableCSSAnimation: false,
        enableLayoutTesting: false,
        hideElements: [],
        noScrollBars: true,
        removeElements: [],
        waitForFontsLoaded: false,
    })
}))

describe('saveWebScreen', () => {
    let takeBase64BiDiScreenshotSpy: ReturnType<typeof vi.fn>
    let takeBase64ScreenshotSpy: ReturnType<typeof vi.fn>
    let makeCroppedBase64ImageSpy: ReturnType<typeof vi.fn>
    let afterScreenshotSpy: ReturnType<typeof vi.fn>
    let canUseBidiScreenshotSpy: ReturnType<typeof vi.fn>
    let determineScreenRectanglesSpy: ReturnType<typeof vi.fn>
    let createBeforeScreenshotOptionsSpy: ReturnType<typeof vi.fn>

    const baseOptions = {
        browserInstance: { isAndroid: false, isMobile: false } as any,
        folders: BASE_CHECK_OPTIONS.folders,
        instanceData: {
            ...BEFORE_SCREENSHOT_OPTIONS.instanceData,
            deviceRectangles: {
                ...DEVICE_RECTANGLES,
                screenSize: {
                    width: 1920,
                    height: 1080
                }
            }
        },
        isNativeContext: false,
        saveScreenOptions: {
            wic: BASE_CHECK_OPTIONS.wic,
            method: createMethodOptions({
                disableBlinkingCursor: false,
                disableCSSAnimation: false,
                enableLayoutTesting: false,
                enableLegacyScreenshotMethod: false,
                hideScrollBars: true,
                hideElements: [],
                removeElements: [],
                waitForFontsLoaded: true,
            })
        },
        tag: 'test-screen'
    } as InternalSaveScreenMethodOptions

    beforeEach(async () => {
        const { takeBase64BiDiScreenshot, takeBase64Screenshot } = await import('../methods/screenshots.js')
        const { makeCroppedBase64Image } = await import('../methods/images.js')
        const { determineScreenRectangles } = await import('../methods/rectangles.js')
        const afterScreenshot = (await import('../helpers/afterScreenshot.js')).default
        const { canUseBidiScreenshot } = await import('../helpers/utils.js')

        takeBase64BiDiScreenshotSpy = vi.mocked(takeBase64BiDiScreenshot)
        takeBase64ScreenshotSpy = vi.mocked(takeBase64Screenshot)
        makeCroppedBase64ImageSpy = vi.mocked(makeCroppedBase64Image)
        determineScreenRectanglesSpy = vi.mocked(determineScreenRectangles)
        afterScreenshotSpy = vi.mocked(afterScreenshot)
        canUseBidiScreenshotSpy = vi.mocked(canUseBidiScreenshot)
        createBeforeScreenshotOptionsSpy = vi.mocked(createBeforeScreenshotOptions)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should use Bidi screenshot when available and not mobile', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)
        const result = await saveWebScreen(baseOptions)

        expect(createBeforeScreenshotOptionsSpy).toHaveBeenCalledWith(
            baseOptions.instanceData,
            baseOptions.saveScreenOptions.method,
            baseOptions.saveScreenOptions.wic
        )
        expect(result).toMatchSnapshot()
        expect(takeBase64BiDiScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(takeBase64ScreenshotSpy).not.toHaveBeenCalled()
        expect(determineScreenRectanglesSpy).not.toHaveBeenCalled()
        expect(makeCroppedBase64ImageSpy).not.toHaveBeenCalled()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should use legacy method when Bidi is not available', async () => {
        const result = await saveWebScreen(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeBase64BiDiScreenshotSpy).not.toHaveBeenCalled()
        expect(takeBase64ScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(determineScreenRectanglesSpy.mock.calls[0]).toMatchSnapshot()
        expect(makeCroppedBase64ImageSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should use default values when hideElements and removeElements are not provided', async () => {
        const options = createTestOptions(baseOptions, {
            saveScreenOptions: {
                wic: BASE_CHECK_OPTIONS.wic,
                method: {
                    hideElements: undefined,
                    removeElements: undefined
                }
            }
        })
        const result = await saveWebScreen(options)

        expect(result).toMatchSnapshot()
        expect(takeBase64ScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(determineScreenRectanglesSpy.mock.calls[0]).toMatchSnapshot()
        expect(makeCroppedBase64ImageSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle NaN dimension values', async () => {
        const nanDimensions = createBeforeScreenshotMock({
            dimensions: {
                body: {
                    scrollHeight: NaN,
                    offsetHeight: NaN
                },
                html: {
                    clientWidth: NaN,
                    scrollWidth: NaN,
                    clientHeight: NaN,
                    scrollHeight: NaN,
                    offsetHeight: NaN
                },
                window: {
                    devicePixelRatio: NaN,
                    innerHeight: NaN,
                    innerWidth: NaN,
                    isEmulated: false,
                    isLandscape: false,
                    outerHeight: NaN,
                    outerWidth: NaN,
                    screenHeight: NaN,
                    screenWidth: NaN,
                },
            },
            devicePixelRatio: NaN,
            initialDevicePixelRatio: NaN
        })
        vi.mocked((await import('../helpers/beforeScreenshot.js')).default).mockResolvedValueOnce(nanDimensions)
        const result = await saveWebScreen(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeBase64ScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(determineScreenRectanglesSpy.mock.calls[0]).toMatchSnapshot()
        expect(makeCroppedBase64ImageSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle mobile device correctly', async () => {
        const options = createTestOptions(baseOptions, {
            browserInstance: { isAndroid: true, isMobile: true } as any,
            instanceData: {
                ...BEFORE_SCREENSHOT_OPTIONS.instanceData,
                deviceName: 'Pixel 4',
                isAndroid: true,
                isIOS: false,
                isMobile: true,
                platformName: 'Android',
                platformVersion: '11.0',
                deviceRectangles: {
                    ...DEVICE_RECTANGLES,
                    screenSize: {
                        width: 412,
                        height: 915
                    }
                }
            }
        })

        await saveWebScreen(options)

        expect(takeBase64ScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle custom screen sizes', async () => {
        const options = createTestOptions(baseOptions, {
            instanceData: {
                ...BEFORE_SCREENSHOT_OPTIONS.instanceData,
                deviceRectangles: {
                    ...DEVICE_RECTANGLES,
                    screenSize: {
                        width: 2560,
                        height: 1440
                    }
                }
            }
        })

        await saveWebScreen(options)

        expect(takeBase64ScreenshotSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })
})
