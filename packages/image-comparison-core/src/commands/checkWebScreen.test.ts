import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import checkWebScreen from './checkWebScreen.js'
import type { InternalCheckScreenMethodOptions } from './check.interfaces.js'
import { BASE_CHECK_OPTIONS } from '../mocks/mocks.js'

vi.mock('../methods/images.js', () => ({
    executeImageCompare: vi.fn().mockResolvedValue({
        fileName: 'test-screen.png',
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
        browserInstance: {
            isAndroid: false,
            isMobile: false
        } as any,
        folders: BASE_CHECK_OPTIONS.folders,
        instanceData: BASE_CHECK_OPTIONS.instanceData,
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

    it('should handle Android device correctly', async () => {
        const options = {
            ...baseOptions,
            browserInstance: {
                isAndroid: true,
                isMobile: true
            } as any,
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

    it('should handle custom screen options', async () => {
        const mockElement = {
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
                    hideElements: [mockElement],
                    removeElements: [mockRemoveElement],
                    waitForFontsLoaded: false,
                }
            }
        }

        await checkWebScreen(options)

        expect(saveWebScreenSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle compare options correctly', async () => {
        const options = {
            ...baseOptions,
            checkScreenOptions: {
                ...baseOptions.checkScreenOptions,
                wic: {
                    ...baseOptions.checkScreenOptions.wic,
                    compareOptions: {
                        ignoreAlpha: true,
                        ignoreAntialiasing: true,
                        ignoreColors: true,
                        ignoreLess: true,
                        ignoreNothing: false,
                        rawMisMatchPercentage: true,
                        returnAllCompareData: true,
                        saveAboveTolerance: 0.1,
                        scaleImagesToSameSize: true,
                        blockOutSideBar: false,
                        blockOutStatusBar: false,
                        blockOutToolBar: false,
                        createJsonReportFiles: false,
                        diffPixelBoundingBoxProximity: 0
                    }
                }
            }
        }

        await checkWebScreen(options)

        expect(executeImageCompareSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle device rectangles correctly', async () => {
        const options = {
            ...baseOptions,
            instanceData: {
                ...baseOptions.instanceData,
                deviceRectangles: {
                    statusBar: { x: 0, y: 0, width: 100, height: 20 },
                    toolBar: { x: 0, y: 20, width: 100, height: 40 },
                    sideBar: { x: 0, y: 60, width: 20, height: 100 },
                    bottomBar: { x: 0, y: 80, width: 100, height: 20 },
                    homeBar: { x: 0, y: 100, width: 100, height: 20 },
                    leftSidePadding: { x: 0, y: 0, width: 10, height: 100 },
                    rightSidePadding: { x: 90, y: 0, width: 10, height: 100 },
                    topSidePadding: { x: 0, y: 0, width: 100, height: 10 },
                    bottomSidePadding: { x: 0, y: 90, width: 100, height: 10 },
                    screenSize: { x: 0, y: 0, width: 100, height: 120 },
                    statusBarAndAddressBar: { x: 0, y: 0, width: 100, height: 60 },
                    viewport: { x: 0, y: 60, width: 100, height: 60 }
                }
            }
        }

        await checkWebScreen(options)

        expect(executeImageCompareSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle hybrid app options correctly', async () => {
        const options = {
            ...baseOptions,
            checkScreenOptions: {
                ...baseOptions.checkScreenOptions,
                wic: {
                    ...baseOptions.checkScreenOptions.wic,
                    isHybridApp: true
                }
            }
        }

        await checkWebScreen(options)

        expect(executeImageCompareSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle undefined method options with fallbacks', async () => {
        const options = {
            ...baseOptions,
            checkScreenOptions: {
                ...baseOptions.checkScreenOptions,
                method: {
                    disableBlinkingCursor: false,
                    disableCSSAnimation: false,
                    enableLayoutTesting: false,
                    enableLegacyScreenshotMethod: false,
                    hideScrollBars: true,
                    waitForFontsLoaded: true,
                    // Intentionally omitting hideElements and removeElements
                }
            }
        }

        await checkWebScreen(options)

        expect(saveWebScreenSpy.mock.calls[0]).toMatchSnapshot()
    })
})
