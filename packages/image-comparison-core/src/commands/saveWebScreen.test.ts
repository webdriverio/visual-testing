import { describe, it, expect, vi, afterEach } from 'vitest'
import saveWebScreen from './saveWebScreen.js'
import { takeWebScreenshot } from '../methods/takeWebScreenshots.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import { canUseBidiScreenshot } from '../helpers/utils.js'
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

vi.mock('../methods/takeWebScreenshots.js', () => ({
    takeWebScreenshot: vi.fn().mockResolvedValue({
        base64Image: 'web-screenshot-data'
    })
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
vi.mock('../helpers/options.js', async (importOriginal) => {
    const actual = await importOriginal() as any
    return {
        ...actual,
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
        }),
    }
})

describe('saveWebScreen', () => {
    const takeWebScreenshotSpy = vi.mocked(takeWebScreenshot)
    const afterScreenshotSpy = vi.mocked(afterScreenshot)
    const canUseBidiScreenshotSpy = vi.mocked(canUseBidiScreenshot)
    const createBeforeScreenshotOptionsSpy = vi.mocked(createBeforeScreenshotOptions)

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

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should call takeWebScreenshot with correct options when BiDi is available', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)
        const result = await saveWebScreen(baseOptions)

        expect(result).toMatchSnapshot()
        expect(createBeforeScreenshotOptionsSpy).toHaveBeenCalledWith(
            baseOptions.instanceData,
            baseOptions.saveScreenOptions.method,
            baseOptions.saveScreenOptions.wic
        )
        expect(takeWebScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should call takeWebScreenshot with BiDi disabled when not available', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(false)
        const result = await saveWebScreen(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeWebScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should call takeWebScreenshot with BiDi disabled when mobile device', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)
        const beforeScreenshotMock = createBeforeScreenshotMock({ isMobile: true })
        vi.mocked((await import('../helpers/beforeScreenshot.js')).default).mockResolvedValueOnce(beforeScreenshotMock)

        const result = await saveWebScreen(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeWebScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should call takeWebScreenshot with BiDi disabled when legacy method enabled', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)
        const options = createTestOptions(baseOptions, {
            saveScreenOptions: {
                ...baseOptions.saveScreenOptions,
                method: createMethodOptions({
                    enableLegacyScreenshotMethod: true
                })
            }
        })
        const result = await saveWebScreen(options)

        expect(result).toMatchSnapshot()
        expect(takeWebScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should pass iOS configuration correctly', async () => {
        const beforeScreenshotMock = createBeforeScreenshotMock({
            isIOS: true,
            deviceName: 'iPhone 14 Pro',
            dimensions: {
                window: {
                    isLandscape: true
                }
            }
        })
        vi.mocked((await import('../helpers/beforeScreenshot.js')).default).mockResolvedValueOnce(beforeScreenshotMock)

        const options = createTestOptions(baseOptions, {
            saveScreenOptions: {
                ...baseOptions.saveScreenOptions,
                wic: {
                    ...baseOptions.saveScreenOptions.wic,
                    addIOSBezelCorners: true
                }
            }
        })
        const result = await saveWebScreen(options)

        expect(result).toMatchSnapshot()
        expect(takeWebScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle NaN dimension values correctly', async () => {
        const nanDimensions = createBeforeScreenshotMock({
            dimensions: {
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
        expect(takeWebScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })
})
