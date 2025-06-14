import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import saveAppElement from './saveAppElement.js'
import type { InternalSaveElementMethodOptions } from './save.interfaces.js'
import { BASE_CHECK_OPTIONS } from '../mocks/mocks.js'

vi.mock('../methods/images.js', () => ({
    takeBase64ElementScreenshot: vi.fn().mockResolvedValue('base64-image-data')
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
        browserInstance: { isAndroid: false, isMobile: false } as any,
        element: { elementId: 'test-element' } as any,
        folders: BASE_CHECK_OPTIONS.folders,
        instanceData: BASE_CHECK_OPTIONS.instanceData,
        isNativeContext: true,
        saveElementOptions: {
            wic: BASE_CHECK_OPTIONS.wic,
            method: {
                resizeDimensions: undefined
            }
        },
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
                method: {
                    resizeDimensions: {
                        width: 100,
                        height: 100,
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0
                    }
                }
            }
        }

        await saveAppElement(options)

        expect(takeBase64ElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle iOS device correctly', async () => {
        const options = {
            ...baseOptions,
            instanceData: {
                ...baseOptions.instanceData,
                deviceName: 'iPhone 14',
                isAndroid: false,
                isIOS: true,
                platformName: 'iOS',
                platformVersion: '17.0'
            }
        }

        await saveAppElement(options)

        expect(takeBase64ElementScreenshotSpy.mock.calls[0]).toMatchSnapshot()
        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle Android device correctly', async () => {
        const options = {
            ...baseOptions,
            instanceData: {
                ...baseOptions.instanceData,
                deviceName: 'Pixel 4',
                isAndroid: true,
                isIOS: false,
                platformName: 'Android',
                platformVersion: '11.0'
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

        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle custom format image name', async () => {
        const options = {
            ...baseOptions,
            saveElementOptions: {
                ...baseOptions.saveElementOptions,
                wic: {
                    ...baseOptions.saveElementOptions.wic,
                    formatImageName: '{tag}-{browserName}-{deviceName}'
                }
            }
        }

        await saveAppElement(options)

        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle savePerInstance option', async () => {
        const options = {
            ...baseOptions,
            saveElementOptions: {
                ...baseOptions.saveElementOptions,
                wic: {
                    ...baseOptions.saveElementOptions.wic,
                    savePerInstance: false
                }
            }
        }

        await saveAppElement(options)

        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle custom screen size', async () => {
        const options = {
            ...baseOptions,
            instanceData: {
                ...baseOptions.instanceData,
                deviceRectangles: {
                    ...baseOptions.instanceData.deviceRectangles,
                    screenSize: {
                        width: 1920,
                        height: 1080
                    }
                }
            }
        }

        await saveAppElement(options)

        expect(afterScreenshotSpy.mock.calls[0]).toMatchSnapshot()
    })
})
