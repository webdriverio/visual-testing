import { describe, it, expect, vi, beforeEach } from 'vitest'
import { takeFullPageScreenshots } from './takeFullPageScreenshots.js'
import type { FullPageScreenshotDataOptions } from './screenshots.interfaces.js'

vi.mock('./screenshots.js', () => ({
    getMobileFullPageNativeWebScreenshotsData: vi.fn().mockResolvedValue({ data: ['mobile'] }),
    getAndroidChromeDriverFullPageScreenshotsData: vi.fn().mockResolvedValue({ data: ['chromedriver'] }),
    getDesktopFullPageScreenshotsData: vi.fn().mockResolvedValue({ data: ['desktop'] }),
    takeBase64BiDiScreenshot: vi.fn().mockResolvedValue('bidi-screenshot')
}))
vi.mock('../helpers/utils.js', () => ({
    canUseBidiScreenshot: vi.fn()
}))

describe('takeFullPageScreenshots', () => {
    const mockBrowser = {} as WebdriverIO.Browser
    const createOptions = (overrides: Partial<FullPageScreenshotDataOptions> = {}): FullPageScreenshotDataOptions => ({
        addressBarShadowPadding: 0,
        devicePixelRatio: 1,
        deviceRectangles: {} as any,
        fullPageScrollTimeout: 1000,
        hideAfterFirstScroll: [],
        innerHeight: 800,
        isAndroid: false,
        isAndroidNativeWebScreenshot: false,
        isAndroidChromeDriverScreenshot: false,
        isIOS: false,
        isLandscape: false,
        screenHeight: 1024,
        screenWidth: 768,
        toolBarShadowPadding: 0,
        ...overrides
    })

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should use BiDi when shouldUseBidi is true and browser supports it', async () => {
        const { canUseBidiScreenshot } = await import('../helpers/utils.js')
        vi.mocked(canUseBidiScreenshot).mockReturnValue(true)

        const options = createOptions()
        const result = await takeFullPageScreenshots(mockBrowser, options, true)

        expect(result.data[0].screenshot).toBe('bidi-screenshot')
    })

    it('should route to mobile native web for Android native web screenshots', async () => {
        const { getMobileFullPageNativeWebScreenshotsData } = await import('./screenshots.js')
        const options = createOptions({
            isAndroid: true,
            isAndroidNativeWebScreenshot: true
        })

        const result = await takeFullPageScreenshots(mockBrowser, options, false)

        expect(getMobileFullPageNativeWebScreenshotsData).toHaveBeenCalledWith(mockBrowser, expect.any(Object))
        expect(result.data).toEqual(['mobile'])
    })

    it('should route to mobile native web for iOS devices', async () => {
        const { getMobileFullPageNativeWebScreenshotsData } = await import('./screenshots.js')
        const options = createOptions({ isIOS: true })

        await takeFullPageScreenshots(mockBrowser, options, false)

        expect(getMobileFullPageNativeWebScreenshotsData).toHaveBeenCalledWith(mockBrowser, expect.any(Object))
    })

    it('should route to Android ChromeDriver for Android ChromeDriver screenshots', async () => {
        const { getAndroidChromeDriverFullPageScreenshotsData } = await import('./screenshots.js')
        const options = createOptions({
            isAndroid: true,
            isAndroidChromeDriverScreenshot: true
        })

        await takeFullPageScreenshots(mockBrowser, options, false)

        expect(getAndroidChromeDriverFullPageScreenshotsData).toHaveBeenCalledWith(mockBrowser, expect.any(Object))
    })

    it('should default to desktop for other cases', async () => {
        const { getDesktopFullPageScreenshotsData } = await import('./screenshots.js')
        const options = createOptions() // Basic desktop options

        await takeFullPageScreenshots(mockBrowser, options, false)

        expect(getDesktopFullPageScreenshotsData).toHaveBeenCalledWith(mockBrowser, expect.any(Object))
    })
})
