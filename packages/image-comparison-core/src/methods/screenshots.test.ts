import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { join } from 'node:path'
import logger from '@wdio/logger'
import { takeBase64BiDiScreenshot, takeWebElementScreenshot } from './screenshots.js'
import type { TakeWebElementScreenshot } from './screenshots.interfaces.js'
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
        getBase64ScreenshotSize: vi.fn()
    }
})

describe('screenshots', () => {
    // Helper function to create mock browser instance with methods
    const createMockBrowserInstance = ({ takeScreenshot = IMAGE_STRING, takeElementScreenshot = IMAGE_STRING }: { takeScreenshot?: string, takeElementScreenshot?: string } = {}) => {
        return {
            takeScreenshot: vi.fn().mockResolvedValue(takeScreenshot),
            takeElementScreenshot: vi.fn().mockResolvedValue(takeElementScreenshot),
            getWindowHandle: vi.fn().mockResolvedValue('window-handle-123'),
            browsingContextCaptureScreenshot: vi.fn().mockResolvedValue({ data: takeScreenshot }),
            execute: vi.fn().mockResolvedValue({})
        } as unknown as WebdriverIO.Browser
    }

    // Helper function to create mock element
    const createMockElement = () => {
        return {
            elementId: 'element-123'
        } as unknown as WebdriverIO.Element
    }

    let logWarnSpy: ReturnType<typeof vi.spyOn>

    // describe('getBase64FullPageScreenshotsData', () => {
    //     it('should return base64 screenshot data', async () => {
    //         const mockBrowserInstance = createMockBrowserInstance()
    //         const options: FullPageScreenshotDataOptions = {
    //             addressBarShadowPadding: 0,
    //             devicePixelRatio: 1,
    //             deviceRectangles: {
    //                 ...DEVICE_RECTANGLES,
    //                 viewport: { x: 0, y: 0, width: 1366, height: 768 }
    //             },
    //             fullPageScrollTimeout: 1000,
    //             hideAfterFirstScroll: [],
    //             innerHeight: 768,
    //             isAndroid: false,
    //             isAndroidNativeWebScreenshot: false,
    //             isAndroidChromeDriverScreenshot: false,
    //             isIOS: false,
    //             isLandscape: false,
    //             screenHeight: 800,
    //             screenWidth: 1366,
    //             toolBarShadowPadding: 0,
    //         }
    //         const result = await getBase64FullPageScreenshotsData(mockBrowserInstance, options)

    //         expect(result).toBeDefined()
    //         expect(result.data).toBeDefined()
    //         expect(Array.isArray(result.data)).toBe(true)
    //     })
    // })

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
