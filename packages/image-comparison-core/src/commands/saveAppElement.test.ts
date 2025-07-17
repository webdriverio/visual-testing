import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import saveAppElement from './saveAppElement.js'
import type { InternalSaveElementMethodOptions } from './save.interfaces.js'
import {
    BASE_CHECK_OPTIONS,
    createMethodOptions,
    createTestOptions
} from '../mocks/mocks.js'
import { DEVICE_RECTANGLES } from '../helpers/constants.js'

vi.mock('../methods/images.js', () => ({
    takeBase64ElementScreenshot: vi.fn().mockResolvedValue('base64-screenshot-data')
}))
vi.mock('../helpers/afterScreenshot.js', () => ({
    default: vi.fn().mockResolvedValue({
        devicePixelRatio: 2,
        fileName: 'test-element.png'
    })
}))
vi.mock('../helpers/options.js', () => ({
    buildAfterScreenshotOptions: vi.fn().mockReturnValue({
        actualFolder: '/path/to/actual',
        base64Image: 'base64-screenshot-data',
        filePath: {
            browserName: 'chrome',
            deviceName: '',
            isMobile: false,
            savePerInstance: false
        },
        fileName: {
            browserName: 'chrome',
            browserVersion: 'latest',
            deviceName: '',
            devicePixelRatio: 1,
            formatImageName: '{tag}',
            isMobile: false,
            isTestInBrowser: false,
            logName: 'chrome',
            name: '',
            platformName: 'Windows',
            platformVersion: 'latest',
            screenHeight: 720,
            screenWidth: 1366,
            tag: 'test-element'
        },
        isNativeContext: true,
        isLandscape: false,
        platformName: 'Windows'
    })
}))

describe('saveAppElement', () => {
    let takeBase64ElementScreenshotSpy: ReturnType<typeof vi.fn>
    let afterScreenshotSpy: ReturnType<typeof vi.fn>
    let buildAfterScreenshotOptionsSpy: ReturnType<typeof vi.fn>

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
            method: createMethodOptions()
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
        const { buildAfterScreenshotOptions } = await import('../helpers/options.js')

        takeBase64ElementScreenshotSpy = vi.mocked(takeBase64ElementScreenshot)
        afterScreenshotSpy = vi.mocked(afterScreenshot)
        buildAfterScreenshotOptionsSpy = vi.mocked(buildAfterScreenshotOptions)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should execute saveAppElement with basic options', async () => {
        const result = await saveAppElement(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeBase64ElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0][1]).toMatchSnapshot()
    })

    it('should handle custom resize dimensions', async () => {
        const options = createTestOptions(baseOptions, {
            saveElementOptions: {
                wic: {
                    ...BASE_CHECK_OPTIONS.wic
                },
                method: {
                    resizeDimensions: {
                        top: 10,
                        right: 20,
                        bottom: 30,
                        left: 40
                    }
                }
            }
        })

        await saveAppElement(options)

        expect(takeBase64ElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0][1]).toMatchSnapshot()
    })

    it('should handle iOS device correctly', async () => {
        const options = createTestOptions(baseOptions, {
            browserInstance: { isAndroid: false, isMobile: true } as any,
            instanceData: {
                ...BASE_CHECK_OPTIONS.instanceData,
                deviceName: 'iPhone 12',
                isAndroid: false,
                isIOS: true,
                isMobile: true,
                platformName: 'iOS',
                platformVersion: '14.0',
                deviceRectangles: {
                    ...DEVICE_RECTANGLES,
                    screenSize: { height: 844, width: 390 },
                }
            }
        })

        await saveAppElement(options)

        expect(takeBase64ElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0][1]).toMatchSnapshot()
    })

    it('should handle Android device correctly', async () => {
        const options = createTestOptions(baseOptions, {
            browserInstance: { isAndroid: true, isMobile: true } as any,
            instanceData: {
                ...BASE_CHECK_OPTIONS.instanceData,
                deviceName: 'Pixel 4',
                isAndroid: true,
                isIOS: false,
                isMobile: true,
                platformName: 'Android',
                platformVersion: '11.0',
                deviceRectangles: {
                    ...DEVICE_RECTANGLES,
                    screenSize: { height: 915, width: 412 },
                }
            }
        })

        await saveAppElement(options)

        expect(takeBase64ElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0][1]).toMatchSnapshot()
    })

    it('should handle non-native context correctly', async () => {
        const options = createTestOptions(baseOptions, {
            isNativeContext: false
        })

        await saveAppElement(options)

        expect(takeBase64ElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0][1]).toMatchSnapshot()
    })

    it('should handle custom image naming', async () => {
        const options = createTestOptions(baseOptions, {
            tag: 'custom-element-name'
        })

        await saveAppElement(options)

        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0][1]).toMatchSnapshot()
    })

    it('should handle save per instance', async () => {
        const options = createTestOptions(baseOptions, {
            saveElementOptions: {
                wic: {
                    ...BASE_CHECK_OPTIONS.wic,
                    savePerInstance: true
                },
                method: {}
            }
        })

        await saveAppElement(options)

        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0][1]).toMatchSnapshot()
    })

    it('should handle custom screen sizes', async () => {
        const options = createTestOptions(baseOptions, {
            instanceData: {
                ...BASE_CHECK_OPTIONS.instanceData,
                deviceRectangles: {
                    ...DEVICE_RECTANGLES,
                    screenSize: {
                        width: 375,
                        height: 812
                    }
                }
            }
        })

        await saveAppElement(options)

        expect(takeBase64ElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0][1]).toMatchSnapshot()
    })
})
