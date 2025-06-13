import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import checkAppScreen from './checkAppScreen.js'
import type { InternalCheckScreenMethodOptions } from './check.interfaces.js'

// Mock the dependencies
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

vi.mock('../methods/images.js', () => ({
    executeImageCompare: vi.fn().mockResolvedValue({
        fileName: 'test-result.png',
        misMatchPercentage: 0,
        isExactSameImage: true,
        isNewBaseline: false,
        isAboveTolerance: false,
    })
}))

vi.mock('../methods/rectangles.js', () => ({
    determineIgnoreRegions: vi.fn().mockResolvedValue([
        { x: 0, y: 0, width: 100, height: 100 }
    ]),
    determineDeviceBlockOuts: vi.fn().mockResolvedValue([
        { x: 0, y: 0, width: 50, height: 50 }
    ])
}))

vi.mock('./saveAppScreen.js', () => ({
    default: vi.fn().mockResolvedValue({
        devicePixelRatio: 2,
        fileName: 'test-screen.png'
    })
}))

describe('checkAppScreen', () => {
    let executeImageCompareSpy: ReturnType<typeof vi.fn>
    let saveAppScreenSpy: ReturnType<typeof vi.fn>
    let determineIgnoreRegionsSpy: ReturnType<typeof vi.fn>
    let determineDeviceBlockOutsSpy: ReturnType<typeof vi.fn>

    const baseOptions: InternalCheckScreenMethodOptions = {
        checkScreenOptions: {
            wic: {
                addressBarShadowPadding: 6,
                autoElementScroll: true,
                addIOSBezelCorners: false,
                autoSaveBaseline: false,
                clearFolder: false,
                userBasedFullPageScreenshot: false,
                enableLegacyScreenshotMethod: false,
                formatImageName: '{tag}-{logName}-{width}x{height}-dpr-{dpr}',
                isHybridApp: false,
                savePerInstance: true,
                toolBarShadowPadding: 6,
                disableBlinkingCursor: false,
                disableCSSAnimation: false,
                enableLayoutTesting: false,
                fullPageScrollTimeout: 1500,
                hideScrollBars: true,
                waitForFontsLoaded: true,
                compareOptions: {
                    ignoreAlpha: false,
                    ignoreAntialiasing: false,
                    ignoreColors: false,
                    ignoreLess: false,
                    ignoreNothing: false,
                    rawMisMatchPercentage: false,
                    returnAllCompareData: false,
                    saveAboveTolerance: 0,
                    scaleImagesToSameSize: false,
                    blockOutSideBar: false,
                    blockOutStatusBar: false,
                    blockOutToolBar: false,
                    createJsonReportFiles: false,
                    diffPixelBoundingBoxProximity: 5,
                },
                tabbableOptions: {
                    circle: {
                        backgroundColor: 'rgba(255, 0, 0, 0.4)',
                        borderColor: 'rgba(255, 0, 0, 1)',
                        borderWidth: 1,
                        fontColor: 'rgba(0, 0, 0, 1)',
                        fontFamily: 'Arial',
                        fontSize: 10,
                        size: 10,
                    },
                    line: {
                        color: 'rgba(255, 0, 0, 1)',
                        width: 1,
                    },
                }
            },
            method: {
                hideElements: [],
                removeElements: [],
                ignore: [],
                blockOut: [],
                blockOutSideBar: false,
                blockOutStatusBar: false,
                blockOutToolBar: false,
                ignoreAlpha: false,
                ignoreAntialiasing: false,
                ignoreColors: false,
                ignoreLess: false,
                ignoreNothing: false,
                rawMisMatchPercentage: false,
                returnAllCompareData: false,
                saveAboveTolerance: 0,
                scaleImagesToSameSize: false,
            }
        },
        browserInstance: { isAndroid: false } as any,
        folders: {
            actualFolder: '/test/actual',
            baselineFolder: '/test/baseline',
            diffFolder: '/test/diff'
        },
        instanceData: {
            appName: 'TestApp',
            browserName: 'Chrome',
            browserVersion: '118.0.0.0',
            deviceName: 'iPhone 14',
            devicePixelRatio: 2,
            deviceRectangles: {
                bottomBar: { y: 800, x: 0, width: 390, height: 0 },
                homeBar: { x: 0, y: 780, width: 390, height: 34 },
                leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                screenSize: { height: 844, width: 390 },
                statusBar: { x: 0, y: 0, width: 390, height: 47 },
                statusBarAndAddressBar: { y: 0, x: 0, width: 390, height: 47 },
                viewport: { y: 47, x: 0, width: 390, height: 733 }
            },
            initialDevicePixelRatio: 2,
            isAndroid: false,
            isIOS: true,
            isMobile: true,
            logName: 'test-log',
            name: 'test-device',
            nativeWebScreenshot: false,
            platformName: 'iOS',
            platformVersion: '17.0'
        },
        isNativeContext: true,
        tag: 'test-screen',
        testContext: {
            commandName: 'checkScreen',
            framework: 'vitest',
            parent: 'test suite',
            title: 'test title',
            tag: 'test-tag',
            instanceData: {
                browser: { name: 'Chrome', version: '118.0.0.0' },
                deviceName: 'iPhone 14',
                platform: { name: 'iOS', version: '17.0' },
                app: 'TestApp',
                isMobile: true,
                isAndroid: false,
                isIOS: true
            }
        }
    }

    beforeEach(async () => {
        const { executeImageCompare } = await import('../methods/images.js')
        const { determineIgnoreRegions, determineDeviceBlockOuts } = await import('../methods/rectangles.js')
        const saveAppScreen = (await import('./saveAppScreen.js')).default

        executeImageCompareSpy = vi.mocked(executeImageCompare)
        determineIgnoreRegionsSpy = vi.mocked(determineIgnoreRegions)
        determineDeviceBlockOutsSpy = vi.mocked(determineDeviceBlockOuts)
        saveAppScreenSpy = vi.mocked(saveAppScreen)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should execute checkAppScreen with basic options', async () => {
        const result = await checkAppScreen(baseOptions)

        expect(result).toMatchSnapshot()
        expect(saveAppScreenSpy).toHaveBeenCalledWith({
            browserInstance: baseOptions.browserInstance,
            folders: baseOptions.folders,
            instanceData: baseOptions.instanceData,
            isNativeContext: true,
            saveScreenOptions: {
                wic: baseOptions.checkScreenOptions.wic,
                method: {
                    hideElements: [],
                    removeElements: []
                }
            },
            tag: 'test-screen',
        })
    })

    it('should handle ignore regions and device blockouts', async () => {
        const mockElement = { elementId: 'test-element', selector: '#test' } as any
        const options = {
            ...baseOptions,
            checkScreenOptions: {
                ...baseOptions.checkScreenOptions,
                method: {
                    ...baseOptions.checkScreenOptions.method,
                    hideElements: [mockElement],
                    removeElements: [mockElement],
                    ignore: [mockElement]
                }
            }
        }

        await checkAppScreen(options)

        expect(determineIgnoreRegionsSpy).toHaveBeenCalledWith(
            options.browserInstance,
            [mockElement, mockElement, mockElement]
        )

        expect(determineDeviceBlockOutsSpy).toHaveBeenCalledWith({
            isAndroid: false,
            screenCompareOptions: expect.objectContaining({
                ignore: [mockElement, mockElement, mockElement]
            }),
            instanceData: options.instanceData
        })

        expect(executeImageCompareSpy).toHaveBeenCalledWith({
            options: expect.objectContaining({
                ignoreRegions: [
                    { x: 0, y: 0, width: 100, height: 100 },
                    { x: 0, y: 0, width: 50, height: 50 }
                ]
            }),
            testContext: expect.any(Object),
            isViewPortScreenshot: true,
            isNativeContext: true,
        })
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

        await checkAppScreen(options)

        expect(determineDeviceBlockOutsSpy).toHaveBeenCalledWith({
            isAndroid: true,
            screenCompareOptions: expect.any(Object),
            instanceData: expect.objectContaining({
                isAndroid: true,
                platformName: 'Android'
            })
        })

        expect(executeImageCompareSpy).toHaveBeenCalledWith({
            options: expect.objectContaining({
                isAndroid: true,
                isAndroidNativeWebScreenshot: false
            }),
            testContext: expect.any(Object),
            isViewPortScreenshot: true,
            isNativeContext: true,
        })
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
                    ignoreAlpha: false,
                    ignoreAntialiasing: false,
                    ignoreColors: false,
                }
            }
        }

        await checkAppScreen(options)

        expect(executeImageCompareSpy).toHaveBeenCalledWith({
            options: expect.objectContaining({
                compareOptions: {
                    wic: expect.objectContaining({
                        ignoreAlpha: true,
                        ignoreAntialiasing: true,
                        ignoreColors: true,
                    }),
                    method: expect.objectContaining({
                        ignoreAlpha: false,
                        ignoreAntialiasing: false,
                        ignoreColors: false,
                    })
                }
            }),
            testContext: expect.any(Object),
            isViewPortScreenshot: true,
            isNativeContext: true,
        })
    })

    it('should spread hideElements and removeElements into ignore array', async () => {
        const mockElement1 = { elementId: 'hide-element', selector: '#hide' } as any
        const mockElement2 = { elementId: 'remove-element', selector: '#remove' } as any
        const mockElement3 = { elementId: 'ignore-element', selector: '#ignore' } as any

        const options = {
            ...baseOptions,
            checkScreenOptions: {
                ...baseOptions.checkScreenOptions,
                method: {
                    ...baseOptions.checkScreenOptions.method,
                    hideElements: [mockElement1],
                    removeElements: [mockElement2],
                    ignore: [mockElement3]
                }
            }
        }

        await checkAppScreen(options)

        expect(determineIgnoreRegionsSpy).toHaveBeenCalledWith(
            options.browserInstance,
            [mockElement3, mockElement1, mockElement2]
        )

        expect(executeImageCompareSpy).toHaveBeenCalledWith({
            options: expect.objectContaining({
                ignoreRegions: [
                    { x: 0, y: 0, width: 100, height: 100 },
                    { x: 0, y: 0, width: 50, height: 50 }
                ]
            }),
            testContext: expect.any(Object),
            isViewPortScreenshot: true,
            isNativeContext: true,
        })
    })

    it('should create screenCompareOptions with correct structure', async () => {
        const mockElement1 = { elementId: 'hide-element', selector: '#hide' } as any
        const mockElement2 = { elementId: 'remove-element', selector: '#remove' } as any
        const mockElement3 = { elementId: 'ignore-element', selector: '#ignore' } as any

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
                    hideElements: [mockElement1],
                    removeElements: [mockElement2],
                    ignore: [mockElement3],
                    ignoreAlpha: false,
                    ignoreAntialiasing: false,
                    ignoreColors: false,
                }
            }
        }

        await checkAppScreen(options)

        expect(determineIgnoreRegionsSpy).toHaveBeenCalledWith(
            options.browserInstance,
            [mockElement3, mockElement1, mockElement2]
        )

        expect(determineDeviceBlockOutsSpy).toHaveBeenCalledWith({
            isAndroid: false,
            screenCompareOptions: expect.objectContaining({
                hideElements: [mockElement1],
                removeElements: [mockElement2],
                ignore: [mockElement3, mockElement1, mockElement2],
                ignoreAlpha: false,
                ignoreAntialiasing: false,
                ignoreColors: false,
            }),
            instanceData: options.instanceData
        })
    })

    it('should spread wic.compareOptions and method options into screenCompareOptions', async () => {
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
                        blockOutSideBar: true,
                        blockOutStatusBar: true,
                        blockOutToolBar: true,
                        createJsonReportFiles: true,
                        diffPixelBoundingBoxProximity: 10,
                        ignoreLess: true,
                        ignoreNothing: true,
                        rawMisMatchPercentage: true,
                        returnAllCompareData: true,
                        saveAboveTolerance: 1,
                        scaleImagesToSameSize: true,
                    }
                },
                method: {
                    ignoreAlpha: false,
                    ignoreAntialiasing: false,
                    ignoreColors: false,
                    blockOutSideBar: false,
                    blockOutStatusBar: false,
                    blockOutToolBar: false,
                    createJsonReportFiles: false,
                    diffPixelBoundingBoxProximity: 5,
                    ignoreLess: false,
                    ignoreNothing: false,
                    rawMisMatchPercentage: false,
                    returnAllCompareData: false,
                    saveAboveTolerance: 0,
                    scaleImagesToSameSize: false,
                }
            }
        }

        await checkAppScreen(options)

        expect(determineDeviceBlockOutsSpy).toHaveBeenCalledWith({
            isAndroid: false,
            screenCompareOptions: expect.objectContaining({
                // Method options should override wic options
                ignoreAlpha: false,
                ignoreAntialiasing: false,
                ignoreColors: false,
                blockOutSideBar: false,
                blockOutStatusBar: false,
                blockOutToolBar: false,
                createJsonReportFiles: false,
                diffPixelBoundingBoxProximity: 5,
                ignoreLess: false,
                ignoreNothing: false,
                rawMisMatchPercentage: false,
                returnAllCompareData: false,
                saveAboveTolerance: 0,
                scaleImagesToSameSize: false,
            }),
            instanceData: options.instanceData
        })
    })
})
