import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { join } from 'node:path'
import logger from '@wdio/logger'
import {
    getDesktopFullPageScreenshotsData,
    getAndroidChromeDriverFullPageScreenshotsData,
    logHiddenRemovedError,
    takeBase64BiDiScreenshot,
    takeWebElementScreenshot,
    getMobileFullPageNativeWebScreenshotsData
} from './screenshots.js'
import type { TakeWebElementScreenshot, FullPageScreenshotOptions, FullPageScreenshotNativeMobileOptions } from './screenshots.interfaces.js'
import type { RectanglesOutput } from './rectangles.interfaces.js'
import { IMAGE_STRING, MEDIUM_IMAGE_STRING, SMALL_IMAGE_STRING } from '../mocks/image.js'
import { DEVICE_RECTANGLES } from '../helpers/constants.js'
import * as rectanglesModule from './rectangles.js'
import * as utilsModule from '../helpers/utils.js'

const log = logger('test')
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))
vi.mock('./rectangles.js', () => ({
    determineElementRectangles: vi.fn()
}))
vi.mock('../helpers/utils.js', async () => {
    const actual = await vi.importActual('../helpers/utils.js')
    return {
        ...actual,
        getBase64ScreenshotSize: vi.fn(),
        waitFor: vi.fn(),
        calculateDprData: vi.fn()
    }
})
vi.mock('../clientSideScripts/scrollToPosition.js', () => ({
    default: vi.fn()
}))
vi.mock('../clientSideScripts/getDocumentScrollHeight.js', () => ({
    default: vi.fn()
}))
vi.mock('../clientSideScripts/hideRemoveElements.js', () => ({
    default: vi.fn()
}))

