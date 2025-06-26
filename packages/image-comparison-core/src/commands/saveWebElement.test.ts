import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import saveWebElement from './saveWebElement.js'
import { createBeforeScreenshotOptions } from '../helpers/options.js'
import type { InternalSaveElementMethodOptions } from './save.interfaces.js'
import {
    createBaseOptions,
    createMethodOptions,
    createBeforeScreenshotMock
} from '../mocks/mocks.js'

vi.mock('../methods/screenshots.js', () => ({
    takeBase64BiDiScreenshot: vi.fn().mockResolvedValue('bidi-screenshot-data'),
    takeWebElementScreenshot: vi.fn().mockResolvedValue({
        base64Image: 'web-element-screenshot-data',
        rectangles: { x: 0, y: 0, width: 100, height: 100 },
        isWebDriverElementScreenshot: false
    })
}))
vi.mock('../methods/images.js', () => ({
    makeCroppedBase64Image: vi.fn().mockResolvedValue('cropped-screenshot-data')
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
    getMethodOrWicOption: vi.fn().mockImplementation((method, wic, option) => method[option] ?? wic[option]),
    waitFor: vi.fn().mockResolvedValue(undefined),
    getBase64ScreenshotSize: vi.fn().mockReturnValue({ width: 100, height: 100 })
}))
vi.mock('../clientSideScripts/scrollElementIntoView.js', () => ({
    default: vi.fn()
}))
vi.mock('../clientSideScripts/scrollToPosition.js', () => ({
    default: vi.fn()
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
    let takeBase64BiDiScreenshotSpy: ReturnType<typeof vi.fn>
    let takeWebElementScreenshotSpy: ReturnType<typeof vi.fn>
    let makeCroppedBase64ImageSpy: ReturnType<typeof vi.fn>
    let afterScreenshotSpy: ReturnType<typeof vi.fn>
    let canUseBidiScreenshotSpy: ReturnType<typeof vi.fn>
    let waitForSpy: ReturnType<typeof vi.fn>
    let getBase64ScreenshotSizeSpy: ReturnType<typeof vi.fn>
    let createBeforeScreenshotOptionsSpy: ReturnType<typeof vi.fn>
    const executeMock = vi.fn().mockResolvedValue(undefined)

    const baseOptions = {
        ...createBaseOptions('element'),
        element: { elementId: 'test-element' } as any,
        browserInstance: {
            execute: executeMock,
            getElementRect: vi.fn().mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
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

    beforeEach(async () => {
        const { takeBase64BiDiScreenshot, takeWebElementScreenshot } = await import('../methods/screenshots.js')
        const { makeCroppedBase64Image } = await import('../methods/images.js')
        const afterScreenshot = (await import('../helpers/afterScreenshot.js')).default
        const { canUseBidiScreenshot, waitFor, getBase64ScreenshotSize } = await import('../helpers/utils.js')

        takeBase64BiDiScreenshotSpy = vi.mocked(takeBase64BiDiScreenshot)
        takeWebElementScreenshotSpy = vi.mocked(takeWebElementScreenshot)
        makeCroppedBase64ImageSpy = vi.mocked(makeCroppedBase64Image)
        afterScreenshotSpy = vi.mocked(afterScreenshot)
        canUseBidiScreenshotSpy = vi.mocked(canUseBidiScreenshot)
        waitForSpy = vi.mocked(waitFor)
        getBase64ScreenshotSizeSpy = vi.mocked(getBase64ScreenshotSize)
        createBeforeScreenshotOptionsSpy = vi.mocked(createBeforeScreenshotOptions)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should use Bidi screenshot when available and not mobile', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)
        const result = await saveWebElement(baseOptions)

        expect(result).toMatchSnapshot()
        expect(createBeforeScreenshotOptionsSpy).toHaveBeenCalledWith(
            baseOptions.instanceData,
            baseOptions.saveElementOptions.method,
            baseOptions.saveElementOptions.wic
        )
        expect(takeBase64BiDiScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(takeWebElementScreenshotSpy).not.toHaveBeenCalled()
        expect(makeCroppedBase64ImageSpy).not.toHaveBeenCalled()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should use Bidi screenshot from document when viewport fails', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)
        takeBase64BiDiScreenshotSpy.mockRejectedValueOnce(new Error('WebDriver Bidi command "browsingContext.captureScreenshot" failed with error: unable to capture screen - Unable to capture screenshot with zero dimensions'))
        const result = await saveWebElement(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeBase64BiDiScreenshotSpy).toHaveBeenCalledTimes(2)
        expect(takeBase64BiDiScreenshotSpy.mock.calls).toMatchSnapshot()
        expect(takeWebElementScreenshotSpy).not.toHaveBeenCalled()
        expect(makeCroppedBase64ImageSpy).not.toHaveBeenCalled()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should throw error when Bidi screenshot fails with non-zero dimension error', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)
        const error = new Error('Some other error')
        takeBase64BiDiScreenshotSpy.mockRejectedValueOnce(error)

        await expect(saveWebElement(baseOptions)).rejects.toThrow(error)
        expect(takeBase64BiDiScreenshotSpy).toHaveBeenCalledTimes(1)
        expect(takeWebElementScreenshotSpy).not.toHaveBeenCalled()
        expect(makeCroppedBase64ImageSpy).not.toHaveBeenCalled()
        expect(afterScreenshotSpy).not.toHaveBeenCalled()
    })

    it('should use default values when hideElements and removeElements are not provided', async () => {
        const options = createTestOptions({
            hideElements: undefined,
            removeElements: undefined
        })
        const result = await saveWebElement(options)

        expect(result).toMatchSnapshot()
        expect(takeWebElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(makeCroppedBase64ImageSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should use legacy method when Bidi is not available', async () => {
        const result = await saveWebElement(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeBase64BiDiScreenshotSpy).not.toHaveBeenCalled()
        expect(takeWebElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(makeCroppedBase64ImageSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle auto scroll', async () => {
        const options = createTestOptions({
            wic: {
                ...baseOptions.saveElementOptions.wic,
                autoElementScroll: true
            }
        })
        executeMock.mockResolvedValueOnce(100) // scroll position
        const result = await saveWebElement(options)

        expect(result).toMatchSnapshot()
        expect(executeMock).toHaveBeenCalledTimes(2)
        expect(executeMock.mock.calls).toMatchSnapshot()
        expect(waitForSpy).toHaveBeenCalledWith(100)
    })

    it('should handle zero dimensions', async () => {
        takeWebElementScreenshotSpy.mockResolvedValueOnce({
            base64Image: 'web-element-screenshot-data',
            rectangles: { x: 0, y: 0, width: 0, height: 0 },
            isWebDriverElementScreenshot: false
        })
        const result = await saveWebElement(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeWebElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(getBase64ScreenshotSizeSpy).toHaveBeenCalledWith('web-element-screenshot-data')
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
        const result = await saveWebElement(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeWebElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(makeCroppedBase64ImageSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })
})
