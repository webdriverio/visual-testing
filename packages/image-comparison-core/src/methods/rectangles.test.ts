import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'
import type { ChainablePromiseElement } from 'webdriverio'
import { determineElementRectangles, determineScreenRectangles, determineStatusAddressToolBarRectangles, determineIgnoreRegions } from './rectangles.js'
import { IMAGE_STRING } from '../mocks/mocks.js'
import type { ElementRectanglesOptions, ScreenRectanglesOptions, StatusAddressToolBarRectanglesOptions, DeviceRectangles } from './rectangles.interfaces.js'

vi.mock('@wdio/globals', () => ({
    browser: {
        execute: vi.fn(),
    }
}))

vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))

describe('rectangles', () => {
    let mockBrowserInstance: WebdriverIO.Browser
    let mockExecute: ReturnType<typeof vi.fn>
    let mockGetElementRect: ReturnType<typeof vi.fn>

    beforeEach(() => {
        mockExecute = vi.fn()
        mockGetElementRect = vi.fn()

        mockBrowserInstance = {
            execute: mockExecute,
            getElementRect: mockGetElementRect
        } as unknown as WebdriverIO.Browser
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // Base device rectangles object
    const baseDeviceRectangles: DeviceRectangles = {
        bottomBar: { y: 0, x: 0, width: 0, height: 0 },
        homeBar: { y: 0, x: 0, width: 0, height: 0 },
        leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
        rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
        screenSize: { height: 0, width: 0 },
        statusBar: { y: 0, x: 0, width: 0, height: 0 },
        statusBarAndAddressBar: { y: 0, x: 0, width: 0, height: 0 },
        viewport: { y: 0, x: 0, width: 0, height: 0 },
    }

    // Helper function to create element rectangles options
    const createElementOptions = (overrides: Partial<ElementRectanglesOptions> = {}): ElementRectanglesOptions => ({
        isAndroid: false,
        devicePixelRatio: 2,
        deviceRectangles: baseDeviceRectangles,
        isAndroidNativeWebScreenshot: false,
        innerHeight: 500,
        isIOS: false,
        initialDevicePixelRatio: 2,
        isEmulated: false,
        ...overrides,
    })

    // Helper function to create screen rectangles options
    const createScreenOptions = (overrides: Partial<ScreenRectanglesOptions> = {}): ScreenRectanglesOptions => ({
        innerHeight: 553,
        innerWidth: 375,
        isAndroidNativeWebScreenshot: false,
        isAndroidChromeDriverScreenshot: false,
        isIOS: false,
        devicePixelRatio: 2,
        isLandscape: false,
        initialDevicePixelRatio: 2,
        enableLegacyScreenshotMethod: false,
        isEmulated: false,
        ...overrides,
    })

    // Helper function to create status address toolbar options
    const createStatusAddressToolBarOptions = (overrides: Partial<StatusAddressToolBarRectanglesOptions> = {}): StatusAddressToolBarRectanglesOptions => ({
        blockOutSideBar: false,
        blockOutStatusBar: false,
        blockOutToolBar: false,
        isAndroid: false,
        isAndroidNativeWebScreenshot: false,
        isMobile: false,
        isViewPortScreenshot: false,
        ...overrides,
    })

    // Helper function to create enhanced device rectangles with data
    const createDeviceRectanglesWithData = (overrides: Partial<DeviceRectangles> = {}): DeviceRectangles => ({
        ...baseDeviceRectangles,
        statusBarAndAddressBar: { y: 0, x: 0, width: 1344, height: 320 },
        viewport: { y: 320, x: 0, width: 1344, height: 2601 },
        bottomBar: { y: 2921, x: 0, width: 1344, height: 71 },
        leftSidePadding: { y: 320, x: 0, width: 0, height: 2601 },
        rightSidePadding: { y: 320, x: 1344, width: 0, height: 2601 },
        ...overrides,
    })

    describe('determineElementRectangles', () => {
        it('should determine them for iOS', async () => {
            const options = createElementOptions({
                isIOS: true,
                innerHeight: 678,
                deviceRectangles: {
                    ...baseDeviceRectangles,
                    viewport: { y: 20, x: 30, width: 0, height: 0 },
                },
            })

            mockExecute.mockResolvedValueOnce({
                height: 120,
                width: 120,
                x: 100,
                y: 10,
            })

            const result = await determineElementRectangles({
                browserInstance: mockBrowserInstance,
                base64Image: IMAGE_STRING,
                options,
                element: 'element',
            })

            expect(result).toMatchSnapshot()
            expect(mockExecute).toHaveBeenCalled()
        })

        it('should determine them for Android Native webscreenshot', async () => {
            const options = createElementOptions({
                isAndroid: true,
                devicePixelRatio: 3,
                initialDevicePixelRatio: 3,
                isAndroidNativeWebScreenshot: true,
                innerHeight: 678,
                deviceRectangles: {
                    ...baseDeviceRectangles,
                    viewport: { y: 200, x: 300, width: 0, height: 0 },
                },
            })

            mockExecute.mockResolvedValueOnce({
                height: 300,
                width: 200,
                x: 100,
                y: 10,
            })

            const result = await determineElementRectangles({
                browserInstance: mockBrowserInstance,
                base64Image: IMAGE_STRING,
                options,
                element: 'element',
            })

            expect(result).toMatchSnapshot()
            expect(mockExecute).toHaveBeenCalled()
        })

        it('should determine them for Android ChromeDriver', async () => {
            const options = createElementOptions({
                isAndroid: true,
                devicePixelRatio: 1,
                initialDevicePixelRatio: 1,
                innerHeight: 678,
                deviceRectangles: {
                    ...baseDeviceRectangles,
                    viewport: { y: 200, x: 300, width: 0, height: 0 },
                },
            })

            mockExecute.mockResolvedValueOnce({
                height: 20,
                width: 375,
                x: 0,
                y: 0,
            })

            const result = await determineElementRectangles({
                browserInstance: mockBrowserInstance,
                base64Image: IMAGE_STRING,
                options,
                element: 'element',
            })

            expect(result).toMatchSnapshot()
            expect(mockExecute).toHaveBeenCalled()
        })

        it('should determine them for a desktop browser', async () => {
            const options = createElementOptions({
                innerHeight: 500,
            })

            mockExecute.mockResolvedValueOnce({
                height: 20,
                width: 375,
                x: 12,
                y: 34,
            })

            const result = await determineElementRectangles({
                browserInstance: mockBrowserInstance,
                base64Image: IMAGE_STRING,
                options,
                element: 'element',
            })

            expect(result).toMatchSnapshot()
            expect(mockExecute).toHaveBeenCalled()
        })

        it('should determine them for emulated device', async () => {
            const options = createElementOptions({
                isEmulated: true,
                innerHeight: 600,
                devicePixelRatio: 3,
            })

            mockExecute.mockResolvedValueOnce({
                height: 50,
                width: 200,
                x: 15,
                y: 25,
            })

            const result = await determineElementRectangles({
                browserInstance: mockBrowserInstance,
                base64Image: IMAGE_STRING,
                options,
                element: 'element',
            })

            expect(result).toMatchSnapshot()
            expect(mockExecute).toHaveBeenCalled()
        })

        it('should throw an error when the element height is 0', async () => {
            const options = createElementOptions()

            mockExecute.mockResolvedValueOnce({
                height: 0,
                width: 375,
                x: 12,
                y: 34,
            })

            await expect(determineElementRectangles({
                browserInstance: mockBrowserInstance,
                base64Image: IMAGE_STRING,
                options,
                element: { selector: '#elementID' },
            })).rejects.toThrow('The element, with selector "$(#elementID)",is not visible. The dimensions are 375x0')
        })

        it('should throw an error when the element width is 0', async () => {
            const options = createElementOptions()

            mockExecute.mockResolvedValueOnce({
                height: 375,
                width: 0,
                x: 12,
                y: 34,
            })

            await expect(determineElementRectangles({
                browserInstance: mockBrowserInstance,
                base64Image: IMAGE_STRING,
                options,
                element: { selector: '#elementID' },
            })).rejects.toThrow('The element, with selector "$(#elementID)",is not visible. The dimensions are 0x375')
        })

        it('should throw an error when the element width is 0 and no element selector is provided', async () => {
            const options = createElementOptions()

            mockExecute.mockResolvedValueOnce({
                height: 375,
                width: 0,
                x: 12,
                y: 34,
            })

            await expect(determineElementRectangles({
                browserInstance: mockBrowserInstance,
                base64Image: IMAGE_STRING,
                options,
                element: {},
            })).rejects.toThrow('The element is not visible. The dimensions are 0x375')
        })

        it('should handle Android webview elements', async () => {
            const options = createElementOptions({
                isAndroid: true,
                isAndroidNativeWebScreenshot: true,
                devicePixelRatio: 2,
                deviceRectangles: {
                    ...baseDeviceRectangles,
                    viewport: { y: 100, x: 50, width: 375, height: 667 },
                },
            })

            mockExecute.mockResolvedValueOnce({
                height: 100,
                width: 200,
                x: 50,
                y: 75,
            })

            const result = await determineElementRectangles({
                browserInstance: mockBrowserInstance,
                base64Image: IMAGE_STRING,
                options,
                element: 'webview-element',
            })

            expect(result).toMatchSnapshot()
            expect(mockExecute).toHaveBeenCalled()
        })
    })

    describe('determineScreenRectangles', () => {
        it('should determine them for iOS', async () => {
            const options = createScreenOptions({
                isIOS: true,
            })

            expect(determineScreenRectangles(IMAGE_STRING, options)).toMatchSnapshot()
        })

        it('should determine them for Android ChromeDriver', async () => {
            const options = createScreenOptions({
                isAndroidChromeDriverScreenshot: true,
            })

            expect(determineScreenRectangles(IMAGE_STRING, options)).toMatchSnapshot()
        })

        it('should determine them for Android Native webscreenshot', async () => {
            const options = createScreenOptions({
                isAndroidNativeWebScreenshot: true,
            })

            expect(determineScreenRectangles(IMAGE_STRING, options)).toMatchSnapshot()
        })

        it('should determine them for desktop browser', async () => {
            const options = createScreenOptions({
                innerHeight: 768,
                innerWidth: 1024,
                devicePixelRatio: 1,
            })

            expect(determineScreenRectangles(IMAGE_STRING, options)).toMatchSnapshot()
        })

        it('should determine them for emulated device', async () => {
            const options = createScreenOptions({
                isEmulated: true,
                devicePixelRatio: 3,
                isLandscape: true,
            })

            expect(determineScreenRectangles(IMAGE_STRING, options)).toMatchSnapshot()
        })

        it('should determine them with legacy screenshot method', async () => {
            const options = createScreenOptions({
                enableLegacyScreenshotMethod: true,
                isIOS: true,
            })

            expect(determineScreenRectangles(IMAGE_STRING, options)).toMatchSnapshot()
        })
    })

    describe('determineStatusAddressToolBarRectangles', () => {
        it('should determine the rectangles with all blockouts enabled', async () => {
            const options = createStatusAddressToolBarOptions({
                blockOutSideBar: true,
                blockOutStatusBar: true,
                blockOutToolBar: true,
                isAndroid: true,
                isAndroidNativeWebScreenshot: true,
                isMobile: true,
                isViewPortScreenshot: true,
            })
            const deviceRectangles = createDeviceRectanglesWithData()

            expect(determineStatusAddressToolBarRectangles({ deviceRectangles, options })).toMatchSnapshot()
        })

        it('should determine the rectangles with no blockouts', async () => {
            const options = createStatusAddressToolBarOptions()
            const deviceRectangles = createDeviceRectanglesWithData()

            expect(determineStatusAddressToolBarRectangles({ deviceRectangles, options })).toMatchSnapshot()
        })

        it('should determine the rectangles with only status bar blockout', async () => {
            const options = createStatusAddressToolBarOptions({
                blockOutStatusBar: true,
                isAndroid: true,
                isMobile: true,
                isViewPortScreenshot: true,
            })
            const deviceRectangles = createDeviceRectanglesWithData()

            expect(determineStatusAddressToolBarRectangles({ deviceRectangles, options })).toMatchSnapshot()
        })

        it('should determine the rectangles with only toolbar blockout', async () => {
            const options = createStatusAddressToolBarOptions({
                blockOutToolBar: true,
                isAndroid: true,
                isMobile: true,
                isViewPortScreenshot: true,
            })
            const deviceRectangles = createDeviceRectanglesWithData()

            expect(determineStatusAddressToolBarRectangles({ deviceRectangles, options })).toMatchSnapshot()
        })

        it('should determine the rectangles with only sidebar blockout', async () => {
            const options = createStatusAddressToolBarOptions({
                blockOutSideBar: true,
                isAndroid: true,
                isMobile: true,
                isViewPortScreenshot: true,
            })
            const deviceRectangles = createDeviceRectanglesWithData()

            expect(determineStatusAddressToolBarRectangles({ deviceRectangles, options })).toMatchSnapshot()
        })

        it('should determine the rectangles for iOS with blockouts', async () => {
            const options = createStatusAddressToolBarOptions({
                blockOutSideBar: true,
                blockOutStatusBar: true,
                blockOutToolBar: true,
                isAndroid: false,
                isAndroidNativeWebScreenshot: false,
                isMobile: true,
                isViewPortScreenshot: true,
            })
            const deviceRectangles = createDeviceRectanglesWithData()

            expect(determineStatusAddressToolBarRectangles({ deviceRectangles, options })).toMatchSnapshot()
        })

        it('should determine the rectangles for non-mobile device', async () => {
            const options = createStatusAddressToolBarOptions({
                blockOutStatusBar: true,
                isMobile: false,
                isViewPortScreenshot: false,
            })
            const deviceRectangles = createDeviceRectanglesWithData()

            expect(determineStatusAddressToolBarRectangles({ deviceRectangles, options })).toMatchSnapshot()
        })

        it('should determine the rectangles for Android without native web screenshot', async () => {
            const options = createStatusAddressToolBarOptions({
                blockOutStatusBar: true,
                blockOutToolBar: true,
                isAndroid: true,
                isAndroidNativeWebScreenshot: false,
                isMobile: true,
                isViewPortScreenshot: true,
            })
            const deviceRectangles = createDeviceRectanglesWithData()

            expect(determineStatusAddressToolBarRectangles({ deviceRectangles, options })).toMatchSnapshot()
        })

        it('should handle empty device rectangles', async () => {
            const options = createStatusAddressToolBarOptions({
                blockOutStatusBar: true,
                blockOutToolBar: true,
                isAndroid: true,
                isMobile: true,
                isViewPortScreenshot: true,
            })
            const deviceRectangles = baseDeviceRectangles

            expect(determineStatusAddressToolBarRectangles({ deviceRectangles, options })).toMatchSnapshot()
        })
    })

    describe('determineIgnoreRegions', () => {
        it('should handle mixed ignore regions and elements', async () => {
            const mockElement1 = { elementId: 'element1', selector: '#test1' } as WebdriverIO.Element
            const mockElement2 = { elementId: 'element2', selector: '#test2' } as WebdriverIO.Element
            const mockRegion = { x: 10, y: 20, width: 100, height: 150 }

            mockGetElementRect.mockResolvedValueOnce({ x: 50, y: 60, width: 200, height: 250 })
                .mockResolvedValueOnce({ x: 70, y: 80, width: 300, height: 350 })

            const ignores = [mockElement1, mockRegion, mockElement2]
            const result = await determineIgnoreRegions(mockBrowserInstance, ignores)

            expect(result).toEqual([
                { x: 10, y: 20, width: 100, height: 150 },
                { x: 50, y: 60, width: 200, height: 250 },
                { x: 70, y: 80, width: 300, height: 350 }
            ])
            expect(mockGetElementRect).toHaveBeenCalledTimes(2)
        })

        it('should handle only regions', async () => {
            const mockRegions = [
                { x: 10, y: 20, width: 100, height: 150 },
                { x: 30, y: 40, width: 200, height: 250 }
            ]

            const result = await determineIgnoreRegions(mockBrowserInstance, mockRegions)

            expect(result).toEqual(mockRegions)
            expect(mockGetElementRect).not.toHaveBeenCalled()
        })

        it('should handle only elements', async () => {
            const mockElement1 = { elementId: 'element1', selector: '#test1' } as WebdriverIO.Element
            const mockElement2 = { elementId: 'element2', selector: '#test2' } as WebdriverIO.Element

            mockGetElementRect.mockResolvedValueOnce({ x: 50, y: 60, width: 200, height: 250 })
                .mockResolvedValueOnce({ x: 70, y: 80, width: 300, height: 350 })

            const result = await determineIgnoreRegions(mockBrowserInstance, [mockElement1, mockElement2])

            expect(result).toEqual([
                { x: 50, y: 60, width: 200, height: 250 },
                { x: 70, y: 80, width: 300, height: 350 }
            ])
            expect(mockGetElementRect).toHaveBeenCalledTimes(2)
        })

        it('should throw error for invalid ignore regions', async () => {
            const invalidIgnores = [
                'invalid-string',
                { invalid: 'object' },
                123
            ]

            // @ts-expect-error - invalid ignore regions
            await expect(determineIgnoreRegions(mockBrowserInstance, invalidIgnores))
                .rejects.toThrow('Invalid elements or regions')
        })

        it('should round coordinates', async () => {
            const mockElement = { elementId: 'element1', selector: '#test1' } as WebdriverIO.Element
            const mockRegion = { x: 10.7, y: 20.3, width: 100.9, height: 150.1 }

            mockGetElementRect.mockResolvedValueOnce({ x: 50.4, y: 60.8, width: 200.2, height: 250.6 })

            const result = await determineIgnoreRegions(mockBrowserInstance, [mockRegion, mockElement])

            expect(result).toEqual([
                { x: 11, y: 20, width: 101, height: 150 },
                { x: 50, y: 61, width: 200, height: 251 }
            ])
        })

        it('should handle nested element arrays', async () => {
            const mockElement1 = { elementId: 'element1', selector: '#test1' } as WebdriverIO.Element
            const mockElement2 = { elementId: 'element2', selector: '#test2' } as WebdriverIO.Element

            mockGetElementRect.mockResolvedValueOnce({ x: 50, y: 60, width: 200, height: 250 })
                .mockResolvedValueOnce({ x: 70, y: 80, width: 300, height: 350 })

            const result = await determineIgnoreRegions(mockBrowserInstance, [mockElement1, mockElement2])

            expect(result).toEqual([
                { x: 50, y: 60, width: 200, height: 250 },
                { x: 70, y: 80, width: 300, height: 350 }
            ])
            expect(mockGetElementRect).toHaveBeenCalledTimes(2)
        })

        it('should handle chainable promise elements', async () => {
            const chainableElement = Promise.resolve({ elementId: 'element1', selector: '#test1' } as WebdriverIO.Element)

            mockGetElementRect.mockResolvedValueOnce({ x: 50, y: 60, width: 200, height: 250 })

            const result = await determineIgnoreRegions(mockBrowserInstance, [chainableElement as unknown as ChainablePromiseElement])

            expect(result).toEqual([
                { x: 50, y: 60, width: 200, height: 250 }
            ])
            expect(mockGetElementRect).toHaveBeenCalledTimes(1)
        })
    })
})
