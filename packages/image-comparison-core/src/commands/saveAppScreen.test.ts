import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import saveAppScreen from './saveAppScreen.js'
import type { InternalSaveScreenMethodOptions } from './save.interfaces.js'
import { BASE_CHECK_OPTIONS } from '../mocks/mocks.js'

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

describe('saveAppScreen', () => {
    let takeBase64ScreenshotSpy: ReturnType<typeof vi.fn>
    let makeCroppedBase64ImageSpy: ReturnType<typeof vi.fn>
    let afterScreenshotSpy: ReturnType<typeof vi.fn>

    const baseOptions: InternalSaveScreenMethodOptions = {
        browserInstance: { isAndroid: false, isMobile: false } as any,
        folders: BASE_CHECK_OPTIONS.folders,
        instanceData: {
            ...BASE_CHECK_OPTIONS.instanceData,
            devicePixelRatio: 2,
            deviceRectangles: {
                ...BASE_CHECK_OPTIONS.instanceData.deviceRectangles,
                screenSize: {
                    width: 375,
                    height: 812
                }
            }
        },
        isNativeContext: true,
        saveScreenOptions: {
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
        tag: 'test-screen'
    }

    beforeEach(async () => {
        const { takeBase64Screenshot } = await import('../methods/screenshots.js')
        const { makeCroppedBase64Image } = await import('../methods/images.js')
        const afterScreenshot = (await import('../helpers/afterScreenshot.js')).default

        takeBase64ScreenshotSpy = vi.mocked(takeBase64Screenshot)
        makeCroppedBase64ImageSpy = vi.mocked(makeCroppedBase64Image)
        afterScreenshotSpy = vi.mocked(afterScreenshot)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should execute saveAppScreen with basic options', async () => {
        const result = await saveAppScreen(baseOptions)

        expect(result).toMatchSnapshot()
        expect(takeBase64ScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(makeCroppedBase64ImageSpy).not.toHaveBeenCalled()
    })

    it('should handle iOS device with bezel corners', async () => {
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
            },
            saveScreenOptions: {
                ...baseOptions.saveScreenOptions,
                wic: {
                    ...baseOptions.saveScreenOptions.wic,
                    addIOSBezelCorners: true
                }
            }
        }

        await saveAppScreen(options)

        expect(takeBase64ScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(makeCroppedBase64ImageSpy.mock.calls[0]).toMatchSnapshot()
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

        await saveAppScreen(options)

        expect(takeBase64ScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(makeCroppedBase64ImageSpy).not.toHaveBeenCalled()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle non-native context correctly', async () => {
        const options = {
            ...baseOptions,
            isNativeContext: false
        }

        await saveAppScreen(options)

        expect(takeBase64ScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(makeCroppedBase64ImageSpy).not.toHaveBeenCalled()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle custom image naming', async () => {
        const options = {
            ...baseOptions,
            saveScreenOptions: {
                ...baseOptions.saveScreenOptions,
                wic: {
                    ...baseOptions.saveScreenOptions.wic,
                    formatImageName: '{tag}-{browserName}-{deviceName}'
                }
            }
        }

        await saveAppScreen(options)

        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle save per instance', async () => {
        const options = {
            ...baseOptions,
            saveScreenOptions: {
                ...baseOptions.saveScreenOptions,
                wic: {
                    ...baseOptions.saveScreenOptions.wic,
                    savePerInstance: true
                }
            }
        }

        await saveAppScreen(options)

        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle custom screen sizes', async () => {
        const options = {
            ...baseOptions,
            instanceData: {
                ...baseOptions.instanceData,
                deviceRectangles: {
                    ...BASE_CHECK_OPTIONS.instanceData.deviceRectangles,
                    screenSize: {
                        width: 1920,
                        height: 1080
                    }
                }
            }
        }

        await saveAppScreen(options)

        expect(takeBase64ScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })
})
