import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest'
import { join } from 'node:path'
import logger from '@wdio/logger'
import { takeElementScreenshot } from './takeElementScreenshots.js'
import { takeBase64BiDiScreenshot, takeWebElementScreenshot } from './screenshots.js'
import { makeCroppedBase64Image } from './images.js'
import { getBase64ScreenshotSize, waitFor, hasResizeDimensions } from '../helpers/utils.js'
import type { ElementScreenshotDataOptions } from './screenshots.interfaces.js'

const log = logger('test')

vi.mock('./screenshots.js', () => ({
    takeBase64BiDiScreenshot: vi.fn().mockResolvedValue('bidi-screenshot-data'),
    takeWebElementScreenshot: vi.fn().mockResolvedValue({
        base64Image: 'web-element-screenshot-data',
        rectangles: { x: 0, y: 0, width: 100, height: 100 },
        isWebDriverElementScreenshot: false
    })
}))
vi.mock('./images.js', () => ({
    makeCroppedBase64Image: vi.fn().mockResolvedValue('cropped-screenshot-data')
}))
vi.mock('../clientSideScripts/scrollElementIntoView.js', () => ({
    default: vi.fn()
}))
vi.mock('../clientSideScripts/scrollToPosition.js', () => ({
    default: vi.fn()
}))
vi.mock('../helpers/utils.js', () => ({
    getBase64ScreenshotSize: vi.fn().mockReturnValue({ width: 100, height: 100 }),
    waitFor: vi.fn().mockResolvedValue(undefined),
    hasResizeDimensions: vi.fn().mockReturnValue(false)
}))
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))

