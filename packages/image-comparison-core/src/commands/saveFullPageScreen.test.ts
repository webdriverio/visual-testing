import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import saveFullPageScreen from './saveFullPageScreen.js'
import type { InternalSaveFullPageMethodOptions } from './save.interfaces.js'
import {
    BASE_CHECK_OPTIONS,
    createMethodOptions,
    createBeforeScreenshotMock
} from '../mocks/mocks.js'

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
vi.mock('../methods/screenshots.js', () => ({
    takeBase64BiDiScreenshot: vi.fn().mockResolvedValue('bidi-screenshot-data'),
    getBase64FullPageScreenshotsData: vi.fn().mockResolvedValue({
        fullPageHeight: 2000,
        fullPageWidth: 1200,
        data: ['screenshot-1', 'screenshot-2']
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
        if (option === 'userBasedFullPageScreenshot') {return method[option] ?? wic[option]}
        if (option === 'enableLegacyScreenshotMethod') {return method[option] ?? wic[option]}
        return method[option] ?? wic[option]
    })
}))

describe('saveFullPageScreen', () => {
    let takeBase64BiDiScreenshotSpy: ReturnType<typeof vi.fn>
    let getBase64FullPageScreenshotsDataSpy: ReturnType<typeof vi.fn>
    let makeFullPageBase64ImageSpy: ReturnType<typeof vi.fn>
    let afterScreenshotSpy: ReturnType<typeof vi.fn>
    let canUseBidiScreenshotSpy: ReturnType<typeof vi.fn>

    const baseOptions = {
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
    } as InternalSaveFullPageMethodOptions

    const createTestOptions = (methodOptions = {}) => ({
        ...baseOptions,
        saveFullPageOptions: {
            ...baseOptions.saveFullPageOptions,
            method: createMethodOptions({
                ...baseOptions.saveFullPageOptions.method,
                ...methodOptions
            })
        }
    })

    beforeEach(async () => {
        const { takeBase64BiDiScreenshot, getBase64FullPageScreenshotsData } = await import('../methods/screenshots.js')
        const { makeFullPageBase64Image } = await import('../methods/images.js')
        const afterScreenshot = (await import('../helpers/afterScreenshot.js')).default
        const { canUseBidiScreenshot } = await import('../helpers/utils.js')

        takeBase64BiDiScreenshotSpy = vi.mocked(takeBase64BiDiScreenshot)
        getBase64FullPageScreenshotsDataSpy = vi.mocked(getBase64FullPageScreenshotsData)
        makeFullPageBase64ImageSpy = vi.mocked(makeFullPageBase64Image)
        afterScreenshotSpy = vi.mocked(afterScreenshot)
        canUseBidiScreenshotSpy = vi.mocked(canUseBidiScreenshot)
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

    it('should use Bidi screenshot when available and userBasedFullPageScreenshot is false', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)
        const options = createTestOptions({
            userBasedFullPageScreenshot: false
        })
        const result = await saveFullPageScreen(options)

        expect(result).toMatchSnapshot()
        expect(takeBase64BiDiScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(getBase64FullPageScreenshotsDataSpy).not.toHaveBeenCalled()
        expect(makeFullPageBase64ImageSpy).not.toHaveBeenCalled()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should use Bidi screenshot when available and enableLegacyScreenshotMethod is false', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)
        const options = createTestOptions({
            enableLegacyScreenshotMethod: false
        })
        const result = await saveFullPageScreen(options)

        expect(result).toMatchSnapshot()
        expect(takeBase64BiDiScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(getBase64FullPageScreenshotsDataSpy).not.toHaveBeenCalled()
        expect(makeFullPageBase64ImageSpy).not.toHaveBeenCalled()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should use legacy method when Bidi is available but both userBasedFullPageScreenshot and enableLegacyScreenshotMethod are true', async () => {
        canUseBidiScreenshotSpy.mockReturnValueOnce(true)
        const options = createTestOptions({
            userBasedFullPageScreenshot: true,
            enableLegacyScreenshotMethod: true
        })
        const result = await saveFullPageScreen(options)

        expect(result).toMatchSnapshot()
        expect(takeBase64BiDiScreenshotSpy).not.toHaveBeenCalled()
        expect(getBase64FullPageScreenshotsDataSpy.mock.calls[0]).toMatchSnapshot()
        expect(makeFullPageBase64ImageSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle undefined hideAfterFirstScroll, hideElements, and removeElements', async () => {
        const options = createTestOptions({
            hideAfterFirstScroll: undefined,
            hideElements: undefined,
            removeElements: undefined
        })

        await saveFullPageScreen(options)

        expect(getBase64FullPageScreenshotsDataSpy.mock.calls[0]).toMatchSnapshot()
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
        const result = await saveFullPageScreen(baseOptions)

        expect(result).toMatchSnapshot()
        expect(getBase64FullPageScreenshotsDataSpy.mock.calls[0]).toMatchSnapshot()
        expect(makeFullPageBase64ImageSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })
})
