import { describe, it, expect, vi, afterEach } from 'vitest'
import saveWebElement from './saveWebElement.js'
import { takeElementScreenshot } from '../methods/elementScreenshots.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import { canUseBidiScreenshot } from '../helpers/utils.js'
import { createBeforeScreenshotOptions } from '../helpers/options.js'
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

describe('saveWebElement', () => {
    const takeElementScreenshotSpy = vi.mocked(takeElementScreenshot)
    const afterScreenshotSpy = vi.mocked(afterScreenshot)
    const canUseBidiScreenshotSpy = vi.mocked(canUseBidiScreenshot)
    const createBeforeScreenshotOptionsSpy = vi.mocked(createBeforeScreenshotOptions)

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
        expect(createBeforeScreenshotOptionsSpy).toHaveBeenCalledWith(
            baseOptions.instanceData,
            baseOptions.saveElementOptions.method,
            baseOptions.saveElementOptions.wic
        )
        expect(takeElementScreenshotSpy).toHaveBeenCalledWith(
            baseOptions.browserInstance,
            expect.objectContaining({
                addressBarShadowPadding: 6,
                autoElementScroll: true, // This comes from the mocked baseOptions
                deviceName: 'desktop',
                devicePixelRatio: 2,
                deviceRectangles: baseOptions.instanceData.deviceRectangles,
                element: baseOptions.element,
                isEmulated: false,
                initialDevicePixelRatio: 2,
                innerHeight: 900,
                isAndroidNativeWebScreenshot: false,
                isAndroid: false,
                isIOS: false,
                isLandscape: false,
                isMobile: false,
                resizeDimensions: { top: 0, right: 0, bottom: 0, left: 0 }
            }),
            true // shouldUseBidi
        )
        expect(afterScreenshotSpy).toHaveBeenCalledWith(
            baseOptions.browserInstance,
            expect.objectContaining({
                actualFolder: baseOptions.folders.actualFolder,
                base64Image: 'element-screenshot-data',
                isNativeContext: false
            })
        )
    })

    it('should call takeElementScreenshot with BiDi disabled when not available', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(false)
        const result = await saveWebElement(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeElementScreenshotSpy).toHaveBeenCalledWith(
            baseOptions.browserInstance,
            expect.objectContaining({
                addressBarShadowPadding: 6,
                autoElementScroll: true, // This comes from the mocked baseOptions
                deviceName: 'desktop',
                devicePixelRatio: 2,
                isMobile: false
            }),
            false // shouldUseBidi
        )
        expect(afterScreenshotSpy).toHaveBeenCalledWith(
            baseOptions.browserInstance,
            expect.objectContaining({
                base64Image: 'element-screenshot-data'
            })
        )
    })

    it('should call takeElementScreenshot with BiDi disabled when mobile device', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)
        const beforeScreenshotMock = createBeforeScreenshotMock({ isMobile: true })
        vi.mocked((await import('../helpers/beforeScreenshot.js')).default).mockResolvedValueOnce(beforeScreenshotMock)

        const result = await saveWebElement(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeElementScreenshotSpy).toHaveBeenCalledWith(
            baseOptions.browserInstance,
            expect.objectContaining({
                isMobile: true
            }),
            false // shouldUseBidi = false because isMobile = true
        )
    })

    it('should call takeElementScreenshot with BiDi disabled when legacy method enabled', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)
        const options = createTestOptions({
            enableLegacyScreenshotMethod: true
        })
        const result = await saveWebElement(options)

        expect(result).toMatchSnapshot()
        expect(takeElementScreenshotSpy).toHaveBeenCalledWith(
            baseOptions.browserInstance,
            expect.anything(),
            false // shouldUseBidi = false because enableLegacyScreenshotMethod = true
        )
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
        expect(takeElementScreenshotSpy).toHaveBeenCalledWith(
            baseOptions.browserInstance,
            expect.objectContaining({
                autoElementScroll: true
            }),
            expect.any(Boolean)
        )
    })

    it('should pass resizeDimensions option correctly', async () => {
        const customResizeDimensions = { top: 10, right: 15, bottom: 20, left: 25 }
        const options = createTestOptions({
            resizeDimensions: customResizeDimensions
        })
        const result = await saveWebElement(options)

        expect(result).toMatchSnapshot()
        expect(takeElementScreenshotSpy).toHaveBeenCalledWith(
            baseOptions.browserInstance,
            expect.objectContaining({
                resizeDimensions: customResizeDimensions
            }),
            expect.any(Boolean)
        )
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
        const result = await saveWebElement(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeElementScreenshotSpy).toHaveBeenCalledWith(
            baseOptions.browserInstance,
            expect.objectContaining({
                devicePixelRatio: NaN,
                initialDevicePixelRatio: NaN,
                innerHeight: NaN
            }),
            expect.any(Boolean)
        )
        expect(afterScreenshotSpy).toHaveBeenCalledWith(
            baseOptions.browserInstance,
            expect.objectContaining({
                fileName: expect.objectContaining({
                    devicePixelRatio: NaN,
                    outerHeight: NaN,
                    outerWidth: NaN,
                    screenHeight: NaN,
                    screenWidth: NaN
                })
            })
        )
    })
})
