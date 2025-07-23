import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import saveAppScreen from './saveAppScreen.js'
import { buildAfterScreenshotOptions } from '../helpers/options.js'
import type { InternalSaveScreenMethodOptions } from './save.interfaces.js'
import {
    BASE_CHECK_OPTIONS,
    createMethodOptions,
    createTestOptions
} from '../mocks/mocks.js'
import { DEVICE_RECTANGLES } from '../helpers/constants.js'

vi.mock('../methods/screenshots.js', () => ({
    takeBase64Screenshot: vi.fn().mockResolvedValue('base64-screenshot-data')
}))
vi.mock('../methods/images.js', () => ({
    makeCroppedBase64Image: vi.fn().mockResolvedValue('cropped-base64-screenshot-data')
}))
vi.mock('../helpers/afterScreenshot.js', () => ({
    default: vi.fn().mockResolvedValue({
        devicePixelRatio: 2,
        fileName: 'test-screen.png'
    })
}))
vi.mock('../helpers/options.js', () => ({
    buildAfterScreenshotOptions: vi.fn().mockReturnValue({
        actualFolder: '/test/actual',
        base64Image: 'base64-screenshot-data',
        filePath: {
            browserName: 'test-browser',
            deviceName: 'test-device',
            isMobile: true,
            savePerInstance: false,
        },
        fileName: {
            browserName: 'test-browser',
            browserVersion: '17.0',
            deviceName: 'test-device',
            devicePixelRatio: 2,
            formatImageName: '{tag}-{logName}-{width}x{height}-dpr-{dpr}',
            isMobile: true,
            isTestInBrowser: false,
            logName: 'test-log',
            name: 'test-device',
            outerHeight: NaN,
            outerWidth: NaN,
            platformName: 'iOS',
            platformVersion: '17.0',
            screenHeight: 812,
            screenWidth: 375,
            tag: 'test-screen',
        },
        isNativeContext: true,
        isLandscape: false,
        platformName: 'iOS',
    })
}))

describe('saveAppScreen', () => {
    let takeBase64ScreenshotSpy: ReturnType<typeof vi.fn>
    let makeCroppedBase64ImageSpy: ReturnType<typeof vi.fn>
    let afterScreenshotSpy: ReturnType<typeof vi.fn>
    let buildAfterScreenshotOptionsSpy: ReturnType<typeof vi.fn>

    const baseOptions = {
        browserInstance: { isAndroid: false, isMobile: false } as any,
        folders: BASE_CHECK_OPTIONS.folders,
        instanceData: {
            ...BASE_CHECK_OPTIONS.instanceData,
            devicePixelRatio: 2,
            deviceRectangles: {
                ...DEVICE_RECTANGLES,
                screenSize: {
                    width: 375,
                    height: 812
                }
            }
        },
        isNativeContext: true,
        saveScreenOptions: {
            wic: BASE_CHECK_OPTIONS.wic,
            method: createMethodOptions({
                disableBlinkingCursor: false,
                disableCSSAnimation: false,
                enableLayoutTesting: false,
                enableLegacyScreenshotMethod: false,
                hideScrollBars: true,
                hideElements: [],
                removeElements: [],
                waitForFontsLoaded: true,
            })
        },
        tag: 'test-screen'
    } as InternalSaveScreenMethodOptions

    beforeEach(async () => {
        const { takeBase64Screenshot } = await import('../methods/screenshots.js')
        const { makeCroppedBase64Image } = await import('../methods/images.js')
        const afterScreenshot = (await import('../helpers/afterScreenshot.js')).default

        takeBase64ScreenshotSpy = vi.mocked(takeBase64Screenshot)
        makeCroppedBase64ImageSpy = vi.mocked(makeCroppedBase64Image)
        afterScreenshotSpy = vi.mocked(afterScreenshot)
        buildAfterScreenshotOptionsSpy = vi.mocked(buildAfterScreenshotOptions)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should execute saveAppScreen with basic options', async () => {
        const result = await saveAppScreen(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeBase64ScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(makeCroppedBase64ImageSpy).not.toHaveBeenCalled()
    })

    it('should handle iOS device with bezel corners', async () => {
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
                    screenSize: {
                        width: 390,
                        height: 844
                    }
                }
            },
            saveScreenOptions: {
                wic: {
                    ...BASE_CHECK_OPTIONS.wic,
                    addIOSBezelCorners: true
                },
                method: createMethodOptions()
            }
        })

        await saveAppScreen(options)

        expect(takeBase64ScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(makeCroppedBase64ImageSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
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
                    screenSize: {
                        width: 412,
                        height: 915
                    }
                }
            }
        })

        await saveAppScreen(options)

        expect(takeBase64ScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(makeCroppedBase64ImageSpy).not.toHaveBeenCalled()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle non-native context correctly', async () => {
        const options = createTestOptions(baseOptions, {
            isNativeContext: false
        })

        await saveAppScreen(options)

        expect(takeBase64ScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(makeCroppedBase64ImageSpy).not.toHaveBeenCalled()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle custom image naming', async () => {
        const options = createTestOptions(baseOptions, {
            saveScreenOptions: {
                wic: {
                    ...BASE_CHECK_OPTIONS.wic,
                    formatImageName: '{tag}-{browserName}-{deviceName}'
                },
                method: createMethodOptions()
            }
        })

        await saveAppScreen(options)

        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle save per instance', async () => {
        const options = createTestOptions(baseOptions, {
            saveScreenOptions: {
                wic: {
                    ...BASE_CHECK_OPTIONS.wic,
                    savePerInstance: true
                },
                method: createMethodOptions()
            }
        })

        await saveAppScreen(options)

        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle custom screen sizes', async () => {
        const options = createTestOptions(baseOptions, {
            instanceData: {
                ...BASE_CHECK_OPTIONS.instanceData,
                deviceRectangles: {
                    ...DEVICE_RECTANGLES,
                    screenSize: {
                        width: 1920,
                        height: 1080
                    }
                }
            }
        })

        await saveAppScreen(options)

        expect(takeBase64ScreenshotSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(buildAfterScreenshotOptionsSpy.mock.calls[0][0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })
})