describe('screenshots', () => {
    const createMockBrowserInstance = (
        { takeScreenshot = IMAGE_STRING, takeElementScreenshot = IMAGE_STRING }:
            { takeScreenshot?: string, takeElementScreenshot?: string } = {}
    ) => {
        return {
            takeScreenshot: vi.fn().mockResolvedValue(takeScreenshot),
            takeElementScreenshot: vi.fn().mockResolvedValue(takeElementScreenshot),
            getWindowHandle: vi.fn().mockResolvedValue('window-handle-123'),
            browsingContextCaptureScreenshot: vi.fn().mockResolvedValue({ data: takeScreenshot }),
            execute: vi.fn().mockResolvedValue(1000) // Default mock for getDocumentScrollHeight
        } as unknown as WebdriverIO.Browser
    }
    const createMockElement = () => {
        return {
            elementId: 'element-123'
        } as unknown as WebdriverIO.Element
    }

    let logWarnSpy: ReturnType<typeof vi.spyOn>

    describe('getMobileFullPageNativeWebScreenshotsData', () => {
        const createMobileOptions = (overrides: Partial<FullPageScreenshotNativeMobileOptions> = {}): FullPageScreenshotNativeMobileOptions => ({
            addressBarShadowPadding: 10,
            devicePixelRatio: 2,
            deviceRectangles: {
                viewport: { x: 0, y: 100, width: 750, height: 1334 },
                bottomBar: { x: 0, y: 1434, width: 750, height: 100 },
                homeBar: { x: 0, y: 1534, width: 750, height: 34 },
                leftSidePadding: { x: 0, y: 0, width: 0, height: 0 },
                rightSidePadding: { x: 0, y: 0, width: 0, height: 0 },
                statusBarAndAddressBar: { x: 0, y: 0, width: 750, height: 100 },
                statusBar: { x: 0, y: 0, width: 750, height: 50 },
                screenSize: { width: 750, height: 1668 }
            },
            fullPageScrollTimeout: 1000,
            hideAfterFirstScroll: [],
            isAndroid: false,
            isLandscape: false,
            innerHeight: 667,
            toolBarShadowPadding: 5,
            screenWidth: 375,
            ...overrides
        })

        beforeEach(() => {
            logWarnSpy = vi.spyOn(log, 'warn')

            vi.mocked(utilsModule.waitFor).mockResolvedValue(undefined)
            vi.mocked(utilsModule.calculateDprData).mockImplementation((data) => data)
        })

        afterEach(() => {
            vi.clearAllMocks()
            logWarnSpy.mockRestore()
        })

        it('should take single screenshot when content fits in viewport (iOS)', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition
                .mockResolvedValueOnce(undefined) // hideScrollBars
                .mockResolvedValueOnce(652) // getDocumentScrollHeight (effective viewport height)
                .mockResolvedValueOnce(undefined) // hideScrollBars

            const options = createMobileOptions() // iOS device by default
            const result = await getMobileFullPageNativeWebScreenshotsData(mockBrowserInstance, options)

            expect(result).toMatchSnapshot()
            expect(mockBrowserInstance.takeScreenshot).toHaveBeenCalledTimes(1)
            expect(result.data).toHaveLength(1)
        })

        it('should take multiple screenshots when content exceeds viewport (Android)', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition 0 (i=0)
                .mockResolvedValueOnce(undefined) // hideScrollBars true
                .mockResolvedValueOnce(1304) // getDocumentScrollHeight (2x effectiveViewportHeight)
                .mockResolvedValueOnce(undefined) // hideScrollBars false
                .mockResolvedValueOnce(undefined) // scrollToPosition 652 (i=1)
                .mockResolvedValueOnce(undefined) // hideScrollBars true
                .mockResolvedValueOnce(1304) // getDocumentScrollHeight
                .mockResolvedValueOnce(undefined) // hideScrollBars false

            const options = createMobileOptions({ isAndroid: true })
            const result = await getMobileFullPageNativeWebScreenshotsData(mockBrowserInstance, options)

            expect(result).toMatchSnapshot()
            expect(mockBrowserInstance.takeScreenshot).toHaveBeenCalledTimes(2)
            expect(result.data).toHaveLength(2)
        })

        it('should handle landscape mode with rotation detection', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition
                .mockResolvedValueOnce(undefined) // hideScrollBars
                .mockResolvedValueOnce(652) // getDocumentScrollHeight
                .mockResolvedValueOnce(undefined) // hideScrollBars

            const options = createMobileOptions({
                isLandscape: true,
                deviceRectangles: {
                    viewport: { x: 0, y: 100, width: 1334, height: 750 },
                    bottomBar: { x: 0, y: 850, width: 1334, height: 100 },
                    homeBar: { x: 0, y: 950, width: 1334, height: 34 },
                    leftSidePadding: { x: 0, y: 0, width: 0, height: 0 },
                    rightSidePadding: { x: 0, y: 0, width: 0, height: 0 },
                    statusBarAndAddressBar: { x: 0, y: 0, width: 1334, height: 100 },
                    statusBar: { x: 0, y: 0, width: 1334, height: 50 },
                    screenSize: { width: 1334, height: 984 }
                }
            })
            const result = await getMobileFullPageNativeWebScreenshotsData(mockBrowserInstance, options)

            expect(result).toMatchSnapshot()
            expect(result.data).toHaveLength(1)
        })

        it('should hide elements after first scroll when hideAfterFirstScroll is provided', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition 0 (i=0)
                .mockResolvedValueOnce(undefined) // hideScrollBars true
                .mockResolvedValueOnce(2638) // getDocumentScrollHeight (2x effectiveViewportHeight to trigger scroll)
                .mockResolvedValueOnce(undefined) // hideScrollBars false
                .mockResolvedValueOnce(undefined) // scrollToPosition 1319 (i=1)
                .mockResolvedValueOnce(undefined) // hideScrollBars true
                .mockResolvedValueOnce(undefined) // hideRemoveElements (i=1, hide elements)
                .mockResolvedValueOnce(2638) // getDocumentScrollHeight
                .mockResolvedValueOnce(undefined) // hideScrollBars false
                .mockResolvedValueOnce(undefined) // hideRemoveElements (restore at end)

            const mockElements = [{ tagName: 'div' } as HTMLElement]
            const options = createMobileOptions({ hideAfterFirstScroll: [mockElements] })
            const result = await getMobileFullPageNativeWebScreenshotsData(mockBrowserInstance, options)

            expect(result).toMatchSnapshot()

            const executeCalls = vi.mocked(mockBrowserInstance.execute).mock.calls
            const hideElementsCalls = executeCalls.filter(call =>
                call.length === 3 &&
                typeof call[1] === 'object' &&
                call[1] &&
                typeof call[1] === 'object' &&
                'hide' in call[1] &&
                Array.isArray((call[1] as any).hide) &&
                'remove' in call[1] &&
                Array.isArray((call[1] as any).remove)
            )

            expect(hideElementsCalls).toHaveLength(2)
            expect(hideElementsCalls[0][2]).toBe(true)
            expect(hideElementsCalls[1][2]).toBe(false)
        })

        it('should handle error when hiding elements fails', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            const executeError = new Error('Element not found')
            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition 0 (i=0)
                .mockResolvedValueOnce(undefined) // hideScrollBars true
                .mockResolvedValueOnce(2638) // getDocumentScrollHeight (2x effectiveViewportHeight)
                .mockResolvedValueOnce(undefined) // hideScrollBars false
                .mockResolvedValueOnce(undefined) // scrollToPosition 1319 (i=1)
                .mockResolvedValueOnce(undefined) // hideScrollBars true
                .mockRejectedValueOnce(executeError) // hideRemoveElements fails
                .mockResolvedValueOnce(2638) // getDocumentScrollHeight
                .mockResolvedValueOnce(undefined) // hideScrollBars false
                .mockRejectedValueOnce(executeError) // hideRemoveElements restore fails

            const mockElements = [{ tagName: 'div' } as HTMLElement]
            const options = createMobileOptions({ hideAfterFirstScroll: [mockElements] })
            const result = await getMobileFullPageNativeWebScreenshotsData(mockBrowserInstance, options)

            expect(result).toBeDefined()
            expect(result.data).toHaveLength(2)
            expect(logWarnSpy).toHaveBeenCalledTimes(2)
        })

        it('should throw error when negative scrollY is detected', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })
            const options = createMobileOptions({
                deviceRectangles: {
                    viewport: { x: 0, y: 100, width: 750, height: 50 },
                    bottomBar: { x: 0, y: 200, width: 750, height: 0 },
                    homeBar: { x: 0, y: 300, width: 750, height: 100 },
                    leftSidePadding: { x: 0, y: 0, width: 0, height: 0 },
                    rightSidePadding: { x: 0, y: 0, width: 0, height: 0 },
                    statusBarAndAddressBar: { x: 0, y: 0, width: 750, height: 100 },
                    statusBar: { x: 0, y: 0, width: 750, height: 50 },
                    screenSize: { width: 750, height: 500 }
                },
                addressBarShadowPadding: 20,
                toolBarShadowPadding: 20,
                isAndroid: false
            })

            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition 0 (i=0, scrollY=0)
                .mockResolvedValueOnce(undefined) // hideScrollBars true
                .mockResolvedValueOnce(1000) // getDocumentScrollHeight
                .mockResolvedValueOnce(undefined) // hideScrollBars false
                // When trying to do i=1, scrollY would be negative, so it should error before the next execute calls
                .mockResolvedValueOnce(0) // pageYOffset for error logging

            await expect(getMobileFullPageNativeWebScreenshotsData(mockBrowserInstance, options))
                .rejects.toThrow(/Negative scroll position detected/)
        })

        it('should throw error when scroll height cannot be determined', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition
                .mockResolvedValueOnce(undefined) // hideScrollBars
                .mockResolvedValueOnce(undefined) // getDocumentScrollHeight returns undefined
                .mockResolvedValueOnce(undefined) // hideScrollBars

            const options = createMobileOptions()

            await expect(getMobileFullPageNativeWebScreenshotsData(mockBrowserInstance, options))
                .rejects.toThrow('Couldn\'t determine scroll height or screenshot size')
        })
    })

    describe('getAndroidChromeDriverFullPageScreenshotsData', () => {
        const createBaseOptions = (overrides: Partial<FullPageScreenshotOptions> = {}): FullPageScreenshotOptions => ({
            devicePixelRatio: 1,
            fullPageScrollTimeout: 1000,
            innerHeight: 768,
            hideAfterFirstScroll: [],
            ...overrides
        })

        beforeEach(() => {
            logWarnSpy = vi.spyOn(log, 'warn')

            vi.mocked(utilsModule.waitFor).mockResolvedValue(undefined)
            vi.mocked(utilsModule.calculateDprData).mockImplementation((data) => data)
        })

        afterEach(() => {
            vi.clearAllMocks()
            logWarnSpy.mockRestore()
        })

        it('should take single screenshot when content fits in viewport', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue({
                width: 1366,
                height: 768
            })

            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition
                .mockResolvedValueOnce(undefined) // hideScrollBars
                .mockResolvedValueOnce(768) // getDocumentScrollHeight
                .mockResolvedValueOnce(undefined) // hideScrollBars

            const options = createBaseOptions()
            const result = await getAndroidChromeDriverFullPageScreenshotsData(mockBrowserInstance, options)

            expect(result).toMatchSnapshot()
            expect(mockBrowserInstance.takeScreenshot).toHaveBeenCalledTimes(1)
            expect(result.data).toHaveLength(1)
        })

        it('should take multiple screenshots when content exceeds viewport', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue({
                width: 1366,
                height: 768
            })

            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition 0
                .mockResolvedValueOnce(undefined) // hideScrollBars
                .mockResolvedValueOnce(1536) // getDocumentScrollHeight (2x viewport)
                .mockResolvedValueOnce(undefined) // hideScrollBars
                .mockResolvedValueOnce(undefined) // scrollToPosition 768
                .mockResolvedValueOnce(undefined) // hideScrollBars
                .mockResolvedValueOnce(1536) // getDocumentScrollHeight
                .mockResolvedValueOnce(undefined) // hideScrollBars

            const options = createBaseOptions()
            const result = await getAndroidChromeDriverFullPageScreenshotsData(mockBrowserInstance, options)

            expect(result).toMatchSnapshot()
            expect(mockBrowserInstance.takeScreenshot).toHaveBeenCalledTimes(2)
            expect(result.data).toHaveLength(2)
        })

        it('should hide elements after first scroll when hideAfterFirstScroll is provided', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue({
                width: 1366,
                height: 768
            })

            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition 0
                .mockResolvedValueOnce(undefined) // hideScrollBars
                .mockResolvedValueOnce(1536) // getDocumentScrollHeight
                .mockResolvedValueOnce(undefined) // hideScrollBars
                .mockResolvedValueOnce(undefined) // scrollToPosition 768
                .mockResolvedValueOnce(undefined) // hideScrollBars
                .mockResolvedValueOnce(undefined) // hideRemoveElements
                .mockResolvedValueOnce(1536) // getDocumentScrollHeight
                .mockResolvedValueOnce(undefined) // hideScrollBars
                .mockResolvedValueOnce(undefined) // hideRemoveElements (restore)

            const mockElements = [{ tagName: 'div' } as HTMLElement]
            const options = createBaseOptions({ hideAfterFirstScroll: [mockElements] })
            const result = await getAndroidChromeDriverFullPageScreenshotsData(mockBrowserInstance, options)

            expect(result).toMatchSnapshot()
            expect(mockBrowserInstance.execute).toHaveBeenCalledWith(
                expect.any(Function), // hideRemoveElements
                { hide: [mockElements], remove: [] },
                true
            )
            expect(mockBrowserInstance.execute).toHaveBeenCalledWith(
                expect.any(Function), // hideRemoveElements
                { hide: [mockElements], remove: [] },
                false
            )
        })

        it('should handle error when hiding elements fails', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue({
                width: 1366,
                height: 768
            })

            const executeError = new Error('Element not found')
            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition 0
                .mockResolvedValueOnce(undefined) // hideScrollBars
                .mockResolvedValueOnce(1536) // getDocumentScrollHeight
                .mockResolvedValueOnce(undefined) // hideScrollBars
                .mockResolvedValueOnce(undefined) // scrollToPosition 768
                .mockResolvedValueOnce(undefined) // hideScrollBars
                .mockRejectedValueOnce(executeError) // hideRemoveElements fails
                .mockResolvedValueOnce(1536) // getDocumentScrollHeight
                .mockResolvedValueOnce(undefined) // hideScrollBars
                .mockRejectedValueOnce(executeError) // hideRemoveElements restore fails

            const mockElements = [{ tagName: 'div' } as HTMLElement]
            const options = createBaseOptions({ hideAfterFirstScroll: [mockElements] })

            const result = await getAndroidChromeDriverFullPageScreenshotsData(mockBrowserInstance, options)

            expect(result).toBeDefined()
            expect(result.data).toHaveLength(2)
            expect(logWarnSpy).toHaveBeenCalledTimes(2)
        })

        it('should throw error when scroll height cannot be determined', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue({
                width: 1366,
                height: 768
            })

            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition
                .mockResolvedValueOnce(undefined) // hideScrollBars
                .mockResolvedValueOnce(undefined) // getDocumentScrollHeight returns undefined
                .mockResolvedValueOnce(undefined) // hideScrollBars

            const options = createBaseOptions()

            await expect(getAndroidChromeDriverFullPageScreenshotsData(mockBrowserInstance, options))
                .rejects.toThrow('Couldn\'t determine scroll height or screenshot size')
        })
    })

    describe('getDesktopFullPageScreenshotsData', () => {
        const createBaseOptions = (overrides: Partial<FullPageScreenshotOptions> = {}): FullPageScreenshotOptions => ({
            devicePixelRatio: 1,
            fullPageScrollTimeout: 1000,
            innerHeight: 768,
            hideAfterFirstScroll: [],
            ...overrides
        })

        beforeEach(() => {
            logWarnSpy = vi.spyOn(log, 'warn')

            vi.mocked(utilsModule.waitFor).mockResolvedValue(undefined)
            vi.mocked(utilsModule.calculateDprData).mockImplementation((data) => data)
        })

        afterEach(() => {
            vi.clearAllMocks()
            logWarnSpy.mockRestore()
        })

        it('should take single screenshot when content fits in viewport', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue({
                width: 1366,
                height: 768
            })

            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition
                .mockResolvedValueOnce(768) // getDocumentScrollHeight

            const options = createBaseOptions()
            const result = await getDesktopFullPageScreenshotsData(mockBrowserInstance, options)

            expect(result).toMatchSnapshot()
            expect(mockBrowserInstance.takeScreenshot).toHaveBeenCalledTimes(1)
            expect(mockBrowserInstance.execute).toHaveBeenCalledTimes(2) // scroll + getScrollHeight
            expect(result.data).toHaveLength(1)
        })

        it('should take multiple screenshots when content exceeds viewport', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue({
                width: 1366,
                height: 768
            })

            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition 0
                .mockResolvedValueOnce(1536) // getDocumentScrollHeight (2x viewport)
                .mockResolvedValueOnce(undefined) // scrollToPosition 768
                .mockResolvedValueOnce(1536) // getDocumentScrollHeight

            const options = createBaseOptions()
            const result = await getDesktopFullPageScreenshotsData(mockBrowserInstance, options)

            expect(result).toMatchSnapshot()
            expect(mockBrowserInstance.takeScreenshot).toHaveBeenCalledTimes(2)
            expect(result.data).toHaveLength(2)
        })

        it('should handle screenshot size adjustment when different from inner height', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue({
                width: 1366,
                height: 768.4
            })

            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition
                .mockResolvedValueOnce(768) // getDocumentScrollHeight

            const options = createBaseOptions({ innerHeight: 768 })
            const result = await getDesktopFullPageScreenshotsData(mockBrowserInstance, options)

            expect(result).toMatchSnapshot()
            expect(result.data).toHaveLength(1)
        })

        it('should hide elements after first scroll when hideAfterFirstScroll is provided', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue({
                width: 1366,
                height: 768
            })

            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition 0
                .mockResolvedValueOnce(1536) // getDocumentScrollHeight
                .mockResolvedValueOnce(undefined) // hideRemoveElements
                .mockResolvedValueOnce(undefined) // scrollToPosition 768
                .mockResolvedValueOnce(1536) // getDocumentScrollHeight
                .mockResolvedValueOnce(undefined) // hideRemoveElements (restore)

            const mockElements = [{ tagName: 'div' } as HTMLElement]
            const options = createBaseOptions({ hideAfterFirstScroll: [mockElements] })
            const result = await getDesktopFullPageScreenshotsData(mockBrowserInstance, options)

            expect(result).toMatchSnapshot()
            expect(mockBrowserInstance.execute).toHaveBeenCalledWith(
                expect.any(Function), // hideRemoveElements
                { hide: [mockElements], remove: [] },
                true
            )
            expect(mockBrowserInstance.execute).toHaveBeenCalledWith(
                expect.any(Function), // hideRemoveElements
                { hide: [mockElements], remove: [] },
                false
            )
        })

        it('should handle error when hiding elements fails', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue({
                width: 1366,
                height: 768
            })

            const executeError = new Error('Element not found')
            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition 0 (i=0)
                .mockResolvedValueOnce(1536) // getDocumentScrollHeight (i=0) - triggers another iteration
                .mockResolvedValueOnce(undefined) // scrollToPosition 768 (i=1)
                .mockRejectedValueOnce(executeError) // hideRemoveElements fails (i=1)
                .mockResolvedValueOnce(1536) // getDocumentScrollHeight (i=1)
                .mockRejectedValueOnce(executeError) // hideRemoveElements restore fails

            const mockElements = [{ tagName: 'div' } as HTMLElement]
            const options = createBaseOptions({ hideAfterFirstScroll: [mockElements] })

            const result = await getDesktopFullPageScreenshotsData(mockBrowserInstance, options)

            expect(result).toBeDefined()
            expect(result.data).toHaveLength(2)
            expect(logWarnSpy).toHaveBeenCalledTimes(2)
        })

        it('should throw error when scroll height cannot be determined', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue({
                width: 1366,
                height: 768
            })

            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition
                .mockResolvedValueOnce(undefined) // getDocumentScrollHeight returns undefined

            const options = createBaseOptions()

            await expect(getDesktopFullPageScreenshotsData(mockBrowserInstance, options))
                .rejects.toThrow('Couldn\'t determine scroll height or screenshot size')
        })
    })

    describe('takeBase64BiDiScreenshot', () => {
        it('should take a BiDi screenshot with no arguments (uses defaults)', async () => {
            const mockBrowserInstance = createMockBrowserInstance()
            const result = await takeBase64BiDiScreenshot({ browserInstance: mockBrowserInstance })

            expect(result).toBe(IMAGE_STRING)
        })

        it('should take a BiDi screenshot with default viewport origin', async () => {
            const mockBrowserInstance = createMockBrowserInstance()
            const result = await takeBase64BiDiScreenshot({ browserInstance: mockBrowserInstance })

            expect(result).toBe(IMAGE_STRING)
        })

        it('should take a BiDi screenshot with document origin', async () => {
            const mockBrowserInstance = createMockBrowserInstance()
            const result = await takeBase64BiDiScreenshot({
                browserInstance: mockBrowserInstance,
                origin: 'document'
            })

            expect(result).toBe(IMAGE_STRING)
        })

        it('should take a BiDi screenshot with clip rectangle', async () => {
            const mockBrowserInstance = createMockBrowserInstance()
            const clipRectangle: RectanglesOutput = {
                x: 10,
                y: 20,
                width: 300,
                height: 400,
            }
            const result = await takeBase64BiDiScreenshot({
                browserInstance: mockBrowserInstance,
                clip: clipRectangle
            })

            expect(result).toBe(IMAGE_STRING)
        })
    })

    describe('logHiddenRemovedError', () => {
        beforeEach(() => {
            logWarnSpy = vi.spyOn(log, 'warn')
        })

        afterEach(() => {
            vi.clearAllMocks()
            logWarnSpy.mockRestore()
        })

        it('should log a warning when the elements are not found', () => {
            logHiddenRemovedError(new Error('Element not found'))
            expect(logWarnSpy.mock.calls).toMatchSnapshot()
        })
    })

    describe('takeWebElementScreenshot', () => {
        const createBaseTakeWebElementScreenshotOptions = (overrides: Partial<TakeWebElementScreenshot> = {}): TakeWebElementScreenshot => ({
            browserInstance: createMockBrowserInstance(),
            devicePixelRatio: 1,
            deviceRectangles: DEVICE_RECTANGLES,
            element: Promise.resolve(createMockElement()),
            fallback: false,
            initialDevicePixelRatio: 1,
            isEmulated: false,
            innerHeight: 768,
            isAndroidNativeWebScreenshot: false,
            isAndroid: false,
            isIOS: false,
            isLandscape: false,
            ...overrides
        })

        beforeEach(() => {
            logWarnSpy = vi.spyOn(log, 'warn')
        })

        afterEach(() => {
            vi.clearAllMocks()
            logWarnSpy.mockRestore()
        })

        describe('normal mode (fallback = false)', () => {
            it('should successfully take element screenshot using webdriver element screenshot', async () => {
                const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: MEDIUM_IMAGE_STRING, takeElementScreenshot: SMALL_IMAGE_STRING })
                const mockElement = createMockElement()

                vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue({
                    width: 300,
                    height: 200
                })

                const options = createBaseTakeWebElementScreenshotOptions({
                    browserInstance: mockBrowserInstance,
                    element: Promise.resolve(mockElement)
                })

                const result = await takeWebElementScreenshot(options)

                expect(result).toMatchSnapshot()
                expect(mockBrowserInstance.takeElementScreenshot).toHaveBeenCalled()
                expect(mockBrowserInstance.takeScreenshot).not.toHaveBeenCalled()
            })

            it('should throw error when element has zero width', async () => {
                const mockBrowserInstance = createMockBrowserInstance({ takeElementScreenshot: SMALL_IMAGE_STRING })
                const mockElement = createMockElement()

                vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue({
                    width: 0,
                    height: 200
                })

                const options = createBaseTakeWebElementScreenshotOptions({
                    browserInstance: mockBrowserInstance,
                    element: Promise.resolve(mockElement)
                })

                vi.mocked(rectanglesModule.determineElementRectangles).mockResolvedValue({
                    x: 10,
                    y: 20,
                    width: 300,
                    height: 200
                })

                const result = await takeWebElementScreenshot(options)

                expect(logWarnSpy.mock.calls).toMatchSnapshot()
                expect(result.isWebDriverElementScreenshot).toBe(false)
                expect(mockBrowserInstance.takeElementScreenshot).toHaveBeenCalled()
                expect(mockBrowserInstance.takeScreenshot).toHaveBeenCalled()
            })

            it('should throw error when element has zero height', async () => {
                const mockBrowserInstance = createMockBrowserInstance({ takeElementScreenshot: SMALL_IMAGE_STRING })
                const mockElement = createMockElement()

                vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue({
                    width: 300,
                    height: 0
                })

                const options = createBaseTakeWebElementScreenshotOptions({
                    browserInstance: mockBrowserInstance,
                    element: Promise.resolve(mockElement)
                })

                vi.mocked(rectanglesModule.determineElementRectangles).mockResolvedValue({
                    x: 10,
                    y: 20,
                    width: 300,
                    height: 200
                })

                const result = await takeWebElementScreenshot(options)

                expect(logWarnSpy.mock.calls).toMatchSnapshot()
                expect(result.isWebDriverElementScreenshot).toBe(false)
                expect(mockBrowserInstance.takeElementScreenshot).toHaveBeenCalled()
                expect(mockBrowserInstance.takeScreenshot).toHaveBeenCalled()
            })

            it('should fallback when takeElementScreenshot throws an error', async () => {
                const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: MEDIUM_IMAGE_STRING })
                const mockElement = createMockElement()

                mockBrowserInstance.takeElementScreenshot = vi.fn().mockRejectedValue(new Error('Element screenshot failed'))

                vi.mocked(rectanglesModule.determineElementRectangles).mockResolvedValue({
                    x: 10,
                    y: 20,
                    width: 300,
                    height: 200
                })

                const options = createBaseTakeWebElementScreenshotOptions({
                    browserInstance: mockBrowserInstance,
                    element: Promise.resolve(mockElement)
                })

                const result = await takeWebElementScreenshot(options)

                expect(logWarnSpy.mock.calls).toMatchSnapshot()
                expect(result).toMatchSnapshot()
                expect(mockBrowserInstance.takeElementScreenshot).toHaveBeenCalledWith('element-123')
                expect(mockBrowserInstance.takeScreenshot).toHaveBeenCalled()
                expect(result.isWebDriverElementScreenshot).toBe(false)
                expect(rectanglesModule.determineElementRectangles).toHaveBeenCalled()
            })
        })

        describe('fallback mode (fallback = true)', () => {
            it('should take full screenshot and determine element rectangles', async () => {
                const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: MEDIUM_IMAGE_STRING })
                const mockElement = createMockElement()

                const mockRectangles = { x: 50, y: 100, width: 250, height: 150 }
                vi.mocked(rectanglesModule.determineElementRectangles).mockResolvedValue(mockRectangles)

                const options = createBaseTakeWebElementScreenshotOptions({
                    browserInstance: mockBrowserInstance,
                    element: Promise.resolve(mockElement),
                    fallback: true
                })

                const result = await takeWebElementScreenshot(options)

                expect(result).toMatchSnapshot()
                expect(mockBrowserInstance.takeScreenshot).toHaveBeenCalled()
                expect(mockBrowserInstance.takeElementScreenshot).not.toHaveBeenCalled()
                expect(rectanglesModule.determineElementRectangles).toHaveBeenCalledWith({
                    browserInstance: mockBrowserInstance,
                    base64Image: MEDIUM_IMAGE_STRING,
                    element: Promise.resolve(mockElement),
                    options: {
                        devicePixelRatio: 1,
                        deviceRectangles: DEVICE_RECTANGLES,
                        initialDevicePixelRatio: 1,
                        innerHeight: 768,
                        isEmulated: false,
                        isAndroidNativeWebScreenshot: false,
                        isAndroid: false,
                        isIOS: false
                    }
                })
            })
        })
    })
})
