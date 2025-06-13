import { describe, it, expect, vi } from 'vitest'
import { join } from 'node:path'
import { getBase64FullPageScreenshotsData, takeBase64BiDiScreenshot } from './screenshots.js'
import type { FullPageScreenshotDataOptions } from './screenshots.interfaces.js'
import type { RectanglesOutput } from './rectangles.interfaces.js'
import { IMAGE_STRING } from '../mocks/image.js'
import { DEVICE_RECTANGLES } from '../helpers/constants.js'

vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))

describe('screenshots', () => {
    // Helper function to create mock browser instance with methods
    const createMockBrowserInstance = () => {
        return {
            takeScreenshot: vi.fn().mockResolvedValue(IMAGE_STRING),
            getWindowHandle: vi.fn().mockResolvedValue('window-handle-123'),
            browsingContextCaptureScreenshot: vi.fn().mockResolvedValue({ data: IMAGE_STRING }),
            execute: vi.fn().mockResolvedValue({})
        } as unknown as WebdriverIO.Browser
    }

    describe('getBase64FullPageScreenshotsData', () => {
        it('should return base64 screenshot data', async () => {
            const mockBrowserInstance = createMockBrowserInstance()
            const options: FullPageScreenshotDataOptions = {
                addressBarShadowPadding: 0,
                devicePixelRatio: 1,
                deviceRectangles: {
                    ...DEVICE_RECTANGLES,
                    viewport: { x: 0, y: 0, width: 1366, height: 768 }
                },
                fullPageScrollTimeout: 1000,
                hideAfterFirstScroll: [],
                innerHeight: 768,
                isAndroid: false,
                isAndroidNativeWebScreenshot: false,
                isAndroidChromeDriverScreenshot: false,
                isIOS: false,
                isLandscape: false,
                screenHeight: 800,
                screenWidth: 1366,
                toolBarShadowPadding: 0,
            }
            const result = await getBase64FullPageScreenshotsData(mockBrowserInstance, options)

            expect(result).toBeDefined()
            expect(result.data).toBeDefined()
            expect(Array.isArray(result.data)).toBe(true)
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
})
