import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import checkAppElement from './checkAppElement.js'
import type { InternalCheckElementMethodOptions } from './check.interfaces.js'
import type { WicElement } from './element.interfaces.js'

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

vi.mock('./saveAppElement.js', () => ({
    default: vi.fn().mockResolvedValue({
        devicePixelRatio: 2,
        fileName: 'test-element.png'
    })
}))

describe('checkAppElement', () => {
    let executeImageCompareSpy: ReturnType<typeof vi.fn>
    let saveAppElementSpy: ReturnType<typeof vi.fn>

    const baseOptions: InternalCheckElementMethodOptions = {
        checkElementOptions: {
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
            method: {}
        },
        browserInstance: { isAndroid: false } as any,
        element: { selector: '#test-element' } as WicElement,
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
        tag: 'test-element',
        testContext: {
            commandName: 'checkElement',
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
        const saveAppElement = (await import('./saveAppElement.js')).default

        executeImageCompareSpy = vi.mocked(executeImageCompare)
        saveAppElementSpy = vi.mocked(saveAppElement)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should execute checkAppElement with basic options', async () => {
        const result = await checkAppElement(baseOptions)

        expect(result).toMatchSnapshot()
        expect(saveAppElementSpy).toHaveBeenCalledWith({
            browserInstance: baseOptions.browserInstance,
            element: baseOptions.element,
            folders: baseOptions.folders,
            instanceData: baseOptions.instanceData,
            isNativeContext: true,
            saveElementOptions: baseOptions.checkElementOptions,
            tag: 'test-element',
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

        await checkAppElement(options)

        expect(executeImageCompareSpy).toHaveBeenCalledWith({
            options: expect.objectContaining({ isAndroid: true }),
            testContext: expect.any(Object),
            isViewPortScreenshot: false,
            isNativeContext: true,
        })
    })

    it('should always disable block out options for element screenshots', async () => {
        const options = {
            ...baseOptions,
            checkElementOptions: {
                ...baseOptions.checkElementOptions,
                wic: {
                    ...baseOptions.checkElementOptions.wic,
                    compareOptions: {
                        ...baseOptions.checkElementOptions.wic.compareOptions,
                        blockOutSideBar: true,
                        blockOutStatusBar: true,
                        blockOutToolBar: true,
                    }
                }
            }
        }

        await checkAppElement(options)

        expect(executeImageCompareSpy).toHaveBeenCalledWith({
            options: expect.objectContaining({
                compareOptions: {
                    wic: expect.objectContaining({
                        blockOutSideBar: false,
                        blockOutStatusBar: false,
                        blockOutToolBar: false,
                    }),
                    method: expect.any(Object),
                },
            }),
            testContext: expect.any(Object),
            isViewPortScreenshot: false,
            isNativeContext: true,
        })
    })
})
