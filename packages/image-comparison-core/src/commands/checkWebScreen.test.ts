import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import checkWebScreen from './checkWebScreen.js'
import type { InternalCheckScreenMethodOptions } from './check.interfaces.js'
import { BASE_CHECK_OPTIONS } from '../mocks/mocks.js'

vi.mock('../methods/images.js', () => ({
    executeImageCompare: vi.fn().mockResolvedValue({
        fileName: 'test-result.png',
        misMatchPercentage: 0,
        isExactSameImage: true,
        isNewBaseline: false,
        isAboveTolerance: false,
    })
}))
vi.mock('./saveWebScreen.js', () => ({
    default: vi.fn().mockResolvedValue({
        devicePixelRatio: 2,
        fileName: 'test-screen.png'
    })
}))
vi.mock('../helpers/options.js', () => ({
    screenMethodCompareOptions: vi.fn().mockReturnValue({
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
vi.mock('../helpers/utils.js', () => ({
    extractCommonCheckVariables: vi.fn().mockReturnValue({
        actualFolder: '/mock/actual',
        baselineFolder: '/mock/baseline',
        diffFolder: '/mock/diff',
        browserName: 'chrome',
        deviceName: 'Desktop',
        deviceRectangles: { screenSize: { width: 1280, height: 720 } },
        isAndroid: false,
        isMobile: false,
        isAndroidNativeWebScreenshot: false,
        autoSaveBaseline: false,
        savePerInstance: false,
    }),
    buildBaseExecuteCompareOptions: vi.fn().mockImplementation((params) => ({
        compareOptions: {
            wic: params.wicCompareOptions,
            method: params.methodCompareOptions,
        },
        devicePixelRatio: params.devicePixelRatio,
        deviceRectangles: { screenSize: { width: 1280, height: 720 } },
        fileName: params.fileName,
        folderOptions: {
            autoSaveBaseline: false,
            actualFolder: '/mock/actual',
            baselineFolder: '/mock/baseline',
            diffFolder: '/mock/diff',
            browserName: 'chrome',
            deviceName: 'Desktop',
            isMobile: false,
            savePerInstance: false,
        },
        isAndroid: false,
        isAndroidNativeWebScreenshot: false,
    })),
}))

describe('checkWebScreen', () => {
    let executeImageCompareSpy: ReturnType<typeof vi.fn>
    let saveWebScreenSpy: ReturnType<typeof vi.fn>

    const baseOptions: InternalCheckScreenMethodOptions = {
        checkScreenOptions: {
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
        isNativeContext: false,
        tag: 'test-screen',
        testContext: BASE_CHECK_OPTIONS.testContext
    }

    beforeEach(async () => {
        const { executeImageCompare } = await import('../methods/images.js')
        const saveWebScreen = (await import('./saveWebScreen.js')).default

        executeImageCompareSpy = vi.mocked(executeImageCompare)
        saveWebScreenSpy = vi.mocked(saveWebScreen)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should execute checkWebScreen with basic options', async () => {
        const result = await checkWebScreen(baseOptions)

        expect(result).toMatchSnapshot()
        expect(saveWebScreenSpy.mock.calls[0]).toMatchSnapshot()
        expect(executeImageCompareSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle hideElements and removeElements correctly', async () => {
        const mockElement = {
            elementId: 'test-element',
            selector: '#test-element',
            isDisplayed: vi.fn().mockResolvedValue(true),
            getSize: vi.fn().mockResolvedValue({ width: 100, height: 100 }),
            getLocation: vi.fn().mockResolvedValue({ x: 0, y: 0 })
        } as any
        const options = {
            ...baseOptions,
            checkScreenOptions: {
                ...baseOptions.checkScreenOptions,
                method: {
                    ...baseOptions.checkScreenOptions.method,
                    hideElements: [mockElement],
                    removeElements: [mockElement],
                }
            }
        }

        await checkWebScreen(options)

        expect(saveWebScreenSpy.mock.calls[0]).toMatchSnapshot()
        expect(executeImageCompareSpy.mock.calls[0]).toMatchSnapshot()
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

        await checkWebScreen(options)

        expect(executeImageCompareSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should merge compare options correctly', async () => {
        const options = {
            ...baseOptions,
            checkScreenOptions: {
                ...baseOptions.checkScreenOptions,
                wic: {
                    ...baseOptions.checkScreenOptions.wic,
                    compareOptions: {
                        ...baseOptions.checkScreenOptions.wic.compareOptions,
                        ignoreAlpha: true,
                        ignoreAntialiasing: true,
                        ignoreColors: true,
                    }
                },
                method: {
                    ...baseOptions.checkScreenOptions.method,
                    disableBlinkingCursor: true,
                    disableCSSAnimation: true,
                    enableLayoutTesting: true,
                }
            }
        }

        await checkWebScreen(options)

        expect(saveWebScreenSpy.mock.calls[0]).toMatchSnapshot()
        expect(executeImageCompareSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle native context correctly', async () => {
        const options = {
            ...baseOptions,
            isNativeContext: true
        }

        await checkWebScreen(options)

        expect(saveWebScreenSpy.mock.calls[0]).toMatchSnapshot()
        expect(executeImageCompareSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle all method options correctly', async () => {
        const mockHideElement = {
            elementId: 'hide-element',
            selector: '#hide-element',
            isDisplayed: vi.fn().mockResolvedValue(true),
            getSize: vi.fn().mockResolvedValue({ width: 100, height: 100 }),
            getLocation: vi.fn().mockResolvedValue({ x: 0, y: 0 })
        } as any
        const mockRemoveElement = {
            elementId: 'remove-element',
            selector: '#remove-element',
            isDisplayed: vi.fn().mockResolvedValue(true),
            getSize: vi.fn().mockResolvedValue({ width: 100, height: 100 }),
            getLocation: vi.fn().mockResolvedValue({ x: 0, y: 0 })
        } as any
        const options = {
            ...baseOptions,
            checkScreenOptions: {
                ...baseOptions.checkScreenOptions,
                method: {
                    disableBlinkingCursor: true,
                    disableCSSAnimation: true,
                    enableLayoutTesting: true,
                    enableLegacyScreenshotMethod: true,
                    hideScrollBars: false,
                    hideElements: [mockHideElement],
                    removeElements: [mockRemoveElement],
                    waitForFontsLoaded: false,
                }
            }
        }

        await checkWebScreen(options)

        expect(saveWebScreenSpy.mock.calls[0]).toMatchSnapshot()
        expect(executeImageCompareSpy.mock.calls[0]).toMatchSnapshot()
    })
})
