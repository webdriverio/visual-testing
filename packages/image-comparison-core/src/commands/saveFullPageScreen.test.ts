import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import saveFullPageScreen from './saveFullPageScreen.js'
import { createBeforeScreenshotOptions, buildAfterScreenshotOptions } from '../helpers/options.js'
import { takeFullPageScreenshots } from '../methods/takeFullPageScreenshots.js'
import { makeFullPageBase64Image } from '../methods/images.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import beforeScreenshot from '../helpers/beforeScreenshot.js'
import type { InternalSaveFullPageMethodOptions } from './save.interfaces.js'
import { BASE_CHECK_OPTIONS, createMethodOptions } from '../mocks/mocks.js'
import { canUseBidiScreenshot } from '../helpers/utils.js'

vi.mock('../helpers/beforeScreenshot.js', () => ({
    default: vi.fn().mockResolvedValue({
        browserName: 'chrome',
        browserVersion: '120.0.0',
        deviceName: 'desktop',
        dimensions: {
            window: {
                devicePixelRatio: 2,
                innerHeight: 900,
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
        logName: 'chrome',
        name: 'chrome',
        platformName: 'desktop',
        platformVersion: '120.0.0',
    })
}))
vi.mock('../methods/takeFullPageScreenshots.js', () => ({
    takeFullPageScreenshots: vi.fn().mockResolvedValue({
        fullPageHeight: 2000,
        fullPageWidth: 1200,
        data: [{
            canvasWidth: 1200,
            canvasYPosition: 0,
            imageHeight: 2000,
            imageWidth: 1200,
            imageXPosition: 0,
            imageYPosition: 0,
            screenshot: 'test-screenshot-data',
        }]
    })
}))
vi.mock('../methods/images.js', () => ({
    makeFullPageBase64Image: vi.fn().mockResolvedValue('fullpage-screenshot-data')
}))
vi.mock('../helpers/afterScreenshot.js', () => ({
    default: vi.fn().mockResolvedValue({
        devicePixelRatio: 2,
        fileName: 'test-fullpage.png'
    })
}))
vi.mock('../helpers/utils.js', () => ({
    canUseBidiScreenshot: vi.fn().mockReturnValue(false),
    getMethodOrWicOption: vi.fn().mockImplementation((method, wic, option) => {
        return method[option] ?? wic[option]
    })
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
        noScrollBars: false,
        removeElements: [],
        waitForFontsLoaded: false,
    }),
    buildAfterScreenshotOptions: vi.fn().mockReturnValue({
        actualFolder: '/test/actual',
        base64Image: 'fullpage-screenshot-data',
        disableBlinkingCursor: false,
        disableCSSAnimation: false,
        enableLayoutTesting: false,
        filePath: {
            browserName: 'chrome',
            deviceName: 'desktop',
            isMobile: false,
            savePerInstance: false,
        },
        fileName: {
            browserName: 'chrome',
            browserVersion: '120.0.0',
            deviceName: 'desktop',
            devicePixelRatio: 2,
            formatImageName: '{tag}-{browserName}-{width}x{height}',
            isMobile: false,
            isTestInBrowser: true,
            logName: 'chrome',
            name: 'chrome',
            outerHeight: 1000,
            outerWidth: 1200,
            platformName: 'desktop',
            platformVersion: '120.0.0',
            screenHeight: 1080,
            screenWidth: 1920,
            tag: 'test-fullpage'
        },
        hideElements: [],
        hideScrollBars: false,
        isLandscape: false,
        isNativeContext: false,
        platformName: 'desktop',
        removeElements: [],
    })
}))