describe('takeElementScreenshot', () => {
    const takeBase64BiDiScreenshotSpy = vi.mocked(takeBase64BiDiScreenshot)
    const takeWebElementScreenshotSpy = vi.mocked(takeWebElementScreenshot)
    const makeCroppedBase64ImageSpy = vi.mocked(makeCroppedBase64Image)
    const getBase64ScreenshotSizeSpy = vi.mocked(getBase64ScreenshotSize)
    const waitForSpy = vi.mocked(waitFor)
    const hasResizeDimensionsSpy = vi.mocked(hasResizeDimensions)

    const executeMock = vi.fn().mockResolvedValue(undefined)
    const getElementRectMock = vi.fn().mockResolvedValue({ x: 10, y: 20, width: 100, height: 200 })

    const browserInstance = {
        execute: executeMock,
        getElementRect: getElementRectMock
    } as any

    const baseOptions: ElementScreenshotDataOptions = {
        addressBarShadowPadding: 6,
        autoElementScroll: false,
        deviceName: 'desktop',
        devicePixelRatio: 2,
        deviceRectangles: {
            bottomBar: { height: 0, width: 390, x: 0, y: 800 },
            homeBar: { height: 34, width: 390, x: 0, y: 780 },
            leftSidePadding: { height: 0, width: 0, x: 0, y: 0 },
            rightSidePadding: { height: 0, width: 0, x: 0, y: 0 },
            screenSize: { height: 844, width: 390 },
            statusBar: { height: 47, width: 390, x: 0, y: 0 },
            statusBarAndAddressBar: { height: 47, width: 390, x: 0, y: 0 },
            viewport: { height: 733, width: 390, x: 0, y: 47 }
        },
        element: { elementId: 'test-element' } as any,
        isEmulated: false,
        initialDevicePixelRatio: 2,
        innerHeight: 900,
        isAndroid: false,
        isAndroidChromeDriverScreenshot: false,
        isAndroidNativeWebScreenshot: false,
        isIOS: false,
        isLandscape: false,
        isMobile: false,
        resizeDimensions: { top: 0, right: 0, bottom: 0, left: 0 },
        toolBarShadowPadding: 5
    }

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('BiDi screenshots', () => {
        it('should take BiDi screenshot from document when shouldUseBidi is true', async () => {
            const result = await takeElementScreenshot(browserInstance, baseOptions, true)

            expect(result).toEqual({
                base64Image: 'bidi-screenshot-data',
                isWebDriverElementScreenshot: false
            })
            expect(getElementRectMock).toHaveBeenCalledWith('test-element')
            expect(takeBase64BiDiScreenshotSpy).toHaveBeenCalledWith({
                browserInstance,
                origin: 'document',
                clip: { x: 10, y: 20, width: 100, height: 200 }
            })
            expect(takeWebElementScreenshotSpy).not.toHaveBeenCalled()
            expect(makeCroppedBase64ImageSpy).not.toHaveBeenCalled()
        })
        //
        // We intentionally rely on BiDi with origin: 'document' only. If that
        // ever fails, we surface the underlying error instead of silently
        // falling back to a different origin with mismatched coordinates.

        it('should scroll element into view when autoElementScroll is enabled', async () => {
            const optionsWithScroll = { ...baseOptions, autoElementScroll: true }
            executeMock.mockResolvedValueOnce(100) // previous scroll position

            const result = await takeElementScreenshot(browserInstance, optionsWithScroll, true)

            expect(result).toEqual({
                base64Image: 'bidi-screenshot-data',
                isWebDriverElementScreenshot: false
            })
            // First call: scrollElementIntoView, second call: scrollToPosition (restore)
            expect(executeMock).toHaveBeenCalledTimes(2)
            expect(executeMock.mock.calls[0]).toMatchSnapshot()
            expect(executeMock.mock.calls[1]).toMatchSnapshot()
            expect(waitForSpy).toHaveBeenCalledWith(100)
        })

        it('should not restore scroll when autoElementScroll is enabled but no previous position', async () => {
            const optionsWithScroll = { ...baseOptions, autoElementScroll: true }
            executeMock.mockResolvedValueOnce(undefined) // no previous position

            await takeElementScreenshot(browserInstance, optionsWithScroll, true)

            // Only the scrollElementIntoView call, no restore
            expect(executeMock).toHaveBeenCalledTimes(1)
            expect(waitForSpy).toHaveBeenCalledWith(100)
        })

        it('should resolve a Promise-wrapped element (ChainablePromiseElement) before passing to browser.execute()', async () => {
            const resolvedElement = { elementId: 'promise-element' }
            const optionsWithPromiseElement = {
                ...baseOptions,
                autoElementScroll: true,
                element: Promise.resolve(resolvedElement) as any,
            }
            executeMock.mockResolvedValueOnce(100)

            await takeElementScreenshot(browserInstance, optionsWithPromiseElement, true)

            expect(getElementRectMock).toHaveBeenCalledWith('promise-element')
            // The resolved element (not the Promise) must be passed to browser.execute()
            expect(executeMock.mock.calls[0][1]).toEqual(resolvedElement)
        })
    })

    describe('BiDi viewport screenshots', () => {
        const vpOptions: ElementScreenshotDataOptions = {
            ...baseOptions,
            biDiOrigin: 'viewport',
            innerWidth: 1280,
            innerHeight: 720,
        }

        it('should take viewport screenshot when element is fully inside the viewport', async () => {
            // element at (10, 20, 100x200) — fits in 1280x720 viewport
            const result = await takeElementScreenshot(browserInstance, vpOptions, true)

            expect(result).toEqual({
                base64Image: 'bidi-screenshot-data',
                isWebDriverElementScreenshot: false,
            })
            expect(takeBase64BiDiScreenshotSpy).toHaveBeenCalledWith({
                browserInstance,
                origin: 'viewport',
                clip: { x: 10, y: 20, width: 100, height: 200 },
            })
        })

        it('should throw when element dimensions exceed the viewport', async () => {
            getElementRectMock.mockResolvedValueOnce({ x: 0, y: 0, width: 1400, height: 800 })

            const err = await takeElementScreenshot(browserInstance, vpOptions, true).catch(e => e) as Error
            expect(err.message).toMatch(/element dimensions \(1400x800px\) exceed the viewport \(1280x720px\)/)
            expect(err.message).toMatch(/biDiOrigin: 'document'/)
            expect(err.message).toMatch(/composited layers/)
        })

        it('should throw when element is completely outside the viewport', async () => {
            // element below the fold
            getElementRectMock.mockResolvedValueOnce({ x: 0, y: 800, width: 100, height: 200 })

            const err = await takeElementScreenshot(browserInstance, vpOptions, true).catch(e => e) as Error
            expect(err.message).toMatch(/element is not in the viewport/)
            expect(err.message).toMatch(/scrollIntoView/)
            expect(err.message).toMatch(/autoElementScroll: true/)
        })

        it('should throw when element is partially outside the viewport but fits', async () => {
            // element starts at x=-10, so it bleeds left of the viewport
            getElementRectMock.mockResolvedValueOnce({ x: -10, y: 0, width: 100, height: 200 })

            const err = await takeElementScreenshot(browserInstance, vpOptions, true).catch(e => e) as Error
            expect(err.message).toMatch(/not fully visible in the viewport/)
            expect(err.message).toMatch(/fits within the viewport/)
            expect(err.message).toMatch(/autoElementScroll: true/)
        })

        it('should include element and viewport dimensions in the error messages', async () => {
            getElementRectMock.mockResolvedValueOnce({ x: 0, y: 900, width: 200, height: 100 })

            const err = await takeElementScreenshot(browserInstance, vpOptions, true).catch(e => e) as Error
            expect(err.message).toMatch(/x=0, y=900, 200x100px/)
            expect(err.message).toMatch(/viewport: 1280x720px/)
        })

        it('should scroll element into view before validating when autoElementScroll is true', async () => {
            const vpScrollOptions: ElementScreenshotDataOptions = { ...vpOptions, autoElementScroll: true }
            // After scroll, element is fully in viewport
            executeMock.mockResolvedValueOnce(300) // previous scroll position

            const result = await takeElementScreenshot(browserInstance, vpScrollOptions, true)

            expect(result.base64Image).toBe('bidi-screenshot-data')
            // scrollElementIntoView + scrollToPosition (restore)
            expect(executeMock).toHaveBeenCalledTimes(2)
            expect(takeBase64BiDiScreenshotSpy).toHaveBeenCalledWith(
                expect.objectContaining({ origin: 'viewport' })
            )
        })

        it('should use origin: document for the default (no biDiOrigin set)', async () => {
            const defaultOptions = { ...vpOptions, biDiOrigin: undefined }

            const result = await takeElementScreenshot(browserInstance, defaultOptions, true)

            expect(result.base64Image).toBe('bidi-screenshot-data')
            expect(takeBase64BiDiScreenshotSpy).toHaveBeenCalledWith(
                expect.objectContaining({ origin: 'document' })
            )
        })
    })

    describe('Legacy screenshots', () => {
        let logErrorSpy: ReturnType<typeof vi.spyOn>

        beforeEach(() => {
            logErrorSpy = vi.spyOn(log, 'error').mockImplementation(() => {})
        })

        afterEach(() => {
            vi.clearAllMocks()
            logErrorSpy.mockRestore()
        })

        it('should take legacy screenshot when shouldUseBidi is false', async () => {
            const result = await takeElementScreenshot(browserInstance, baseOptions, false)

            expect(result).toEqual({
                base64Image: 'cropped-screenshot-data',
                isWebDriverElementScreenshot: false
            })
            expect(takeWebElementScreenshotSpy).toHaveBeenCalledWith({
                addressBarShadowPadding: 6,
                browserInstance,
                devicePixelRatio: 2,
                deviceRectangles: baseOptions.deviceRectangles,
                element: baseOptions.element,
                initialDevicePixelRatio: 2,
                isEmulated: false,
                innerHeight: 900,
                isAndroid: false,
                isAndroidChromeDriverScreenshot: false,
                isAndroidNativeWebScreenshot: false,
                isIOS: false,
                isLandscape: false,
                toolBarShadowPadding: 5,
                fallback: false
            })
            expect(makeCroppedBase64ImageSpy).toHaveBeenCalledWith({
                addIOSBezelCorners: false,
                base64Image: 'web-element-screenshot-data',
                deviceName: 'desktop',
                devicePixelRatio: 2,
                isWebDriverElementScreenshot: false,
                isIOS: false,
                isLandscape: false,
                rectangles: { x: 0, y: 0, width: 100, height: 100 },
                resizeDimensions: { top: 0, right: 0, bottom: 0, left: 0 }
            })
            expect(takeBase64BiDiScreenshotSpy).not.toHaveBeenCalled()
        })

        it('should handle auto scroll when enabled', async () => {
            const optionsWithScroll = { ...baseOptions, autoElementScroll: true }
            executeMock.mockResolvedValueOnce(100) // scroll position

            const result = await takeElementScreenshot(browserInstance, optionsWithScroll, false)

            expect(result).toEqual({
                base64Image: 'cropped-screenshot-data',
                isWebDriverElementScreenshot: false
            })
            expect(executeMock).toHaveBeenCalledTimes(2)
            // First call for scrolling element into view
            expect(executeMock.mock.calls[0]).toMatchSnapshot()
            // Second call for scrolling back to original position
            expect(executeMock.mock.calls[1]).toMatchSnapshot()
            expect(waitForSpy).toHaveBeenCalledWith(100)
        })

        it('should not scroll back when autoElementScroll is enabled but no current position', async () => {
            const optionsWithScroll = { ...baseOptions, autoElementScroll: true }
            executeMock.mockResolvedValueOnce(undefined) // no scroll position returned

            const result = await takeElementScreenshot(browserInstance, optionsWithScroll, false)

            expect(result).toMatchSnapshot()
            expect(executeMock).toHaveBeenCalledTimes(1) // Only the scroll into view call
            expect(waitForSpy).toHaveBeenCalledWith(100)
        })

        it('should resolve a Promise-wrapped element (ChainablePromiseElement) before passing to browser.execute()', async () => {
            const resolvedElement = { elementId: 'promise-element' }
            const optionsWithPromiseElement = {
                ...baseOptions,
                autoElementScroll: true,
                element: Promise.resolve(resolvedElement) as any,
            }
            executeMock.mockResolvedValueOnce(100)

            await takeElementScreenshot(browserInstance, optionsWithPromiseElement, false)

            // The resolved element (not the Promise) must be passed to browser.execute()
            expect(executeMock.mock.calls[0][1]).toEqual(resolvedElement)
            // And also passed to takeWebElementScreenshot
            expect(takeWebElementScreenshotSpy).toHaveBeenCalledWith(
                expect.objectContaining({ element: resolvedElement })
            )
        })

        it('should enable fallback when resizeDimensions is provided', async () => {
            const optionsWithResize = {
                ...baseOptions,
                resizeDimensions: { top: 10, right: 10, bottom: 10, left: 10 }
            }
            hasResizeDimensionsSpy.mockReturnValueOnce(true)

            const result = await takeElementScreenshot(browserInstance, optionsWithResize, false)

            expect(result).toMatchSnapshot()
            expect(hasResizeDimensionsSpy).toHaveBeenCalledWith(optionsWithResize.resizeDimensions)
            expect(takeWebElementScreenshotSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    fallback: true
                })
            )
        })

        it('should enable fallback when device is emulated', async () => {
            const optionsEmulated = { ...baseOptions, isEmulated: true }

            const result = await takeElementScreenshot(browserInstance, optionsEmulated, false)

            expect(result).toMatchSnapshot()
            expect(takeWebElementScreenshotSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    fallback: true
                })
            )
        })

        it('should disable fallback when no resizeDimensions and not emulated', async () => {
            const optionsNoResize = {
                ...baseOptions,
                resizeDimensions: undefined,
                isEmulated: false
            }

            hasResizeDimensionsSpy.mockReturnValueOnce(false)

            const result = await takeElementScreenshot(browserInstance, optionsNoResize, false)

            expect(result).toMatchSnapshot()
            expect(hasResizeDimensionsSpy).toHaveBeenCalledWith(undefined)
            expect(takeWebElementScreenshotSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    fallback: false
                })
            )
        })

        it('should handle zero dimensions by falling back to viewport size', async () => {
            takeWebElementScreenshotSpy.mockResolvedValueOnce({
                base64Image: 'web-element-screenshot-data',
                rectangles: { x: 0, y: 0, width: 0, height: 0 },
                isWebDriverElementScreenshot: false
            })

            const result = await takeElementScreenshot(browserInstance, baseOptions, false)

            expect(result).toMatchSnapshot()
            expect(getBase64ScreenshotSizeSpy).toHaveBeenCalledWith('web-element-screenshot-data')
            expect(logErrorSpy.mock.calls).toMatchSnapshot()
            expect(makeCroppedBase64ImageSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    rectangles: { x: 0, y: 0, width: 100, height: 100 }
                })
            )
        })

        it('should handle zero width only', async () => {
            takeWebElementScreenshotSpy.mockResolvedValueOnce({
                base64Image: 'web-element-screenshot-data',
                rectangles: { x: 50, y: 100, width: 0, height: 150 },
                isWebDriverElementScreenshot: true
            })

            const result = await takeElementScreenshot(browserInstance, baseOptions, false)

            expect(result).toMatchSnapshot()
            expect(getBase64ScreenshotSizeSpy).toHaveBeenCalledWith('web-element-screenshot-data')
            expect(logErrorSpy.mock.calls).toMatchSnapshot()
        })

        it('should handle zero height only', async () => {
            takeWebElementScreenshotSpy.mockResolvedValueOnce({
                base64Image: 'web-element-screenshot-data',
                rectangles: { x: 50, y: 100, width: 150, height: 0 },
                isWebDriverElementScreenshot: true
            })

            const result = await takeElementScreenshot(browserInstance, baseOptions, false)

            expect(result).toMatchSnapshot()
            expect(getBase64ScreenshotSizeSpy).toHaveBeenCalledWith('web-element-screenshot-data')
            expect(logErrorSpy.mock.calls).toMatchSnapshot()
        })

        it('should pass correct WebDriver element screenshot flag', async () => {
            takeWebElementScreenshotSpy.mockResolvedValueOnce({
                base64Image: 'web-element-screenshot-data',
                rectangles: { x: 0, y: 0, width: 100, height: 100 },
                isWebDriverElementScreenshot: true
            })

            const result = await takeElementScreenshot(browserInstance, baseOptions, false)

            expect(result).toEqual({
                base64Image: 'cropped-screenshot-data',
                isWebDriverElementScreenshot: true
            })
            expect(makeCroppedBase64ImageSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    isWebDriverElementScreenshot: true
                })
            )
        })
    })

    describe('Edge cases', () => {
        it('should handle devicePixelRatio values and fallback to NaN when falsy', async () => {
            const optionsWithValidDPR = { ...baseOptions, devicePixelRatio: 1 }
            const result1 = await takeElementScreenshot(browserInstance, optionsWithValidDPR, false)

            expect(result1).toMatchSnapshot()
            expect(takeWebElementScreenshotSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    devicePixelRatio: 1
                })
            )
            expect(makeCroppedBase64ImageSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    devicePixelRatio: 1
                })
            )

            vi.clearAllMocks()

            const optionsWithZeroDPR = { ...baseOptions, devicePixelRatio: 0 }
            const result2 = await takeElementScreenshot(browserInstance, optionsWithZeroDPR, false)

            expect(result2).toMatchSnapshot()
            expect(takeWebElementScreenshotSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    devicePixelRatio: 0
                })
            )
            expect(makeCroppedBase64ImageSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    devicePixelRatio: NaN
                })
            )
        })

        it('should handle undefined innerHeight', async () => {
            const optionsWithUndefinedHeight = { ...baseOptions, innerHeight: undefined }

            const result = await takeElementScreenshot(browserInstance, optionsWithUndefinedHeight, false)

            expect(result).toMatchSnapshot()
            expect(takeWebElementScreenshotSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    innerHeight: undefined
                })
            )
        })

        it('should default shouldUseBidi to false when not provided', async () => {
            const result = await takeElementScreenshot(browserInstance, baseOptions)

            expect(result).toEqual({
                base64Image: 'cropped-screenshot-data',
                isWebDriverElementScreenshot: false
            })
            expect(takeBase64BiDiScreenshotSpy).not.toHaveBeenCalled()
            expect(takeWebElementScreenshotSpy).toHaveBeenCalled()
        })
    })
})
