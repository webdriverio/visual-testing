import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mock } from 'vitest-mock-extended'
import { takeFullPageScreenshots } from './takeFullPageScreenshots.js'
import type { FullPageScreenshotDataOptions } from './screenshots.interfaces.js'

vi.mock('./screenshots.js', () => ({
    getScrollContainerFullPageScreenshotsData: vi.fn().mockResolvedValue({ data: ['scroll-container'] }),
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
        const options = createOptions()

        await takeFullPageScreenshots(mockBrowser, options, false)

        expect(getDesktopFullPageScreenshotsData).toHaveBeenCalledWith(mockBrowser, expect.any(Object))
    })

    describe('scroll container (#125)', () => {
        const container = mock<WebdriverIO.Element>({ elementId: 'container' })
        const viewport = { x: 0, y: 300, width: 1080, height: 1800 }

        it('should stitch the scroll container, also when BiDi could be used', async () => {
            const { getScrollContainerFullPageScreenshotsData, takeBase64BiDiScreenshot } = await import('./screenshots.js')

            const result = await takeFullPageScreenshots(mockBrowser, createOptions({ scrollContainer: container, hideAfterFirstScroll: [] }), true)

            expect(result).toEqual({ data: ['scroll-container'] })
            expect(takeBase64BiDiScreenshot).not.toHaveBeenCalled()
            expect(getScrollContainerFullPageScreenshotsData).toHaveBeenCalledWith(mockBrowser, {
                devicePixelRatio: 1,
                fullPageScrollTimeout: 1000,
                hideAfterFirstScroll: [],
                hideScrollBars: true,
                scrollContainer: container,
                viewport: undefined,
            })
        })

        it('should pass hideScrollBars', async () => {
            const { getScrollContainerFullPageScreenshotsData } = await import('./screenshots.js')

            await takeFullPageScreenshots(mockBrowser, createOptions({ scrollContainer: container, hideScrollBars: false }))

            expect(vi.mocked(getScrollContainerFullPageScreenshotsData).mock.calls[0][1]).toMatchObject({ hideScrollBars: false })
        })

        it('should use the viewport in device pixels on Android native web screenshots', async () => {
            const { getScrollContainerFullPageScreenshotsData } = await import('./screenshots.js')
            const deviceRectangles = mock<FullPageScreenshotDataOptions['deviceRectangles']>({ viewport })

            await takeFullPageScreenshots(mockBrowser, createOptions({
                scrollContainer: container, isAndroid: true, isAndroidNativeWebScreenshot: true, devicePixelRatio: 3, deviceRectangles,
            }))

            expect(vi.mocked(getScrollContainerFullPageScreenshotsData).mock.calls[0][1].viewport).toEqual({ x: 0, y: 100, width: 360, height: 600 })
        })

        it('should use the viewport in CSS pixels on iOS', async () => {
            const { getScrollContainerFullPageScreenshotsData } = await import('./screenshots.js')
            const deviceRectangles = mock<FullPageScreenshotDataOptions['deviceRectangles']>({ viewport })

            await takeFullPageScreenshots(mockBrowser, createOptions({ scrollContainer: container, isIOS: true, devicePixelRatio: 3, deviceRectangles }))

            expect(vi.mocked(getScrollContainerFullPageScreenshotsData).mock.calls[0][1].viewport).toEqual(viewport)
        })
    })
})
