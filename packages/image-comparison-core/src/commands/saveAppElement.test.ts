import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import saveAppElement from './saveAppElement.js'
import type { InternalSaveElementMethodOptions } from './save.interfaces.js'
import { BASE_CHECK_OPTIONS } from '../mocks/mocks.js'

vi.mock('../methods/images.js', () => ({
    takeBase64ElementScreenshot: vi.fn().mockResolvedValue('base64-screenshot-data')
}))
vi.mock('../helpers/afterScreenshot.js', () => ({
    default: vi.fn().mockResolvedValue({
        devicePixelRatio: 2,
        fileName: 'test-element.png'
    })
}))

describe('saveAppElement', () => {
    let takeBase64ElementScreenshotSpy: ReturnType<typeof vi.fn>
    let afterScreenshotSpy: ReturnType<typeof vi.fn>

    const baseOptions: InternalSaveElementMethodOptions = {
        element: {
            elementId: 'test-element',
            selector: '#test-element',
            isDisplayed: vi.fn().mockResolvedValue(true),
            getSize: vi.fn().mockResolvedValue({ width: 100, height: 100 }),
            getLocation: vi.fn().mockResolvedValue({ x: 0, y: 0 })
        } as any,
        saveElementOptions: {
            wic: BASE_CHECK_OPTIONS.wic,
            method: {
                disableBlinkingCursor: false,
                disableCSSAnimation: false,
                enableLayoutTesting: false,
                enableLegacyScreenshotMethod: false,
                hideScrollBars: true,
                hideElements: [],
                removeElements: [],
                waitForFontsLoaded: true,
            }
        },
        browserInstance: { isAndroid: false, isMobile: false } as any,
        folders: BASE_CHECK_OPTIONS.folders,
        instanceData: BASE_CHECK_OPTIONS.instanceData,
        isNativeContext: true,
        tag: 'test-element'
    }

    beforeEach(async () => {
        const { takeBase64ElementScreenshot } = await import('../methods/images.js')
        const afterScreenshot = (await import('../helpers/afterScreenshot.js')).default

        takeBase64ElementScreenshotSpy = vi.mocked(takeBase64ElementScreenshot)
        afterScreenshotSpy = vi.mocked(afterScreenshot)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should execute saveAppElement with basic options', async () => {
        const result = await saveAppElement(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeBase64ElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle custom resize dimensions', async () => {
        const options = {
            ...baseOptions,
            saveElementOptions: {
                ...baseOptions.saveElementOptions,
                wic: {
                    ...baseOptions.saveElementOptions.wic,
                    resizeDimensions: {
                        top: 10,
                        right: 20,
                        bottom: 30,
                        left: 40
                    }
                }
            }
        }

        await saveAppElement(options)

        expect(takeBase64ElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle iOS device correctly', async () => {
        const options = {
            ...baseOptions,
            browserInstance: { isAndroid: false, isMobile: true } as any,
            instanceData: {
                ...baseOptions.instanceData,
                deviceName: 'iPhone 12',
                isAndroid: false,
                isIOS: true,
                platformName: 'iOS',
                platformVersion: '14.0',
                nativeWebScreenshot: true
            }
        }

        await saveAppElement(options)

        expect(takeBase64ElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle Android device correctly', async () => {
        const options = {
            ...baseOptions,
            browserInstance: { isAndroid: true, isMobile: true } as any,
            instanceData: {
                ...baseOptions.instanceData,
                deviceName: 'Pixel 4',
                isAndroid: true,
                isIOS: false,
                platformName: 'Android',
                platformVersion: '11.0',
                nativeWebScreenshot: true
            }
        }

        await saveAppElement(options)

        expect(takeBase64ElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle non-native context correctly', async () => {
        const options = {
            ...baseOptions,
            isNativeContext: false
        }

        await saveAppElement(options)

        expect(takeBase64ElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle custom image naming', async () => {
        const options = {
            ...baseOptions,
            tag: 'custom-element-name'
        }

        await saveAppElement(options)

        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle save per instance', async () => {
        const options = {
            ...baseOptions,
            saveElementOptions: {
                ...baseOptions.saveElementOptions,
                wic: {
                    ...baseOptions.saveElementOptions.wic,
                    savePerInstance: true
                }
            }
        }

        await saveAppElement(options)

        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle custom screen sizes', async () => {
        const options = {
            ...baseOptions,
            saveElementOptions: {
                ...baseOptions.saveElementOptions,
                wic: {
                    ...baseOptions.saveElementOptions.wic,
                    screenSize: {
                        width: 375,
                        height: 812
                    }
                }
            }
        }

        await saveAppElement(options)

        expect(takeBase64ElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })
})
