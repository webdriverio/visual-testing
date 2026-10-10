import { describe, it, expect, vi, afterEach } from 'vitest'
import saveWebElement from './saveWebElement.js'
import { takeElementScreenshot } from '../methods/takeElementScreenshots.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import beforeScreenshot from '../helpers/beforeScreenshot.js'
import { readScrollPosition, restoreScrollPosition } from '../helpers/scrollPosition.js'
import { canUseBidiScreenshot } from '../helpers/utils.js'
import { createBeforeScreenshotOptions, buildAfterScreenshotOptions } from '../helpers/options.js'
import type { InternalSaveElementMethodOptions } from './save.interfaces.js'
import {
    createBaseOptions,
    createMethodOptions,
    createBeforeScreenshotMock
} from '../mocks/mocks.js'

vi.mock('../helpers/scrollPosition.js', () => ({
    readScrollPosition: vi.fn().mockResolvedValue(420),
    restoreScrollPosition: vi.fn(),
}))
vi.mock('../methods/takeElementScreenshots.js', () => ({
    takeElementScreenshot: vi.fn().mockResolvedValue({
        base64Image: 'element-screenshot-data',
        isWebDriverElementScreenshot: false
    })
}))
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
        initialDevicePixelRatio: 2,
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
    })
}))
vi.mock('../helpers/afterScreenshot.js', () => ({
    default: vi.fn().mockResolvedValue({
        devicePixelRatio: 2,
        fileName: 'test-element.png'
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
        buildAfterScreenshotOptions: vi.fn().mockReturnValue({
            actualFolder: '/test/actual',
            base64Image: 'element-screenshot-data',
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
                tag: 'test-element'
            },
            hideElements: [],
            hideScrollBars: true,
            isLandscape: false,
            isNativeContext: false,
            platformName: 'desktop',
            removeElements: [],
        })
    }
})

describe('saveWebElement', () => {
    const takeElementScreenshotSpy = vi.mocked(takeElementScreenshot)
    const afterScreenshotSpy = vi.mocked(afterScreenshot)
    const canUseBidiScreenshotSpy = vi.mocked(canUseBidiScreenshot)
    const createBeforeScreenshotOptionsSpy = vi.mocked(createBeforeScreenshotOptions)
    const buildAfterScreenshotOptionsSpy = vi.mocked(buildAfterScreenshotOptions)

    const baseOptions = {
        ...createBaseOptions('element'),
        element: { elementId: 'test-element' } as any,
        browserInstance: {
            isAndroid: false,
            isMobile: false
        } as any
    } as InternalSaveElementMethodOptions

    const createTestOptions = (methodOptions = {}) => ({
        ...baseOptions,
        saveElementOptions: {
            ...baseOptions.saveElementOptions,
            method: createMethodOptions(methodOptions)
        }
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should call takeElementScreenshot with correct options when BiDi is available', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)
        const result = await saveWebElement(baseOptions)

        expect(result).toMatchSnapshot()
        expect(createBeforeScreenshotOptionsSpy.mock.calls[0]).toMatchSnapshot()
        expect(takeElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0][1]).toMatchSnapshot()
    })

    it('should call takeElementScreenshot with BiDi disabled when not available', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(false)
        const result = await saveWebElement(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0][1]).toMatchSnapshot()
    })

    it('should call takeElementScreenshot with BiDi disabled when mobile device', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)
        const beforeScreenshotMock = createBeforeScreenshotMock({ isMobile: true })
        vi.mocked((await import('../helpers/beforeScreenshot.js')).default).mockResolvedValueOnce(beforeScreenshotMock)

        const result = await saveWebElement(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
    })

    it('should call takeElementScreenshot with BiDi disabled when legacy method enabled', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)
        const options = createTestOptions({
            enableLegacyScreenshotMethod: true
        })
        const result = await saveWebElement(options)

        expect(result).toMatchSnapshot()
        expect(takeElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should pass autoElementScroll option correctly', async () => {
        const options = createTestOptions({
            wic: {
                ...baseOptions.saveElementOptions.wic,
                autoElementScroll: true
            }
        })
        const result = await saveWebElement(options)

        expect(result).toMatchSnapshot()
        expect(takeElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should pass resizeDimensions option correctly', async () => {
        const customResizeDimensions = { top: 10, right: 15, bottom: 20, left: 25 }
        const options = createTestOptions({
            resizeDimensions: customResizeDimensions
        })
        const result = await saveWebElement(options)

        expect(result).toMatchSnapshot()
        expect(takeElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle NaN dimension values correctly', async () => {
        const nanDimensions = createBeforeScreenshotMock({
            dimensions: {
                window: {
                    devicePixelRatio: NaN,
                    innerHeight: NaN,
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

        buildAfterScreenshotOptionsSpy.mockReturnValueOnce({
            actualFolder: '/test/actual',
            base64Image: 'element-screenshot-data',
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
                devicePixelRatio: NaN,
                formatImageName: '{tag}-{browserName}-{width}x{height}',
                isMobile: false,
                isTestInBrowser: true,
                logName: 'chrome',
                name: 'chrome',
                outerHeight: NaN,
                outerWidth: NaN,
                platformName: 'desktop',
                platformVersion: '120.0.0',
                screenHeight: NaN,
                screenWidth: NaN,
                tag: 'test-element'
            },
            hideElements: [],
            hideScrollBars: true,
            isLandscape: false,
            isNativeContext: false,
            platformName: 'desktop',
            removeElements: [],
        })

        const result = await saveWebElement(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0][1]).toMatchSnapshot()
    })

    it('should pass through alwaysSaveActualImage value from options (service overrides for direct save* calls)', async () => {
        const options = {
            ...baseOptions,
            saveElementOptions: {
                ...baseOptions.saveElementOptions,
                wic: {
                    ...baseOptions.saveElementOptions.wic,
                    alwaysSaveActualImage: false,
                }
            }
        }

        await saveWebElement(options)

        expect(buildAfterScreenshotOptionsSpy).toHaveBeenCalled()
        const buildAfterScreenshotOptionsCall = buildAfterScreenshotOptionsSpy.mock.calls[buildAfterScreenshotOptionsSpy.mock.calls.length - 1]
        expect(buildAfterScreenshotOptionsCall[0].wicOptions).toHaveProperty('alwaysSaveActualImage', false)
    })

    describe('scroll back (#1229)', () => {
        const withAutoElementScroll = (autoElementScroll: boolean): InternalSaveElementMethodOptions => ({
            ...baseOptions,
            saveElementOptions: {
                ...baseOptions.saveElementOptions,
                wic: { ...baseOptions.saveElementOptions.wic, autoElementScroll },
            },
        })

        it('should read the scroll position before the page is prepared and scroll back after it is restored', async () => {
            await saveWebElement(withAutoElementScroll(true))

            // Read before beforeScreenshot (removed elements can make the page shorter), restore after afterScreenshot
            expect(vi.mocked(readScrollPosition).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(beforeScreenshot).mock.invocationCallOrder[0])
            expect(restoreScrollPosition).toHaveBeenCalledWith(baseOptions.browserInstance, 420, baseOptions.instanceData.isIOS)
            expect(vi.mocked(restoreScrollPosition).mock.invocationCallOrder[0]).toBeGreaterThan(afterScreenshotSpy.mock.invocationCallOrder[0])
        })

        it('should scroll back and keep the original error when the screenshot fails', async () => {
            const screenshotError = new Error('screenshot failed')
            takeElementScreenshotSpy.mockRejectedValueOnce(screenshotError)

            await expect(saveWebElement(withAutoElementScroll(true))).rejects.toThrow(screenshotError)

            expect(restoreScrollPosition).toHaveBeenCalledWith(baseOptions.browserInstance, 420, baseOptions.instanceData.isIOS)
        })

        it('should not read or restore the scroll position when autoElementScroll is off', async () => {
            await saveWebElement(withAutoElementScroll(false))

            expect(readScrollPosition).not.toHaveBeenCalled()
            // `restoreScrollPosition` does nothing without a position
            expect(restoreScrollPosition).not.toHaveBeenCalledWith(expect.anything(), expect.any(Number), expect.anything())
        })
    })
})
