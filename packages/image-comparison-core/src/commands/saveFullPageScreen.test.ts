import { describe, it, expect, vi, beforeEach } from 'vitest'
import saveFullPageScreen from './saveFullPageScreen.js'
import type { InternalSaveFullPageMethodOptions } from './save.interfaces.js'
import { BASE_CHECK_OPTIONS, createMethodOptions } from '../mocks/mocks.js'

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
vi.mock('../methods/fullPageScreenshots.js', () => ({
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

describe('saveFullPageScreen', () => {
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

    beforeEach(() => {
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

    it('should take full page screenshots and return result', async () => {
        const { takeFullPageScreenshots } = await import('../methods/fullPageScreenshots.js')
        const { makeFullPageBase64Image } = await import('../methods/images.js')
        const afterScreenshot = (await import('../helpers/afterScreenshot.js')).default

        const result = await saveFullPageScreen(baseOptions)

        expect(takeFullPageScreenshots).toHaveBeenCalledWith(
            baseOptions.browserInstance,
            expect.any(Object),
            false // shouldUseBidi
        )
        expect(makeFullPageBase64Image).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                devicePixelRatio: 2,
                isLandscape: false
            })
        )
        expect(afterScreenshot).toHaveBeenCalled()
        expect(result).toEqual({
            devicePixelRatio: 2,
            fileName: 'test-fullpage.png'
        })
    })

    it('should use BiDi when conditions are met', async () => {
        const { canUseBidiScreenshot } = await import('../helpers/utils.js')
        const { takeFullPageScreenshots } = await import('../methods/fullPageScreenshots.js')

        vi.mocked(canUseBidiScreenshot).mockReturnValue(true)

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

        expect(takeFullPageScreenshots).toHaveBeenCalledWith(
            baseOptions.browserInstance,
            expect.any(Object),
            true // shouldUseBidi
        )
    })
})
