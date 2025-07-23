import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'
import {
    determineElementRectangles,
    determineScreenRectangles,
    determineStatusAddressToolBarRectangles,
    determineIgnoreRegions,
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
            getElementRect: mockGetElementRect
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
        it('should return empty ignored boxes and false hasIgnoreRectangles when no inputs provided', () => {
            const options = createPrepareIgnoreRectanglesOptions()

            const result = prepareIgnoreRectangles(options)

            expect(result).toEqual({
                ignoredBoxes: [],
                hasIgnoreRectangles: false
            })
        })

        it('should handle blockOut and ignoreRegions without mobile web rectangles', () => {
            const options = createPrepareIgnoreRectanglesOptions({
                blockOut: [{ x: 10, y: 20, width: 100, height: 50 }],
                ignoreRegions: [{ x: 200, y: 300, width: 150, height: 75 }],
                devicePixelRatio: 2,
                isAndroid: false
            })

            const result = prepareIgnoreRectangles(options)

            expect(result.hasIgnoreRectangles).toBe(true)
            expect(result.ignoredBoxes).toMatchSnapshot()
        })

        it('should handle Android device with different DPR calculation', () => {
            const options = createPrepareIgnoreRectanglesOptions({
                blockOut: [{ x: 10, y: 20, width: 100, height: 50 }],
                ignoreRegions: [{ x: 200, y: 300, width: 150, height: 75 }],
                devicePixelRatio: 3,
                isAndroid: true
            })

            const result = prepareIgnoreRectangles(options)

            expect(result.hasIgnoreRectangles).toBe(true)
            expect(result.ignoredBoxes).toMatchSnapshot()
        })

        it('should skip mobile web rectangles when not mobile', () => {
            const options = createPrepareIgnoreRectanglesOptions({
                isMobile: false,
                isNativeContext: false,
                imageCompareOptions: {
                    blockOutSideBar: true,
                    blockOutStatusBar: true,
                    blockOutToolBar: true,
                }
            })

            const result = prepareIgnoreRectangles(options)

            expect(result).toEqual({
                ignoredBoxes: [],
                hasIgnoreRectangles: false
            })
        })

        it('should skip mobile web rectangles when in native context', () => {
            const options = createPrepareIgnoreRectanglesOptions({
                isMobile: true,
                isNativeContext: true,
                imageCompareOptions: {
                    blockOutSideBar: true,
                    blockOutStatusBar: true,
                    blockOutToolBar: true,
                }
            })

            const result = prepareIgnoreRectangles(options)

            expect(result).toEqual({
                ignoredBoxes: [],
                hasIgnoreRectangles: false
            })
        })

        it('should include mobile web rectangles when mobile and not native context', () => {
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

            const result = prepareIgnoreRectangles(options)

            expect(result.hasIgnoreRectangles).toBe(true)
            expect(result.ignoredBoxes).toMatchSnapshot()
        })

        it('should filter out zero-sized rectangles from mobile web context', () => {
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

            const result = prepareIgnoreRectangles(options)

            expect(result.hasIgnoreRectangles).toBe(true)
            expect(result.ignoredBoxes).toMatchSnapshot()
        })

        it('should handle empty web rectangles without filtering', () => {
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

            const result = prepareIgnoreRectangles(options)

            expect(result).toEqual({
                ignoredBoxes: [],
                hasIgnoreRectangles: false
            })
        })

        it('should combine all rectangle sources correctly', () => {
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

            const result = prepareIgnoreRectangles(options)

            expect(result.hasIgnoreRectangles).toBe(true)
            expect(result.ignoredBoxes).toMatchSnapshot()
        })
    })
})
