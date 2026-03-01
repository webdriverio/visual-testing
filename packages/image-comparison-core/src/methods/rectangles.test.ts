import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'
import {
    determineElementRectangles,
    determineScreenRectangles,
    determineStatusAddressToolBarRectangles,
    determineIgnoreRegions,
    determineWebFullPageIgnoreRegions,
    determineWebScreenIgnoreRegions,
    determineWebElementIgnoreRegions,
    splitIgnores,
    determineDeviceBlockOuts,
    prepareIgnoreRectangles
} from './rectangles.js'
import { IMAGE_STRING } from '../mocks/image.js'
import type { ElementRectanglesOptions, ScreenRectanglesOptions, StatusAddressToolBarRectanglesOptions, DeviceRectangles, DetermineDeviceBlockOutsOptions, PrepareIgnoreRectanglesOptions } from './rectangles.interfaces.js'

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
            getElementRect: mockGetElementRect,
            $: vi.fn(),
            $$: vi.fn(),
        } as unknown as WebdriverIO.Browser
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

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
    const createDeviceRectanglesWithData = (overrides: Partial<DeviceRectangles> = {}): DeviceRectangles => ({
        ...baseDeviceRectangles,
        statusBarAndAddressBar: { y: 0, x: 0, width: 1344, height: 320 },
        viewport: { y: 320, x: 0, width: 1344, height: 2601 },
        bottomBar: { y: 2921, x: 0, width: 1344, height: 71 },
        leftSidePadding: { y: 320, x: 0, width: 0, height: 2601 },
        rightSidePadding: { y: 320, x: 1344, width: 0, height: 2601 },
        ...overrides,
    })
    const createDeviceBlockOutsOptions = (overrides: Partial<DetermineDeviceBlockOutsOptions> = {}): DetermineDeviceBlockOutsOptions => ({
        isAndroid: false,
        screenCompareOptions: {
            blockOutStatusBar: false,
            blockOutToolBar: false,
        },
        instanceData: {
            appName: 'TestApp',
            browserName: 'Chrome',
            browserVersion: '118.0.0.0',
            deviceName: 'iPhone 14',
            devicePixelRatio: 2,
            deviceRectangles: {
                bottomBar: { y: 800, x: 0, width: 390, height: 0 },
                homeBar: { x: 0, y: 780, width: 390, height: 34 },
                leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                screenSize: { height: 844, width: 390 },
                statusBar: { x: 0, y: 0, width: 390, height: 47 },
                statusBarAndAddressBar: { y: 0, x: 0, width: 390, height: 47 },
                viewport: { y: 47, x: 0, width: 390, height: 733 }
            },
            initialDevicePixelRatio: 2,
            isAndroid: false,
            isIOS: true,
            isMobile: true,
            logName: 'test-log',
            name: 'test-device',
            nativeWebScreenshot: false,
            platformName: 'iOS',
            platformVersion: '17.0'
        },
        ...overrides,
    })
    const createPrepareIgnoreRectanglesOptions = (overrides: Partial<PrepareIgnoreRectanglesOptions> = {}): PrepareIgnoreRectanglesOptions => ({
        blockOut: [],
        ignoreRegions: [],
        deviceRectangles: createDeviceRectanglesWithData(),
        devicePixelRatio: 2,
        isMobile: false,
        isNativeContext: false,
        isAndroid: false,
        isAndroidNativeWebScreenshot: false,
        isViewPortScreenshot: true,
        imageCompareOptions: {
            blockOutSideBar: false,
            blockOutStatusBar: false,
            blockOutToolBar: false,
        },
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

        it('should use initialDevicePixelRatio when isEmulated and enableLegacyScreenshotMethod are both true', async () => {
            const options = createScreenOptions({
                isEmulated: true,
                enableLegacyScreenshotMethod: true,
                devicePixelRatio: 3,
                initialDevicePixelRatio: 2,
                innerHeight: 768,
                innerWidth: 1024,
            })

            expect(determineScreenRectangles(IMAGE_STRING, options)).toMatchSnapshot()
        })

        it('should handle landscape rotation when height > width', async () => {
            const tallImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVR42mP8/5+hnoEIwDiqAAC4sAP9TiGZQgAAAABJRU5ErkJggg=='
            const options = createScreenOptions({
                isLandscape: true,
                innerHeight: 1024,
                innerWidth: 768,
                devicePixelRatio: 1,
            })

            expect(determineScreenRectangles(tallImage, options)).toMatchSnapshot()
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

        it('should handle edge case with complex mobile configuration', async () => {
            const options = createStatusAddressToolBarOptions({
                blockOutStatusBar: false,
                blockOutToolBar: false,
                blockOutSideBar: false,
                isAndroid: true,
                isAndroidNativeWebScreenshot: true,
                isMobile: true,
                isViewPortScreenshot: true,
            })
            const deviceRectangles = createDeviceRectanglesWithData()

            expect(determineStatusAddressToolBarRectangles({ deviceRectangles, options })).toEqual([])
        })
    })

    describe('splitIgnores', () => {
        it('should split valid elements and regions correctly', () => {
            const mockElement1 = { elementId: 'element1', selector: '#test1' } as WebdriverIO.Element
            const mockElement2 = { elementId: 'element2', selector: '#test2' } as WebdriverIO.Element
            const mockRegion1 = { x: 10, y: 20, width: 100, height: 150 }
            const mockRegion2 = { x: 30, y: 40, width: 200, height: 250 }

            const items = [mockElement1, mockRegion1, mockElement2, mockRegion2]
            const result = splitIgnores(items)

            expect(result).toEqual({
                elements: [mockElement1, mockElement2],
                regions: [mockRegion1, mockRegion2]
            })
        })

        it('should handle nested element arrays', () => {
            const mockElement1 = { elementId: 'element1', selector: '#test1' } as WebdriverIO.Element
            const mockElement2 = { elementId: 'element2', selector: '#test2' } as WebdriverIO.Element
            const mockRegion = { x: 10, y: 20, width: 100, height: 150 }

            const items = [[mockElement1, mockElement2], mockRegion]
            const result = splitIgnores(items)

            expect(result).toEqual({
                elements: [mockElement1, mockElement2],
                regions: [mockRegion]
            })
        })

        it('should handle only elements', () => {
            const mockElement1 = { elementId: 'element1', selector: '#test1' } as WebdriverIO.Element
            const mockElement2 = { elementId: 'element2', selector: '#test2' } as WebdriverIO.Element

            const items = [mockElement1, mockElement2]
            const result = splitIgnores(items)

            expect(result).toEqual({
                elements: [mockElement1, mockElement2],
                regions: []
            })
        })

        it('should handle only regions', () => {
            const mockRegion1 = { x: 10, y: 20, width: 100, height: 150 }
            const mockRegion2 = { x: 30, y: 40, width: 200, height: 250 }

            const items = [mockRegion1, mockRegion2]
            const result = splitIgnores(items)

            expect(result).toEqual({
                elements: [],
                regions: [mockRegion1, mockRegion2]
            })
        })

        it('should handle empty array', () => {
            const result = splitIgnores([])

            expect(result).toEqual({
                elements: [],
                regions: []
            })
        })

        it('should throw error for invalid element in top-level array', () => {
            const invalidItems = [
                'invalid-string',
                { invalid: 'object' },
                123
            ]

            expect(() => splitIgnores(invalidItems)).toThrowErrorMatchingSnapshot()
        })

        it('should throw error for invalid element in nested array', () => {
            const invalidNestedItems = [
                [{ elementId: 'valid', selector: '#valid' }, 'invalid-nested'],
                { x: 10, y: 20, width: 100, height: 150 }
            ]

            expect(() => splitIgnores(invalidNestedItems)).toThrowErrorMatchingSnapshot()
        })

        it('should throw error for mixed invalid items', () => {
            const mixedInvalidItems = [
                [{ elementId: 'valid', selector: '#valid' }, { invalid: 'nested' }],
                'invalid-string',
                { x: 10, y: 20, width: 100, height: 150 },
                null
            ]

            expect(() => splitIgnores(mixedInvalidItems)).toThrow('Invalid elements or regions')
        })

        it('should handle mixed valid and invalid items in nested array', () => {
            const validElement = { elementId: 'element1', selector: '#test1' } as WebdriverIO.Element
            const items = [
                [validElement, 'invalid'],
                { x: 10, y: 20, width: 100, height: 150 }
            ]

            expect(() => splitIgnores(items)).toThrowErrorMatchingSnapshot()
        })

        it('should handle object that looks like element but missing properties', () => {
            const almostElement = { elementId: 'element1' }
            const items = [almostElement]

            expect(() => splitIgnores(items)).toThrow('Invalid elements or regions')
        })

        it('should handle object that looks like region but missing properties', () => {
            const almostRegion = { x: 10, y: 20, width: 100 }
            const items = [almostRegion]

            expect(() => splitIgnores(items)).toThrow('Invalid elements or regions')
        })

        it('should handle region with non-numeric properties', () => {
            const invalidRegion = { x: '10', y: 20, width: 100, height: 150 }
            const items = [invalidRegion]

            expect(() => splitIgnores(items)).toThrow('Invalid elements or regions')
        })

        it('should handle element with non-string properties', () => {
            const invalidElement = { elementId: 123, selector: '#test' }
            const items = [invalidElement]

            expect(() => splitIgnores(items)).toThrow('Invalid elements or regions')
        })
    })

    describe('determineIgnoreRegions', () => {
        it('should await promises, combine regions and elements, and round coordinates', async () => {
            const mockElement = { elementId: 'element1', selector: '#test1' } as WebdriverIO.Element
            const mockRegion = { x: 10.7, y: 20.3, width: 100.9, height: 150.1 }

            mockGetElementRect.mockResolvedValueOnce({ x: 50.4, y: 60.8, width: 200.2, height: 250.6 })

            const ignores = [mockElement, mockRegion]
            const result = await determineIgnoreRegions(mockBrowserInstance, ignores)

            expect(result).toEqual([
                { x: 11, y: 20, width: 101, height: 150 },
                { x: 50, y: 61, width: 200, height: 251 }
            ])
            expect(mockGetElementRect).toHaveBeenCalledWith('element1')
        })

        it('should handle Promise.all correctly for chainable elements', async () => {
            const chainableElement = Promise.resolve({ elementId: 'element1', selector: '#test1' } as WebdriverIO.Element)
            const mockRegion = { x: 10, y: 20, width: 100, height: 150 }

            mockGetElementRect.mockResolvedValueOnce({ x: 50, y: 60, width: 200, height: 250 })

            const ignores = [chainableElement, mockRegion]
            const result = await determineIgnoreRegions(mockBrowserInstance, ignores as any)

            expect(result).toEqual([
                { x: 10, y: 20, width: 100, height: 150 },
                { x: 50, y: 60, width: 200, height: 250 }
            ])
            expect(mockGetElementRect).toHaveBeenCalledWith('element1')
        })

        it('should handle empty arrays', async () => {
            const result = await determineIgnoreRegions(mockBrowserInstance, [])

            expect(result).toEqual([])
            expect(mockGetElementRect).not.toHaveBeenCalled()
        })

        it('should delegate validation to splitIgnores and propagate errors', async () => {
            const invalidIgnores = ['invalid-string']

            // @ts-expect-error - invalid ignore regions for testing
            await expect(determineIgnoreRegions(mockBrowserInstance, invalidIgnores))
                .rejects.toThrow('Invalid elements or regions')
        })
    })

    describe('determineWebScreenIgnoreRegions', () => {
        const desktopOptions = {
            browserInstance: null as unknown as WebdriverIO.Browser,
            devicePixelRatio: 2,
            deviceRectangles: baseDeviceRectangles,
            isAndroid: false,
            isAndroidNativeWebScreenshot: false,
            isIOS: false,
            ignoreRegionPadding: 0,
        }

        beforeEach(() => {
            desktopOptions.browserInstance = mockBrowserInstance
        })

        it('should resolve elements via raw BCR on desktop and apply DPR', async () => {
            const mockElement = { elementId: 'el1', selector: '.nav' } as WebdriverIO.Element
            const freshElement = { elementId: 'el1-fresh', selector: '.nav' } as unknown as WebdriverIO.Element
            vi.mocked(mockBrowserInstance.$$).mockResolvedValueOnce([freshElement] as any)
            mockExecute.mockResolvedValueOnce({ x: 10, y: 20, width: 200, height: 50 })

            const result = await determineWebScreenIgnoreRegions(desktopOptions, [mockElement])

            expect(mockBrowserInstance.$$).toHaveBeenCalledWith('.nav')
            expect(mockExecute).toHaveBeenCalledOnce()
            expect(result).toEqual([
                { x: 20, y: 40, width: 400, height: 100 },
            ])
        })

        it('should add DPR-scaled viewport offset on iOS and re-query elements via $$', async () => {
            const iosDeviceRectangles = {
                ...baseDeviceRectangles,
                viewport: { y: 94, x: 0, width: 390, height: 650 },
            }
            const iosOptions = {
                ...desktopOptions,
                devicePixelRatio: 3,
                deviceRectangles: iosDeviceRectangles,
                isIOS: true,
            }
            const mockElement = { elementId: 'el1', selector: '.hero' } as WebdriverIO.Element
            const freshElement = { elementId: 'el1-fresh', selector: '.hero' } as unknown as WebdriverIO.Element
            vi.mocked(mockBrowserInstance.$$).mockResolvedValueOnce([freshElement] as any)
            mockExecute.mockResolvedValueOnce({ x: 0, y: 100, width: 390, height: 200 })

            const result = await determineWebScreenIgnoreRegions(iosOptions, [mockElement])

            expect(mockBrowserInstance.$$).toHaveBeenCalledWith('.hero')
            expect(mockBrowserInstance.$).not.toHaveBeenCalled()
            expect(result).toEqual([
                { x: 0, y: 582, width: 1170, height: 600 },
            ])
        })

        it('should correctly resolve multiple elements sharing the same selector on iOS', async () => {
            const iosDeviceRectangles = {
                ...baseDeviceRectangles,
                viewport: { y: 94, x: 0, width: 390, height: 650 },
            }
            const iosOptions = {
                ...desktopOptions,
                devicePixelRatio: 1,
                deviceRectangles: iosDeviceRectangles,
                isIOS: true,
            }
            const el1 = { elementId: 'a', selector: '.card' } as WebdriverIO.Element
            const el2 = { elementId: 'b', selector: '.card' } as WebdriverIO.Element
            const el3 = { elementId: 'c', selector: '.card' } as WebdriverIO.Element

            const fresh1 = { elementId: 'f1', selector: '.card' } as unknown as WebdriverIO.Element
            const fresh2 = { elementId: 'f2', selector: '.card' } as unknown as WebdriverIO.Element
            const fresh3 = { elementId: 'f3', selector: '.card' } as unknown as WebdriverIO.Element
            vi.mocked(mockBrowserInstance.$$).mockResolvedValueOnce([fresh1, fresh2, fresh3] as any)

            mockExecute
                .mockResolvedValueOnce({ x: 0, y: 100, width: 390, height: 50 })
                .mockResolvedValueOnce({ x: 0, y: 200, width: 390, height: 50 })
                .mockResolvedValueOnce({ x: 0, y: 300, width: 390, height: 50 })

            const result = await determineWebScreenIgnoreRegions(iosOptions, [[el1, el2, el3]])

            // $$ called once for the shared selector, not $ three times
            expect(mockBrowserInstance.$$).toHaveBeenCalledTimes(1)
            expect(mockBrowserInstance.$$).toHaveBeenCalledWith('.card')
            // execute called with each fresh element
            expect(mockExecute).toHaveBeenCalledTimes(3)
            // Each region has different y (viewport offset 94 added)
            expect(result).toEqual([
                { x: 0, y: 194, width: 390, height: 50 },
                { x: 0, y: 294, width: 390, height: 50 },
                { x: 0, y: 394, width: 390, height: 50 },
            ])
        })

        it('should add device-pixel viewport offset on Android native web screenshot', async () => {
            const androidDeviceRectangles = {
                ...baseDeviceRectangles,
                // On Android, viewport offset is already in device pixels
                // (injectWebviewOverlay pre-scales by DPR)
                viewport: { y: 240, x: 0, width: 1236, height: 1956 },
            }
            const androidOptions = {
                ...desktopOptions,
                devicePixelRatio: 3,
                deviceRectangles: androidDeviceRectangles,
                isAndroid: true,
                isAndroidNativeWebScreenshot: true,
            }
            const mockElement = { elementId: 'el1', selector: '#header' } as WebdriverIO.Element
            vi.mocked(mockBrowserInstance.$$).mockResolvedValueOnce([mockElement] as any)
            mockExecute.mockResolvedValueOnce({ x: 0, y: 0, width: 412, height: 64 })

            const result = await determineWebScreenIgnoreRegions(androidOptions, [mockElement])

            // BCR × DPR + viewport (already device px):
            // x: 0*3 + 0 = 0, y: 0*3 + 240 = 240, w: 412*3 = 1236, h: 64*3 = 192
            expect(result).toEqual([
                { x: 0, y: 240, width: 1236, height: 192 },
            ])
        })

        it('should NOT add viewport offset on Android ChromeDriver screenshot', async () => {
            const androidChromeOptions = {
                ...desktopOptions,
                devicePixelRatio: 3,
                isAndroid: true,
                isAndroidNativeWebScreenshot: false,
            }
            const mockElement = { elementId: 'el1', selector: '#header' } as WebdriverIO.Element
            vi.mocked(mockBrowserInstance.$$).mockResolvedValueOnce([mockElement] as any)
            mockExecute.mockResolvedValueOnce({ x: 0, y: 0, width: 412, height: 64 })

            const result = await determineWebScreenIgnoreRegions(androidChromeOptions, [mockElement])

            // BCR × DPR only, no viewport offset
            expect(result).toEqual([
                { x: 0, y: 0, width: 1236, height: 192 },
            ])
        })

        it('should apply DPR to coordinate regions as well', async () => {
            const region = { x: 10, y: 20, width: 100, height: 150 }

            const result = await determineWebScreenIgnoreRegions(desktopOptions, [region])

            expect(mockExecute).not.toHaveBeenCalled()
            expect(result).toEqual([
                { x: 20, y: 40, width: 200, height: 300 },
            ])
        })

        it('should handle mixed elements and regions with DPR applied to both', async () => {
            const mockElement = { elementId: 'el1', selector: '.ad' } as WebdriverIO.Element
            vi.mocked(mockBrowserInstance.$$).mockResolvedValueOnce([mockElement] as any)
            const region = { x: 500, y: 0, width: 200, height: 90 }
            mockExecute.mockResolvedValueOnce({ x: 10, y: 20, width: 300, height: 80 })

            const result = await determineWebScreenIgnoreRegions(desktopOptions, [mockElement, region])

            expect(result).toEqual([
                { x: 1000, y: 0, width: 400, height: 180 },
                { x: 20, y: 40, width: 600, height: 160 },
            ])
        })

        it('should handle empty array', async () => {
            const result = await determineWebScreenIgnoreRegions(desktopOptions, [])

            expect(result).toEqual([])
            expect(mockExecute).not.toHaveBeenCalled()
        })

        it('should handle chainable promise elements', async () => {
            const chainableElement = Promise.resolve({ elementId: 'el1', selector: '.footer' } as WebdriverIO.Element)
            const freshElement = { elementId: 'el1-fresh', selector: '.footer' } as unknown as WebdriverIO.Element
            vi.mocked(mockBrowserInstance.$$).mockResolvedValueOnce([freshElement] as any)
            mockExecute.mockResolvedValueOnce({ x: 0, y: 900, width: 1200, height: 100 })

            const result = await determineWebScreenIgnoreRegions(desktopOptions, [chainableElement as any])

            expect(result).toEqual([
                { x: 0, y: 1800, width: 2400, height: 200 },
            ])
        })

        it('should use floor/ceil rounding on sub-pixel BCR values to fully cover elements', async () => {
            const mockElement = { elementId: 'el1', selector: '.banner' } as WebdriverIO.Element
            vi.mocked(mockBrowserInstance.$$).mockResolvedValueOnce([mockElement] as any)
            // Sub-pixel BCR values that would lose precision if rounded independently
            mockExecute.mockResolvedValueOnce({ x: 0.33, y: 50.67, width: 412.5, height: 64.33 })

            const opts = { ...desktopOptions, devicePixelRatio: 3 }
            const result = await determineWebScreenIgnoreRegions(opts, [mockElement])

            // Position uses floor, far-edge uses ceil:
            // x: floor(0.33*3) = floor(0.99) = 0
            // y: floor(50.67*3) = floor(152.01) = 152
            // right: ceil((0.33+412.5)*3) = ceil(1238.49) = 1239 → w = 1239-0 = 1239
            // bottom: ceil((50.67+64.33)*3) = ceil(345.0) = 345 → h = 345-152 = 193
            expect(result).toEqual([
                { x: 0, y: 152, width: 1239, height: 193 },
            ])
        })

        it('should throw on invalid ignore items', async () => {
            await expect(
                determineWebScreenIgnoreRegions(desktopOptions, ['invalid' as any])
            ).rejects.toThrow('Invalid elements or regions')
        })

        it('should expand regions by ignoreRegionPadding (default 1) on each side', async () => {
            const region = { x: 10, y: 20, width: 100, height: 50 }
            const optionsWithDefaultPadding = {
                ...desktopOptions,
                ignoreRegionPadding: 1,
            }

            const result = await determineWebScreenIgnoreRegions(optionsWithDefaultPadding, [region])

            expect(mockExecute).not.toHaveBeenCalled()
            // (10,20,100,50) × DPR 2 → (20,40,200,100); + padding 1 each side → (19,39,202,102)
            expect(result).toEqual([
                { x: 19, y: 39, width: 202, height: 102 },
            ])
        })

        it('should use custom ignoreRegionPadding when provided for screen', async () => {
            const region = { x: 0, y: 0, width: 50, height: 20 }
            const optionsWithPadding2 = {
                ...desktopOptions,
                ignoreRegionPadding: 2,
            }

            const result = await determineWebScreenIgnoreRegions(optionsWithPadding2, [region])

            // (0,0,50,20) × 2 → (0,0,100,40); + padding 2 → (0,0,104,44)
            expect(result).toEqual([
                { x: 0, y: 0, width: 104, height: 44 },
            ])
        })
    })

    describe('determineWebFullPageIgnoreRegions', () => {
        const fullPageOptions = {
            browserInstance: null as unknown as WebdriverIO.Browser,
            devicePixelRatio: 2,
            ignoreRegionPadding: 0,
        }

        beforeEach(() => {
            fullPageOptions.browserInstance = mockBrowserInstance
        })

        it('should resolve elements via document BCR (BCR + scroll) and apply DPR', async () => {
            const mockElement = { elementId: 'el1', selector: '.nav' } as WebdriverIO.Element
            const freshElement = { elementId: 'el1-fresh', selector: '.nav' } as unknown as WebdriverIO.Element
            vi.mocked(mockBrowserInstance.$$).mockResolvedValueOnce([freshElement] as any)
            // rawDocumentBcr returns getBoundingClientRect() + (scrollX, scrollY) = document-relative CSS pixels
            mockExecute.mockResolvedValueOnce({ x: 10, y: 1200, width: 200, height: 50 })

            const result = await determineWebFullPageIgnoreRegions(fullPageOptions, [mockElement])

            expect(mockBrowserInstance.$$).toHaveBeenCalledWith('.nav')
            expect(mockExecute).toHaveBeenCalledOnce()
            // Document CSS (10, 1200, 200, 50) × DPR 2 → device pixels (20, 2400, 400, 100)
            expect(result).toEqual([
                { x: 20, y: 2400, width: 400, height: 100 },
            ])
        })

        it('should treat raw regions as document-relative CSS pixels and apply DPR', async () => {
            const region = { x: 0, y: 500, width: 300, height: 80 }

            const result = await determineWebFullPageIgnoreRegions(fullPageOptions, [region])

            expect(mockExecute).not.toHaveBeenCalled()
            expect(result).toEqual([
                { x: 0, y: 1000, width: 600, height: 160 },
            ])
        })

        it('should expand regions by ignoreRegionPadding', async () => {
            const region = { x: 10, y: 20, width: 100, height: 50 }
            const optionsWithPadding = {
                ...fullPageOptions,
                ignoreRegionPadding: 1,
            }

            const result = await determineWebFullPageIgnoreRegions(optionsWithPadding, [region])

            // (10,20,100,50) × 2 → (20,40,200,100); + padding 1 → (19,39,202,102)
            expect(result).toEqual([
                { x: 19, y: 39, width: 202, height: 102 },
            ])
        })

        it('should return empty array when ignores is empty', async () => {
            const result = await determineWebFullPageIgnoreRegions(fullPageOptions, [])

            expect(result).toEqual([])
        })
    })

    describe('determineWebElementIgnoreRegions', () => {
        it('should resolve element-local regions and apply DPR', async () => {
            const rootElement = { elementId: 'root', selector: '.root' } as WebdriverIO.Element
            const childElement = { elementId: 'child', selector: '.child' } as WebdriverIO.Element
            const freshChild = { elementId: 'child-fresh', selector: '.child' } as unknown as WebdriverIO.Element

            vi.mocked(mockBrowserInstance.$$).mockResolvedValueOnce([freshChild] as any)
            // Simulate already-relative BCR from execute: (20,30,100,40)
            mockExecute.mockResolvedValueOnce({ x: 20, y: 30, width: 100, height: 40 })

            const result = await determineWebElementIgnoreRegions({
                browserInstance: mockBrowserInstance as unknown as WebdriverIO.Browser,
                devicePixelRatio: 2,
                rootElement,
                ignoreRegionPadding: 0,
            }, [childElement])

            // CSS: (20,30,100,40) × DPR(2) → (40,60,200,80)
            expect(result).toEqual([
                { x: 40, y: 60, width: 200, height: 80 },
            ])
        })

        it('should pass through literal regions (CSS relative to element) with DPR applied', async () => {
            const rootElement = { elementId: 'root', selector: '.root' } as WebdriverIO.Element
            const region = { x: 5, y: 10, width: 50, height: 20 }

            const result = await determineWebElementIgnoreRegions({
                browserInstance: mockBrowserInstance as unknown as WebdriverIO.Browser,
                devicePixelRatio: 2,
                rootElement,
                ignoreRegionPadding: 0,
            }, [region])

            expect(mockExecute).not.toHaveBeenCalled()
            // (5,10,50,20) × 2 → (10,20,100,40)
            expect(result).toEqual([
                { x: 10, y: 20, width: 100, height: 40 },
            ])
        })

        it('should expand regions by ignoreRegionPadding (default 1) on each side', async () => {
            const rootElement = { elementId: 'root', selector: '.root' } as WebdriverIO.Element
            const region = { x: 10, y: 20, width: 100, height: 40 }

            const result = await determineWebElementIgnoreRegions({
                browserInstance: mockBrowserInstance as unknown as WebdriverIO.Browser,
                devicePixelRatio: 2,
                rootElement,
                ignoreRegionPadding: 1,
            }, [region])

            expect(mockExecute).not.toHaveBeenCalled()
            // (10,20,100,40) × 2 → (20,40,200,80); + padding 1 each side → (19,39,202,82)
            expect(result).toEqual([
                { x: 19, y: 39, width: 202, height: 82 },
            ])
        })

        it('should use custom ignoreRegionPadding when provided', async () => {
            const rootElement = { elementId: 'root', selector: '.root' } as WebdriverIO.Element
            const region = { x: 0, y: 0, width: 50, height: 20 }

            const result = await determineWebElementIgnoreRegions({
                browserInstance: mockBrowserInstance as unknown as WebdriverIO.Browser,
                devicePixelRatio: 1,
                rootElement,
                ignoreRegionPadding: 2,
            }, [region])

            // (0,0,50,20) + padding 2 each side → (0,0,54,24) — x,y clamped to 0
            expect(result).toEqual([
                { x: 0, y: 0, width: 54, height: 24 },
            ])
        })

        it('should handle empty ignores', async () => {
            const rootElement = { elementId: 'root', selector: '.root' } as WebdriverIO.Element

            const result = await determineWebElementIgnoreRegions({
                browserInstance: mockBrowserInstance as unknown as WebdriverIO.Browser,
                devicePixelRatio: 2,
                rootElement,
                ignoreRegionPadding: 0,
            }, [])

            expect(result).toEqual([])
            expect(mockExecute).not.toHaveBeenCalled()
        })

        it('should output CSS-pixel regions when isAndroidNativeWebScreenshot and isWebDriverElementScreenshot (native driver image at CSS size)', async () => {
            const rootElement = { elementId: 'root', selector: '.root' } as WebdriverIO.Element
            const region = { x: 10, y: 20, width: 100, height: 40 }

            const result = await determineWebElementIgnoreRegions({
                browserInstance: mockBrowserInstance as unknown as WebdriverIO.Browser,
                devicePixelRatio: 2,
                rootElement,
                ignoreRegionPadding: 0,
                isAndroidNativeWebScreenshot: true,
                isWebDriverElementScreenshot: true,
            }, [region])

            expect(mockExecute).not.toHaveBeenCalled()
            // Device px: (10,20,100,40) × 2 → (20,40,200,80); then downscale to CSS for native driver image → (10,20,100,40)
            expect(result).toEqual([
                { x: 10, y: 20, width: 100, height: 40 },
            ])
        })
    })

    describe('determineDeviceBlockOuts', () => {
        it('should return empty array when no blockouts are enabled', async () => {
            const options = createDeviceBlockOutsOptions()
            const result = await determineDeviceBlockOuts(options)

            expect(result).toEqual([])
        })

        it('should return statusBar when blockOutStatusBar is enabled', async () => {
            const options = createDeviceBlockOutsOptions({
                screenCompareOptions: {
                    blockOutStatusBar: true,
                    blockOutToolBar: false,
                }
            })
            const result = await determineDeviceBlockOuts(options)

            expect(result).toMatchSnapshot()
        })

        it('should return homeBar when blockOutToolBar is enabled for non-Android device', async () => {
            const options = createDeviceBlockOutsOptions({
                isAndroid: false,
                screenCompareOptions: {
                    blockOutStatusBar: false,
                    blockOutToolBar: true,
                }
            })
            const result = await determineDeviceBlockOuts(options)

            expect(result).toMatchSnapshot()
        })

        it('should return both statusBar and homeBar when both blockouts are enabled for non-Android device', async () => {
            const options = createDeviceBlockOutsOptions({
                isAndroid: false,
                screenCompareOptions: {
                    blockOutStatusBar: true,
                    blockOutToolBar: true,
                }
            })
            const result = await determineDeviceBlockOuts(options)

            expect(result).toMatchSnapshot()
        })

        it('should not return homeBar when blockOutToolBar is enabled for Android device', async () => {
            const options = createDeviceBlockOutsOptions({
                isAndroid: true,
                screenCompareOptions: {
                    blockOutStatusBar: false,
                    blockOutToolBar: true,
                }
            })
            const result = await determineDeviceBlockOuts(options)

            expect(result).toEqual([])
        })

        it('should only return statusBar when both blockouts are enabled for Android device', async () => {
            const options = createDeviceBlockOutsOptions({
                isAndroid: true,
                screenCompareOptions: {
                    blockOutStatusBar: true,
                    blockOutToolBar: true,
                }
            })
            const result = await determineDeviceBlockOuts(options)

            expect(result).toMatchSnapshot()
        })

        it('should handle custom device rectangles', async () => {
            const customDeviceRectangles = createDeviceRectanglesWithData({
                statusBar: { x: 10, y: 20, width: 500, height: 60 },
                homeBar: { x: 10, y: 900, width: 500, height: 40 }
            })
            const options = createDeviceBlockOutsOptions({
                isAndroid: false,
                screenCompareOptions: {
                    blockOutStatusBar: true,
                    blockOutToolBar: true,
                },
                instanceData: {
                    ...createDeviceBlockOutsOptions().instanceData,
                    deviceRectangles: customDeviceRectangles
                }
            })
            const result = await determineDeviceBlockOuts(options)

            expect(result).toMatchSnapshot()
        })
    })

    describe('prepareIgnoreRectangles', () => {
        it('should return empty ignored boxes and false hasIgnoreRectangles when no inputs provided', async () => {
            const options = createPrepareIgnoreRectanglesOptions()

            const result = await prepareIgnoreRectangles(options)

            expect(result).toEqual({
                ignoredBoxes: [],
                hasIgnoreRectangles: false
            })
        })

        it('should handle blockOut and ignoreRegions without mobile web rectangles', async () => {
            const options = createPrepareIgnoreRectanglesOptions({
                blockOut: [{ x: 10, y: 20, width: 100, height: 50 }],
                ignoreRegions: [{ x: 200, y: 300, width: 150, height: 75 }],
                devicePixelRatio: 2,
                isAndroid: false
            })

            const result = await prepareIgnoreRectangles(options)

            expect(result.hasIgnoreRectangles).toBe(true)
            expect(result.ignoredBoxes).toMatchSnapshot()
        })

        it('should handle Android device with different DPR calculation', async () => {
            const options = createPrepareIgnoreRectanglesOptions({
                blockOut: [{ x: 10, y: 20, width: 100, height: 50 }],
                ignoreRegions: [{ x: 200, y: 300, width: 150, height: 75 }],
                devicePixelRatio: 3,
                isAndroid: true
            })

            const result = await prepareIgnoreRectangles(options)

            expect(result.hasIgnoreRectangles).toBe(true)
            expect(result.ignoredBoxes).toMatchSnapshot()
        })

        it('should skip mobile web rectangles when not mobile', async () => {
            const options = createPrepareIgnoreRectanglesOptions({
                isMobile: false,
                isNativeContext: false,
                imageCompareOptions: {
                    blockOutSideBar: true,
                    blockOutStatusBar: true,
                    blockOutToolBar: true,
                }
            })

            const result = await prepareIgnoreRectangles(options)

            expect(result).toEqual({
                ignoredBoxes: [],
                hasIgnoreRectangles: false
            })
        })

        it('should skip mobile web rectangles when in native context', async () => {
            const options = createPrepareIgnoreRectanglesOptions({
                isMobile: true,
                isNativeContext: true,
                imageCompareOptions: {
                    blockOutSideBar: true,
                    blockOutStatusBar: true,
                    blockOutToolBar: true,
                }
            })

            const result = await prepareIgnoreRectangles(options)

            expect(result).toEqual({
                ignoredBoxes: [],
                hasIgnoreRectangles: false
            })
        })

        it('should include mobile web rectangles when mobile and not native context', async () => {
            const options = createPrepareIgnoreRectanglesOptions({
                isMobile: true,
                isNativeContext: false,
                isAndroid: false,
                isAndroidNativeWebScreenshot: true,
                isViewPortScreenshot: true,
                devicePixelRatio: 2,
                imageCompareOptions: {
                    blockOutSideBar: true,
                    blockOutStatusBar: true,
                    blockOutToolBar: true,
                }
            })

            const result = await prepareIgnoreRectangles(options)

            expect(result.hasIgnoreRectangles).toBe(true)
            expect(result.ignoredBoxes).toMatchSnapshot()
        })

        it('should filter out zero-sized rectangles from mobile web context', async () => {
            const deviceRectanglesWithZeros = createDeviceRectanglesWithData({
                statusBarAndAddressBar: { x: 0, y: 0, width: 0, height: 0 }, // Will be filtered
                bottomBar: { x: 0, y: 0, width: 390, height: 47 }, // Will be kept
            })

            const options = createPrepareIgnoreRectanglesOptions({
                deviceRectangles: deviceRectanglesWithZeros,
                isMobile: true,
                isNativeContext: false,
                isAndroid: false,
                isAndroidNativeWebScreenshot: true,
                isViewPortScreenshot: true,
                devicePixelRatio: 2,
                imageCompareOptions: {
                    blockOutStatusBar: true,
                    blockOutToolBar: true,
                }
            })

            const result = await prepareIgnoreRectangles(options)

            expect(result.hasIgnoreRectangles).toBe(true)
            expect(result.ignoredBoxes).toMatchSnapshot()
        })

        it('should handle empty web rectangles without filtering', async () => {
            const options = createPrepareIgnoreRectanglesOptions({
                isMobile: true,
                isNativeContext: false,
                isAndroid: true,
                isAndroidNativeWebScreenshot: false,
                isViewPortScreenshot: true,
                imageCompareOptions: {
                    blockOutStatusBar: false,
                    blockOutToolBar: false,
                    blockOutSideBar: false,
                }
            })

            const result = await prepareIgnoreRectangles(options)

            expect(result).toEqual({
                ignoredBoxes: [],
                hasIgnoreRectangles: false
            })
        })

        it('should combine all rectangle sources correctly', async () => {
            const options = createPrepareIgnoreRectanglesOptions({
                blockOut: [{ x: 10, y: 20, width: 100, height: 50 }],
                ignoreRegions: [{ x: 200, y: 300, width: 150, height: 75 }],
                isMobile: true,
                isNativeContext: false,
                isAndroid: false,
                isAndroidNativeWebScreenshot: true,
                isViewPortScreenshot: true,
                devicePixelRatio: 2,
                imageCompareOptions: {
                    blockOutStatusBar: true,
                }
            })

            const result = await prepareIgnoreRectangles(options)

            expect(result.hasIgnoreRectangles).toBe(true)
            expect(result.ignoredBoxes).toMatchSnapshot()
        })
    })
})
