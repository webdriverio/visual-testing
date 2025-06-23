import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { join } from 'node:path'
import logger from '@wdio/logger'
import { getDesktopFullPageScreenshotsData, logHiddenRemovedError, takeBase64BiDiScreenshot, takeWebElementScreenshot } from './screenshots.js'
import type { TakeWebElementScreenshot, FullPageScreenshotOptions } from './screenshots.interfaces.js'
import type { RectanglesOutput } from './rectangles.interfaces.js'
import { IMAGE_STRING, MEDIUM_IMAGE_STRING, SMALL_IMAGE_STRING } from '../mocks/image.js'
import { DEVICE_RECTANGLES } from '../helpers/constants.js'
import * as rectanglesModule from './rectangles.js'
import * as utilsModule from '../helpers/utils.js'

const log = logger('test')
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))

// Mock the rectangles module
vi.mock('./rectangles.js', () => ({
    determineElementRectangles: vi.fn()
}))

// Mock the utils module
vi.mock('../helpers/utils.js', async () => {
    const actual = await vi.importActual('../helpers/utils.js')
    return {
        ...actual,
        getBase64ScreenshotSize: vi.fn(),
        waitFor: vi.fn(),
        calculateDprData: vi.fn()
    }
})

// Mock client-side scripts
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
    // Helper function to create mock browser instance with methods
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

    // Helper function to create mock element
    const createMockElement = () => {
        return {
            elementId: 'element-123'
        } as unknown as WebdriverIO.Element
    }

    let logWarnSpy: ReturnType<typeof vi.spyOn>

    describe('getDesktopFullPageScreenshotsData', () => {
        // Helper function to create base options
        const createBaseOptions = (overrides: Partial<FullPageScreenshotOptions> = {}): FullPageScreenshotOptions => ({
            devicePixelRatio: 1,
            fullPageScrollTimeout: 1000,
            innerHeight: 768,
            hideAfterFirstScroll: [],
            ...overrides
        })

        beforeEach(() => {
            logWarnSpy = vi.spyOn(log, 'warn')
            // Reset all mocks with default values
            vi.mocked(utilsModule.waitFor).mockResolvedValue(undefined)
            vi.mocked(utilsModule.calculateDprData).mockImplementation((data) => data)
        })

        afterEach(() => {
            vi.clearAllMocks()
            logWarnSpy.mockRestore()
        })

        it('should take single screenshot when content fits in viewport', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            // Mock screenshot size to match inner height
            vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue({
                width: 1366,
                height: 768
            })

            // Mock scroll height equal to inner height (no scrolling needed)
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

            // Mock scroll height larger than viewport to trigger multiple screenshots
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

            // Mock screenshot size slightly different from inner height but rounds to same value
            // This will trigger: Math.round(768.4) === 768, so actualInnerHeight = 768.4
            vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue({
                width: 1366,
                height: 768.4 // Different from 768, but Math.round(768.4) === 768
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

            // Mock scroll height to trigger multiple screenshots
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

            // Mock the exact sequence: we need multiple screenshots to trigger element hiding
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
            expect(result.data).toHaveLength(2) // Should have 2 screenshots
            // Verify that logHiddenRemovedError was called twice (once for hide, once for restore)
            expect(logWarnSpy).toHaveBeenCalledTimes(2)
        })

        it('should throw error when scroll height cannot be determined', async () => {
            const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

            vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue({
                width: 1366,
                height: 768
            })

            // Mock getDocumentScrollHeight to return undefined
            mockBrowserInstance.execute = vi.fn()
                .mockResolvedValueOnce(undefined) // scrollToPosition
                .mockResolvedValueOnce(undefined) // getDocumentScrollHeight returns undefined

            const options = createBaseOptions()

            await expect(getDesktopFullPageScreenshotsData(mockBrowserInstance, options))
                .rejects.toThrow('Couldn\'t determine scroll height or screenshot size')
        })

        // it('should throw error when screenshot size cannot be determined', async () => {
        //     const mockBrowserInstance = createMockBrowserInstance({ takeScreenshot: SMALL_IMAGE_STRING })

        //     // Mock getBase64ScreenshotSize to return undefined
        //     vi.mocked(utilsModule.getBase64ScreenshotSize).mockReturnValue(undefined as any)

        //     mockBrowserInstance.execute = vi.fn()
        //         .mockResolvedValueOnce(undefined) // scrollToPosition
        //         .mockResolvedValueOnce(768) // getDocumentScrollHeight

        //     const options = createBaseOptions()

        //     await expect(getDesktopFullPageScreenshotsData(mockBrowserInstance, options))
        //         .rejects.toThrow('Couldn\'t determine scroll height or screenshot size')
        // })
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
