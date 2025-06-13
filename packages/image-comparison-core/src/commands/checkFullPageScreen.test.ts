import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import checkFullPageScreen from './checkFullPageScreen.js'
import type { InternalCheckFullPageMethodOptions } from './check.interfaces.js'
import { BASE_CHECK_OPTIONS } from '../mocks/mocks.js'

// Mock the dependencies
vi.mock('../helpers/options.js', () => ({
    methodCompareOptions: vi.fn().mockReturnValue({
        ignoreAlpha: false,
        ignoreAntialiasing: false,
        ignoreColors: false,
        ignoreLess: false,
        ignoreNothing: false,
        rawMisMatchPercentage: false,
        returnAllCompareData: false,
        saveAboveTolerance: 0,
        scaleImagesToSameSize: false,
    })
}))

vi.mock('../methods/images.js', () => ({
    executeImageCompare: vi.fn().mockResolvedValue({
        fileName: 'test-result.png',
        misMatchPercentage: 0,
        isExactSameImage: true,
        isNewBaseline: false,
        isAboveTolerance: false,
    })
}))

vi.mock('./saveFullPageScreen.js', () => ({
    default: vi.fn().mockResolvedValue({
        devicePixelRatio: 2,
        fileName: 'test-fullpage.png'
    })
}))

describe('checkFullPageScreen', () => {
    let executeImageCompareSpy: ReturnType<typeof vi.fn>
    let saveFullPageScreenSpy: ReturnType<typeof vi.fn>

    const baseOptions: InternalCheckFullPageMethodOptions = {
        checkFullPageOptions: {
            wic: BASE_CHECK_OPTIONS.wic,
            method: {
                disableBlinkingCursor: false,
                disableCSSAnimation: false,
                enableLayoutTesting: false,
                enableLegacyScreenshotMethod: false,
                fullPageScrollTimeout: 1500,
                hideAfterFirstScroll: [],
                hideScrollBars: true,
                hideElements: [],
                removeElements: [],
                waitForFontsLoaded: true,
            }
        },
        browserInstance: { isAndroid: false } as any,
        folders: BASE_CHECK_OPTIONS.folders,
        instanceData: BASE_CHECK_OPTIONS.instanceData,
        isNativeContext: false,
        tag: 'test-fullpage',
        testContext: BASE_CHECK_OPTIONS.testContext
    }

    beforeEach(async () => {
        const { executeImageCompare } = await import('../methods/images.js')
        const saveFullPageScreen = (await import('./saveFullPageScreen.js')).default

        executeImageCompareSpy = vi.mocked(executeImageCompare)
        saveFullPageScreenSpy = vi.mocked(saveFullPageScreen)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should throw error when used in native context', async () => {
        const options = {
            ...baseOptions,
            isNativeContext: true
        }

        await expect(checkFullPageScreen(options)).rejects.toThrow(
            'The method checkFullPageScreen is not supported in native context for native mobile apps!'
        )
    })

    it('should execute checkFullPageScreen with basic options', async () => {
        const result = await checkFullPageScreen(baseOptions)

        expect(result).toMatchSnapshot()
        expect(saveFullPageScreenSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle Android device correctly', async () => {
        const options = {
            ...baseOptions,
            browserInstance: { isAndroid: true } as any,
            instanceData: {
                ...baseOptions.instanceData,
                deviceName: 'Pixel 4',
                isAndroid: true,
                isIOS: false,
                platformName: 'Android',
                platformVersion: '11.0'
            },
            testContext: {
                ...baseOptions.testContext,
                instanceData: {
                    ...baseOptions.testContext.instanceData,
                    deviceName: 'Pixel 4',
                    platform: { name: 'Android', version: '11.0' },
                    isAndroid: true,
                    isIOS: false
                }
            }
        }

        await checkFullPageScreen(options)

        expect(executeImageCompareSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should merge compare options correctly', async () => {
        const options = {
            ...baseOptions,
            checkFullPageOptions: {
                ...baseOptions.checkFullPageOptions,
                wic: {
                    ...baseOptions.checkFullPageOptions.wic,
                    compareOptions: {
                        ...baseOptions.checkFullPageOptions.wic.compareOptions,
                        ignoreAlpha: true,
                        ignoreAntialiasing: true,
                        ignoreColors: true,
                    }
                },
                method: {
                    ...baseOptions.checkFullPageOptions.method,
                    disableBlinkingCursor: true,
                    disableCSSAnimation: true,
                    enableLayoutTesting: true,
                }
            }
        }

        await checkFullPageScreen(options)

        expect(executeImageCompareSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle hideElements and removeElements correctly', async () => {
        const mockElement1 = { elementId: 'hide-element', selector: '#hide' } as any
        const mockElement2 = { elementId: 'remove-element', selector: '#remove' } as any

        const options = {
            ...baseOptions,
            checkFullPageOptions: {
                ...baseOptions.checkFullPageOptions,
                method: {
                    ...baseOptions.checkFullPageOptions.method,
                    hideElements: [mockElement1],
                    removeElements: [mockElement2],
                }
            }
        }

        await checkFullPageScreen(options)

        expect(saveFullPageScreenSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle hideAfterFirstScroll correctly', async () => {
        const mockElement = { elementId: 'hide-element', selector: '#hide' } as any

        const options = {
            ...baseOptions,
            checkFullPageOptions: {
                ...baseOptions.checkFullPageOptions,
                method: {
                    ...baseOptions.checkFullPageOptions.method,
                    hideAfterFirstScroll: [mockElement],
                }
            }
        }

        await checkFullPageScreen(options)

        expect(saveFullPageScreenSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle all full page specific options', async () => {
        const options = {
            ...baseOptions,
            checkFullPageOptions: {
                ...baseOptions.checkFullPageOptions,
                method: {
                    disableBlinkingCursor: true,
                    disableCSSAnimation: true,
                    enableLayoutTesting: true,
                    enableLegacyScreenshotMethod: true,
                    fullPageScrollTimeout: 2000,
                    hideAfterFirstScroll: [],
                    hideScrollBars: false,
                    hideElements: [],
                    removeElements: [],
                    waitForFontsLoaded: false,
                }
            }
        }

        await checkFullPageScreen(options)

        expect(saveFullPageScreenSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle hybrid app options correctly', async () => {
        const options = {
            ...baseOptions,
            checkFullPageOptions: {
                ...baseOptions.checkFullPageOptions,
                wic: {
                    ...baseOptions.checkFullPageOptions.wic,
                    isHybridApp: true
                }
            }
        }

        await checkFullPageScreen(options)

        expect(executeImageCompareSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle undefined method options with fallbacks', async () => {
        const options = {
            ...baseOptions,
            checkFullPageOptions: {
                ...baseOptions.checkFullPageOptions,
                method: {
                    disableBlinkingCursor: false,
                    disableCSSAnimation: false,
                    enableLayoutTesting: false,
                    enableLegacyScreenshotMethod: false,
                    fullPageScrollTimeout: 1500,
                    hideScrollBars: true,
                    waitForFontsLoaded: true,
                    // Intentionally omitting hideAfterFirstScroll, hideElements, and removeElements
                }
            }
        }

        await checkFullPageScreen(options)

        expect(saveFullPageScreenSpy.mock.calls[0]).toMatchSnapshot()
    })
})