describe('saveFullPageScreen', () => {
    let createBeforeScreenshotOptionsSpy: ReturnType<typeof vi.fn>
    let buildAfterScreenshotOptionsSpy: ReturnType<typeof vi.fn>
    let takeFullPageScreenshotsSpy: ReturnType<typeof vi.fn>
    let makeFullPageBase64ImageSpy: ReturnType<typeof vi.fn>
    let afterScreenshotSpy: ReturnType<typeof vi.fn>
    let canUseBidiScreenshotSpy: ReturnType<typeof vi.fn>
    let beforeScreenshotSpy: ReturnType<typeof vi.fn>

    const createBidiMockData = (screenshot: string) => ({
        fullPageHeight: -1,
        fullPageWidth: -1,
        data: [{
            canvasWidth: 0,
            canvasYPosition: 0,
            imageHeight: 0,
            imageWidth: 0,
            imageXPosition: 0,
            imageYPosition: 0,
            screenshot,
        }]
    })

    const baseOptions: InternalSaveFullPageMethodOptions = {
        browserInstance: { isAndroid: false, isMobile: false } as any,
        folders: BASE_CHECK_OPTIONS.folders,
        instanceData: BASE_CHECK_OPTIONS.instanceData,
        isNativeContext: false,
        saveFullPageOptions: {
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
        tag: 'test-fullpage'
    }

    beforeEach(async () => {
        createBeforeScreenshotOptionsSpy = vi.mocked(createBeforeScreenshotOptions)
        buildAfterScreenshotOptionsSpy = vi.mocked(buildAfterScreenshotOptions)
        takeFullPageScreenshotsSpy = vi.mocked(takeFullPageScreenshots)
        makeFullPageBase64ImageSpy = vi.mocked(makeFullPageBase64Image)
        afterScreenshotSpy = vi.mocked(afterScreenshot)
        canUseBidiScreenshotSpy = vi.mocked(canUseBidiScreenshot)
        beforeScreenshotSpy = vi.mocked(beforeScreenshot)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should throw an error when in native context', async () => {
        const options = {
            ...baseOptions,
            isNativeContext: true
        }

        await expect(saveFullPageScreen(options)).rejects.toThrow(
            'The method saveFullPageScreen is not supported in native context for native mobile apps!'
        )
    })

    it('should use BiDi when conditions are met', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)
        takeFullPageScreenshotsSpy.mockResolvedValueOnce(createBidiMockData('test-bidi-screenshot-data'))

        const options = {
            ...baseOptions,
            saveFullPageOptions: {
                ...baseOptions.saveFullPageOptions,
                method: createMethodOptions({
                    userBasedFullPageScreenshot: false,
                    enableLegacyScreenshotMethod: false
                })
            }
        }

        await saveFullPageScreen(options)

        expect(takeFullPageScreenshotsSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should use BiDi when canUseBidiScreenshot=true, userBasedFullPageScreenshot=true, enableLegacyScreenshotMethod=false', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)
        takeFullPageScreenshotsSpy.mockResolvedValueOnce(createBidiMockData('test-bidi-screenshot-data-2'))

        const options = {
            ...baseOptions,
            saveFullPageOptions: {
                ...baseOptions.saveFullPageOptions,
                method: createMethodOptions({
                    userBasedFullPageScreenshot: true,
                    enableLegacyScreenshotMethod: false
                })
            }
        }

        await saveFullPageScreen(options)

        expect(takeFullPageScreenshotsSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should not use BiDi when canUseBidiScreenshot=true, userBasedFullPageScreenshot=false, enableLegacyScreenshotMethod=true', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)

        const options = {
            ...baseOptions,
            saveFullPageOptions: {
                ...baseOptions.saveFullPageOptions,
                method: createMethodOptions({
                    userBasedFullPageScreenshot: false,
                    enableLegacyScreenshotMethod: true
                })
            }
        }

        await saveFullPageScreen(options)

        expect(takeFullPageScreenshotsSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should take full page screenshots and return result', async () => {
        const result = await saveFullPageScreen(baseOptions)

        expect(createBeforeScreenshotOptionsSpy.mock.calls[0]).toMatchSnapshot()
        expect(takeFullPageScreenshotsSpy.mock.calls[0]).toMatchSnapshot()
        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(makeFullPageBase64ImageSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0][1]).toMatchSnapshot()
        expect(result).toEqual({
            devicePixelRatio: 2,
            fileName: 'test-fullpage.png'
        })
    })

    it('should handle missing dimension values with NaN fallbacks', async () => {
        beforeScreenshotSpy.mockResolvedValueOnce({
            browserName: 'chrome',
            browserVersion: '120.0.0',
            deviceName: 'desktop',
            dimensions: {
                body: {
                    scrollHeight: 2000,
                    offsetHeight: 1000,
                },
                html: {
                    clientWidth: 1200,
                    scrollWidth: 1200,
                    clientHeight: 1000,
                    scrollHeight: 2000,
                    offsetHeight: 1000,
                },
                window: {
                    devicePixelRatio: undefined,
                    innerHeight: undefined,
                    isEmulated: false,
                    isLandscape: false,
                    outerHeight: undefined,
                    outerWidth: undefined,
                    screenHeight: undefined,
                    screenWidth: undefined,
                },
            },
            isAndroid: false,
            isAndroidChromeDriverScreenshot: false,
            isAndroidNativeWebScreenshot: false,
            isIOS: false,
            isMobile: false,
            isTestInBrowser: true,
            logName: 'chrome',
            name: 'chrome',
            platformName: 'desktop',
            platformVersion: '120.0.0',
            isTestInMobileBrowser: false,
            addressBarShadowPadding: 6,
            toolBarShadowPadding: 6,
            appName: 'test-app',
            elementAddressBarPadding: 0,
            elementToolBarPadding: 0,
            pixelDensity: 1,
        } as any)

        const result = await saveFullPageScreen(baseOptions)

        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(makeFullPageBase64ImageSpy.mock.calls[0]).toMatchSnapshot()
        expect(result).toEqual({
            devicePixelRatio: 2,
            fileName: 'test-fullpage.png'
        })
    })
})
