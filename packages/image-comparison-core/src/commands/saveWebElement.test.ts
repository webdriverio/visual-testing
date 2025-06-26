import { describe, it, expect, vi, afterEach } from 'vitest'
import saveWebElement from './saveWebElement.js'
import { takeElementScreenshot } from '../methods/elementScreenshots.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import { canUseBidiScreenshot } from '../helpers/utils.js'
import { createBeforeScreenshotOptions, buildAfterScreenshotOptions } from '../helpers/options.js'
import type { InternalSaveElementMethodOptions } from './save.interfaces.js'
import {
    createBaseOptions,
    createMethodOptions,
    createBeforeScreenshotMock
} from '../mocks/mocks.js'

vi.mock('../methods/elementScreenshots.js', () => ({
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

        // Mock buildAfterScreenshotOptions to return NaN values for this test
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
})
