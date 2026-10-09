import { join } from 'node:path'
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'
import logger from '@wdio/logger'
import {
    activateHiddenBrowsingContext,
    getBrowserObject,
    getDevicePixelRatio, getFolders,
    getInstanceData,
    getBase64ScreenshotSize,
    getNativeContext,
    enrichTestContext,
    getLtOptions,
    isMultiRemoteBrowser,
    isMultiRemoteElement,
    warnIfBiDiScriptsFailOnAndroid,
} from '../src/utils.js'

vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))
const log = logger('test')

// Import the functions we need to spy on
import * as imageComparisonCore from '@wdio/image-comparison-core'

// WebdriverIO brands its objects with their kind, see `isWdioKind()` in `src/utils.ts`
const WDIO_KIND = Symbol.for('wdio.kind')

const DEVICE_RECTANGLES = {
    bottomBar: { y: 0, x: 0, width: 0, height: 0 },
    homeBar: { y: 0, x: 0, width: 0, height: 0 },
    leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
    rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
    screenSize: { height: 0, width: 0 },
    statusBar: { y: 0, x: 0, width: 0, height: 0 },
    statusBarAndAddressBar: { y: 0, x: 0, width: 0, height: 0 },
    viewport: { y: 0, x: 0, width: 0, height: 0 },
}

describe('utils', () => {
    describe('getFolders', () => {
        it('should be able to return the correct folders when no method options are provided', () => {
            const methodOptions = {}
            const folders = {
                baselineFolder: 'folderBase',
                diffFolder: 'folderDiff',
                actualFolder: 'folderActual',
            }
            const currentTestPath = '/current/test/path/'
            expect(getFolders(methodOptions, folders, currentTestPath)).toMatchSnapshot()
        })

        it('should be able to return the correct folders when method options are provided', () => {
            const methodOptions = {
                baselineFolder: 'methodBase',
                diffFolder: 'methodDiff',
                actualFolder: 'methodActual',
            }
            const folders = {
                baselineFolder: 'folderBase',
                diffFolder: 'folderDiff',
                actualFolder: 'folderActual',
            }
            const currentTestPath = '/current/test/path/'
            expect(getFolders(methodOptions, folders, currentTestPath)).toMatchSnapshot()
        })
    })

    describe('getBase64ScreenshotSize', () => {
        // Transparent image of 20x40 pixels
        const mockScreenshot = 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAoCAIAAABxU02MAAAAJElEQVR4nO3LMQEAAAgDILV/59nBV/jpJHU15ynLsizLsvw+L/3pA02VPl1RAAAAAElFTkSuQmCC'
        const width = 20
        const height = 40

        it('should correctly calculate size with default device pixel ratio', () => {
            const size = getBase64ScreenshotSize(mockScreenshot)
            expect(size.width).toEqual(width)
            expect(size.height).toEqual(height)
        })

        it('should correctly calculate size with different device pixel ratios', () => {
            const dpr = 2
            const size = getBase64ScreenshotSize(mockScreenshot, dpr)
            expect(size.width).toEqual(width/dpr)
            expect(size.height).toEqual(height/dpr)
        })
    })

    describe('getDevicePixelRatio', () => {
        it('should correctly calculate device pixel ratio when width and height ratios are the same', () => {
            const mockScreenshot = 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAoCAIAAABxU02MAAAAJElEQVR4nO3LMQEAAAgDILV/59nBV/jpJHU15ynLsizLsvw+L/3pA02VPl1RAAAAAElFTkSuQmCC'
            const deviceScreenSize = { width: 20, height: 40 }
            expect(getDevicePixelRatio(mockScreenshot, deviceScreenSize)).toBe(1)
        })

        it('should correctly calculate device pixel ratio when width and height ratios are bigger', () => {
            const mockScreenshot = 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAoCAIAAABxU02MAAAAJElEQVR4nO3LMQEAAAgDILV/59nBV/jpJHU15ynLsizLsvw+L/3pA02VPl1RAAAAAElFTkSuQmCC'
            const deviceScreenSize = { width: 2, height: 4 }
            expect(getDevicePixelRatio(mockScreenshot, deviceScreenSize)).toBe(10)
        })

        it('should correctly calculate device pixel ratio when width and height ratios are the same for a landscape image', () => {
            const mockScreenshot = 'iVBORw0KGgoAAAANSUhEUgAAACgAAAAUCAIAAABwJOjsAAAAJUlEQVR4nO3NMQEAAAgDILV/5xljDxRgk0zDVVaxWCwWi8XiigcB'
            const deviceScreenSize = { width: 20, height: 40 }

            expect(getDevicePixelRatio(mockScreenshot, deviceScreenSize)).toBe(1)
        })
    })

    describe('getLtOptions', () => {
        it('should return the lt:options when it exists (correct casing)', () => {
            const caps = {
                'lt:options': { user: 'wim', project: 'testProject' }
            }

            expect(getLtOptions(caps)).toMatchSnapshot()
        })

        it('should return the lt:options when it exists (different casing)', () => {
            const caps = {
                'LT:OPTIONS': { user: 'upperCase', project: 'testUpper' }
            }

            // @ts-expect-error
            expect(getLtOptions(caps)).toMatchSnapshot()
        })

        it('should return undefined when lt:options does not exist', () => {
            const caps = {
                platformName: 'iOS',
                deviceName: 'iPhone 14'
            }

            expect(getLtOptions(caps)).toBeUndefined()
        })

        it('should return undefined when capabilities is an empty object', () => {
            expect(getLtOptions({})).toBeUndefined()
        })

        it('should handle unexpected types gracefully', () => {
            const caps = Object.create(null)
            expect(getLtOptions(caps)).toBeUndefined()
        })
    })

    describe('getInstanceData', () => {
        const DEFAULT_DESKTOP_BROWSER = {
            capabilities:{
                browserName: 'chrome',
                browserVersion: '75.123',
                platformName: 'osx',
            },
            isAndroid: false,
            isIOS: false,
            isMobile: false,
            requestedCapabilities: {
                browserName: 'chrome',
                browserVersion: '75.123',
                platformName: 'osx',
            },
            execute: vi.fn().mockResolvedValue(1),
        } as any as WebdriverIO.Browser
        const createDriverMock = (customProps: Partial<WebdriverIO.Browser>) => {
            return ({ ...DEFAULT_DESKTOP_BROWSER, ...customProps }) as WebdriverIO.Browser
        }

        beforeEach(() => {
            vi.clearAllMocks()
            // Set up spies for the imported functions that return dynamic values based on the browser
            vi.spyOn(imageComparisonCore, 'getMobileScreenSize').mockImplementation(async ({ browserInstance }) => {
                // Return screen size based on what the mocked browser.execute returns
                if (browserInstance.isAndroid) {
                    const result = await browserInstance.execute('mobile: deviceInfo') as any
                    if (result?.realDisplaySize) {
                        const [width, height] = result.realDisplaySize.split('x').map(Number)
                        return { height, width }
                    }
                }
                if (browserInstance.isIOS) {
                    const result = await browserInstance.execute('mobile: deviceScreenInfo') as any
                    if (result?.screenSize) {
                        let { height, width } = result.screenSize

                        // Check orientation and swap if needed for landscape
                        const orientation = await browserInstance.getOrientation()
                        const isLandscapeByOrientation = orientation === 'LANDSCAPE'
                        const isLandscapeByValue = width > height

                        if (isLandscapeByOrientation !== isLandscapeByValue) {
                            [height, width] = [width, height]
                        }

                        return { height, width }
                    }
                }
                // Fallback
                return { height: 800, width: 400 }
            })

            vi.spyOn(imageComparisonCore, 'getMobileViewPortPosition').mockImplementation(({ initialDeviceRectangles }) => Promise.resolve(initialDeviceRectangles))
        })

        afterEach(() => {
            vi.restoreAllMocks()
        })

        it('should return instance data when the minimum of capabilities is provided', async() => {
            const driver = createDriverMock({})
            expect(await getInstanceData({ browserInstance: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:false })).toMatchSnapshot()
        })

        it('should return instance data when wdio-ics option log name is provided', async() => {
            const driver = createDriverMock({
                requestedCapabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.requestedCapabilities,
                    'wdio-ics:options': {
                        // @ts-ignore
                        logName: 'wdio-ics-logName',
                    },
                },
                execute: vi.fn().mockResolvedValue(1),
            })
            expect(await getInstanceData({ browserInstance: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:false })).toMatchSnapshot()
        })

        it('should return instance data when wdio-ics option name is provided', async() => {
            const driver = createDriverMock({
                requestedCapabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.requestedCapabilities,
                    'wdio-ics:options': {
                        // @ts-ignore
                        name: 'wdio-ics-name',
                    },
                },
                execute: vi.fn().mockResolvedValue(1),
            })
            expect(await getInstanceData({ browserInstance: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:false })).toMatchSnapshot()
        })

        it('should return instance data for an Android mobile app', async() => {
            // @ts-ignore
            const driver = createDriverMock({
                capabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.capabilities,
                    browserName: '',
                    browserVersion: '',
                    platformName: 'android',
                    // @ts-ignore
                    deviceName: 'Android Emulator',
                    platformVersion: '14.0',
                    app: '/Users/WebdriverIO/visual-testing/apps/android.apk',
                    pixelRatio: 3.5,
                    statBarHeight: 144,
                } as WebdriverIO.Capabilities,
                requestedCapabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.requestedCapabilities,
                    browserName: '',
                    browserVersion: '',
                    platformName: 'android',
                    'appium:deviceName': 'Android Emulator',
                    'appium:platformVersion': '14.0',
                    'appium:app': '/Users/WebdriverIO/visual-testing/apps/android.apk',
                } as WebdriverIO.Capabilities,
                isAndroid: true,
                isMobile: true,
                getWindowSize: vi.fn().mockResolvedValueOnce({ width: 100, height: 200 }),
                execute: vi.fn().mockResolvedValueOnce({ realDisplaySize:'100x200' }),
                getOrientation: vi.fn().mockResolvedValue('PORTRAIT')
            })
            expect(await getInstanceData({ browserInstance: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:true })).toMatchSnapshot()
        })

        it('should return instance data for an iOS iPhone mobile app', async() => {
            const mockScreenshot = 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAoCAIAAABxU02MAAAAJElEQVR4nO3LMQEAAAgDILV/59nBV/jpJHU15ynLsizLsvw+L/3pA02VPl1RAAAAAElFTkSuQmCC'
            // @ts-ignore
            const driver =  createDriverMock( {
                ...DEFAULT_DESKTOP_BROWSER,
                capabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.capabilities,
                    browserName: '',
                    browserVersion: '',
                    // @ts-ignore
                    deviceName: 'iPhone 15 Pro',
                    platformName: 'iOS',
                    platformVersion: '17.0',
                    app: '/Users/WebdriverIO/visual-testing/apps/ios.zip',
                } as WebdriverIO.Capabilities,
                requestedCapabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.requestedCapabilities,
                    ...{
                        browserName: '',
                        browserVersion: '',
                        'appium:deviceName': 'iPhone 15 Pro',
                        platformName: 'iOS',
                        'appium:platformVersion': '17.0',
                        'appium:app': '/Users/WebdriverIO/visual-testing/apps/ios.zip',
                    },
                } as WebdriverIO.Capabilities,
                isIOS: true,
                isAndroid: false,
                isMobile: true,
                takeScreenshot: vi.fn().mockResolvedValueOnce(mockScreenshot),
                execute: vi.fn().mockResolvedValueOnce({ screenSize: { height: 852, width: 393 } }),
                getWindowSize: vi.fn(),
                getOrientation: vi.fn().mockResolvedValue('PORTRAIT')
            })
            expect(await getInstanceData({ browserInstance: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:true })).toMatchSnapshot()
        })

        it('should return instance data for an iOS iPad mobile app', async() => {
            const mockScreenshot = 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAoCAIAAABxU02MAAAAJElEQVR4nO3LMQEAAAgDILV/59nBV/jpJHU15ynLsizLsvw+L/3pA02VPl1RAAAAAElFTkSuQmCC'
            // @ts-ignore
            const driver =  createDriverMock( {
                capabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.capabilities,
                    browserName: '',
                    browserVersion: '',
                    // @ts-ignore
                    deviceName: 'iPad',
                    platformName: 'iOS',
                    platformVersion: '17.0',
                    app: '/Users/WebdriverIO/visual-testing/apps/ios.zip',

                } as WebdriverIO.Capabilities,
                requestedCapabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.requestedCapabilities,
                    browserName: '',
                    browserVersion: '',
                    'appium:deviceName': 'iPad',
                    platformName: 'iOS',
                    'appium:platformVersion': '17.0',
                    'appium:app': '/Users/WebdriverIO/visual-testing/apps/ios.zip',

                } as WebdriverIO.Capabilities,
                isIOS: true,
                isAndroid: false,
                isMobile: true,
                takeScreenshot: vi.fn().mockResolvedValueOnce(mockScreenshot),
                execute: vi.fn().mockResolvedValueOnce({ screenSize: { height: 1194, width: 834 } }),
                getWindowSize: vi.fn(),
                getOrientation: vi.fn().mockResolvedValue('PORTRAIT')
            })
            expect(await getInstanceData({ browserInstance: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:true })).toMatchSnapshot()
        })

        it('should return instance data for an iOS iPad mobile app in landscape mode', async() => {
            const mockScreenshot = 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAoCAIAAABxU02MAAAAJElEQVR4nO3LMQEAAAgDILV/59nBV/jpJHU15ynLsizLsvw+L/3pA02VPl1RAAAAAElFTkSuQmCC'
            // @ts-ignore
            const driver =  createDriverMock( {
                capabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.capabilities,
                    browserName: '',
                    browserVersion: '',
                    // @ts-ignore
                    deviceName: 'iPad',
                    platformName: 'iOS',
                    platformVersion: '17.0',
                    app: '/Users/WebdriverIO/visual-testing/apps/ios.zip',

                } as WebdriverIO.Capabilities,
                requestedCapabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.requestedCapabilities,

                    browserName: '',
                    browserVersion: '',
                    'appium:deviceName': 'iPad',
                    platformName: 'iOS',
                    'appium:platformVersion': '17.0',
                    'appium:app': '/Users/WebdriverIO/visual-testing/apps/ios.zip',

                } as WebdriverIO.Capabilities,
                isIOS: true,
                isAndroid: false,
                isMobile: true,
                takeScreenshot: vi.fn().mockResolvedValueOnce(mockScreenshot),
                execute: vi.fn().mockResolvedValueOnce({ screenSize: { height: 1194, width: 834 } }),
                getWindowSize: vi.fn(),
                getOrientation: vi.fn().mockResolvedValue('LANDSCAPE')
            })
            expect(await getInstanceData({ browserInstance: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:true })).toMatchSnapshot()
        })

        it('should return instance data for an iOS iPad mobile app for a non matching screensize', async() => {
            const mockScreenshot = 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAoCAIAAABxU02MAAAAJElEQVR4nO3LMQEAAAgDILV/59nBV/jpJHU15ynLsizLsvw+L/3pA02VPl1RAAAAAElFTkSuQmCC'
            // @ts-ignore
            const driver =  createDriverMock({
                capabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.capabilities,
                    browserName: '',
                    browserVersion: '',
                    // @ts-ignore
                    deviceName: 'iPad',
                    platformName: 'iOS',
                    platformVersion: '17.0',
                    app: '/Users/WebdriverIO/visual-testing/apps/ios.zip',

                } as WebdriverIO.Capabilities,
                requestedCapabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.requestedCapabilities,
                    browserName: '',
                    browserVersion: '',
                    'appium:deviceName': 'iPad',
                    platformName: 'iOS',
                    'appium:platformVersion': '17.0',
                    'appium:app': '/Users/WebdriverIO/visual-testing/apps/ios.zip',
                } as WebdriverIO.Capabilities,
                isIOS: true,
                isAndroid: false,
                isMobile: true,
                takeScreenshot: vi.fn().mockResolvedValueOnce(mockScreenshot),
                execute: vi.fn().mockResolvedValueOnce({ screenSize: { height: 1234, width: 888 } }),
                getWindowSize: vi.fn(),
                getOrientation: vi.fn().mockResolvedValue('LANDSCAPE')
            })
            expect(await getInstanceData({ browserInstance: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:true })).toMatchSnapshot()
        })

        it('should return instance data for a mobile app with incomplete capability data', async() => {
            // @ts-ignore
            const driver =  createDriverMock({
                capabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.capabilities,
                    browserName: '',
                    browserVersion: '',
                    platformName: '',
                    // @ts-ignore
                    deviceName: '',
                    platformVersion: '',
                    app: '/',
                    pixelRatio: 3.5,
                    statBarHeight: 144,
                } as WebdriverIO.Capabilities,
                requestedCapabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.requestedCapabilities,
                    browserName: '',
                    browserVersion: '',
                    platformName: '',
                    'appium:deviceName': '',
                    'appium:platformVersion': '',
                    'appium:app': '/',
                } as WebdriverIO.Capabilities,
                isAndroid: true,
                isMobile: true,
                execute: vi.fn().mockResolvedValueOnce({ realDisplaySize:'100x200' }),
                getWindowSize: vi.fn(),
                getOrientation: vi.fn().mockResolvedValue('PORTRAIT')
            })
            expect(await getInstanceData({ browserInstance: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:true })).toMatchSnapshot()
        })

        it('should return instance data when the browserstack capabilities are provided', async() => {
            const driver = createDriverMock({
                capabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.capabilities,
                    // @ts-ignore
                    pixelRatio: 3.5,
                    statBarHeight: 50,
                },
                requestedCapabilities:{
                    ...DEFAULT_DESKTOP_BROWSER.requestedCapabilities,
                    'bstack:options': {
                        deviceName: 'Samsung Galaxy S22',
                        osVersion: '12.0'
                    },
                },
                isAndroid: true,
                isMobile: true,
                execute: vi.fn().mockResolvedValueOnce({ realDisplaySize: '100x200' }),
                getWindowSize: vi.fn(),
                getOrientation: vi.fn().mockResolvedValue('PORTRAIT')
            })
            expect(await getInstanceData({ browserInstance: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:true })).toMatchSnapshot()
        })

        it('should return instance data when the lambdatest capabilities are provided', async() => {
            const driver = createDriverMock({
                capabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.capabilities,
                    // @ts-ignore
                    deviceName: 'Samsung Galaxy S22 LT',
                    platformVersion: '11',
                    pixelRatio: 3.5,
                    statBarHeight: 50,
                },
                requestedCapabilities:{
                    ...DEFAULT_DESKTOP_BROWSER.requestedCapabilities,
                    'lt:options': {
                        deviceName: 'Samsung Galaxy S22 LT',
                        platformVersion: '11',
                    },
                },
                isAndroid: true,
                isMobile: true,
                execute: vi.fn().mockResolvedValueOnce({ realDisplaySize: '100x200' }),
                getWindowSize: vi.fn(),
                getOrientation: vi.fn().mockResolvedValue('PORTRAIT')
            })
            expect(await getInstanceData({ browserInstance: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:true })).toMatchSnapshot()
        })

        it('should return the deviceName from appium:options when using the nested capability format', async() => {
            // @ts-ignore
            const driver = createDriverMock({
                capabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.capabilities,
                    browserName: '',
                    browserVersion: '',
                    platformName: 'android',
                    // @ts-ignore
                    deviceName: 'emulator-5554',
                    platformVersion: '14.0',
                    app: '/Users/WebdriverIO/visual-testing/apps/android.apk',
                    pixelRatio: 3.5,
                    statBarHeight: 144,
                } as WebdriverIO.Capabilities,
                requestedCapabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.requestedCapabilities,
                    browserName: '',
                    browserVersion: '',
                    platformName: 'android',
                    'appium:options': {
                        automationName: 'UiAutomator2',
                        deviceName: 'Pixel_6_API_34',
                        platformVersion: '14.0',
                        app: '/Users/WebdriverIO/visual-testing/apps/android.apk',
                    },
                } as WebdriverIO.Capabilities,
                isAndroid: true,
                isMobile: true,
                getWindowSize: vi.fn().mockResolvedValueOnce({ width: 100, height: 200 }),
                execute: vi.fn().mockResolvedValueOnce({ realDisplaySize: '100x200' }),
                getOrientation: vi.fn().mockResolvedValue('PORTRAIT')
            })
            const result = await getInstanceData({ browserInstance: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext: true })
            expect(result.deviceName).toBe('pixel_6_api_34')
        })

        it('should fall back to appium:avd when appium:deviceName is not provided for Android', async() => {
            // @ts-ignore
            const driver = createDriverMock({
                capabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.capabilities,
                    browserName: '',
                    browserVersion: '',
                    platformName: 'android',
                    // @ts-ignore
                    deviceName: 'emulator-5554',
                    platformVersion: '14.0',
                    app: '/Users/WebdriverIO/visual-testing/apps/android.apk',
                    pixelRatio: 3.5,
                    statBarHeight: 144,
                } as WebdriverIO.Capabilities,
                requestedCapabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.requestedCapabilities,
                    browserName: '',
                    browserVersion: '',
                    platformName: 'android',
                    'appium:avd': 'Pixel_6_API_34',
                    'appium:platformVersion': '14.0',
                    'appium:app': '/Users/WebdriverIO/visual-testing/apps/android.apk',
                } as WebdriverIO.Capabilities,
                isAndroid: true,
                isMobile: true,
                getWindowSize: vi.fn().mockResolvedValueOnce({ width: 100, height: 200 }),
                execute: vi.fn().mockResolvedValueOnce({ realDisplaySize: '100x200' }),
                getOrientation: vi.fn().mockResolvedValue('PORTRAIT')
            })
            const result = await getInstanceData({ browserInstance: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext: true })
            expect(result.deviceName).toBe('pixel_6_api_34')
        })

        it('should fall back to avd in appium:options when deviceName is not provided for Android', async() => {
            // @ts-ignore
            const driver = createDriverMock({
                capabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.capabilities,
                    browserName: '',
                    browserVersion: '',
                    platformName: 'android',
                    // @ts-ignore
                    deviceName: 'emulator-5554',
                    platformVersion: '14.0',
                    app: '/Users/WebdriverIO/visual-testing/apps/android.apk',
                    pixelRatio: 3.5,
                    statBarHeight: 144,
                } as WebdriverIO.Capabilities,
                requestedCapabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.requestedCapabilities,
                    browserName: '',
                    browserVersion: '',
                    platformName: 'android',
                    'appium:options': {
                        automationName: 'UiAutomator2',
                        avd: 'Pixel_6_API_34',
                        platformVersion: '14.0',
                        app: '/Users/WebdriverIO/visual-testing/apps/android.apk',
                    },
                } as WebdriverIO.Capabilities,
                isAndroid: true,
                isMobile: true,
                getWindowSize: vi.fn().mockResolvedValueOnce({ width: 100, height: 200 }),
                execute: vi.fn().mockResolvedValueOnce({ realDisplaySize: '100x200' }),
                getOrientation: vi.fn().mockResolvedValue('PORTRAIT')
            })
            const result = await getInstanceData({ browserInstance: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext: true })
            expect(result.deviceName).toBe('pixel_6_api_34')
        })

        it('should prefer deviceName over avd when both are in appium:options', async() => {
            // @ts-ignore
            const driver = createDriverMock({
                capabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.capabilities,
                    browserName: '',
                    browserVersion: '',
                    platformName: 'android',
                    // @ts-ignore
                    deviceName: 'emulator-5554',
                    platformVersion: '14.0',
                    app: '/Users/WebdriverIO/visual-testing/apps/android.apk',
                    pixelRatio: 3.5,
                    statBarHeight: 144,
                } as WebdriverIO.Capabilities,
                requestedCapabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.requestedCapabilities,
                    browserName: '',
                    browserVersion: '',
                    platformName: 'android',
                    'appium:options': {
                        automationName: 'UiAutomator2',
                        deviceName: 'Pixel_6_API_34',
                        avd: 'Some_Other_AVD_Name',
                        platformVersion: '14.0',
                        app: '/Users/WebdriverIO/visual-testing/apps/android.apk',
                    },
                } as WebdriverIO.Capabilities,
                isAndroid: true,
                isMobile: true,
                getWindowSize: vi.fn().mockResolvedValueOnce({ width: 100, height: 200 }),
                execute: vi.fn().mockResolvedValueOnce({ realDisplaySize: '100x200' }),
                getOrientation: vi.fn().mockResolvedValue('PORTRAIT')
            })
            const result = await getInstanceData({ browserInstance: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext: true })
            expect(result.deviceName).toBe('pixel_6_api_34')
        })

        it('should read nativeWebScreenshot from appium:options', async() => {
            // @ts-ignore
            const driver = createDriverMock({
                capabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.capabilities,
                    browserName: '',
                    browserVersion: '',
                    platformName: 'android',
                    // @ts-ignore
                    deviceName: 'emulator-5554',
                    platformVersion: '14.0',
                    app: '/Users/WebdriverIO/visual-testing/apps/android.apk',
                    pixelRatio: 3.5,
                    statBarHeight: 144,
                } as WebdriverIO.Capabilities,
                requestedCapabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.requestedCapabilities,
                    browserName: '',
                    browserVersion: '',
                    platformName: 'android',
                    'appium:options': {
                        automationName: 'UiAutomator2',
                        deviceName: 'Pixel_6_API_34',
                        platformVersion: '14.0',
                        app: '/Users/WebdriverIO/visual-testing/apps/android.apk',
                        nativeWebScreenshot: true,
                    },
                } as WebdriverIO.Capabilities,
                isAndroid: true,
                isMobile: true,
                getWindowSize: vi.fn().mockResolvedValueOnce({ width: 100, height: 200 }),
                execute: vi.fn().mockResolvedValueOnce({ realDisplaySize: '100x200' }),
                getOrientation: vi.fn().mockResolvedValue('PORTRAIT')
            })
            const result = await getInstanceData({ browserInstance: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext: true })
            expect(result.nativeWebScreenshot).toBe(true)
        })
    })

    describe('getBrowserObject', () => {
        const browserMock = { [WDIO_KIND]: 'browser', isMultiRemote: false, sessionId: 'mock-session-id' }
        const createElementMock = (parent: object) => ({ [WDIO_KIND]: 'element', isMultiRemote: false, elementId: 'mock-element-id', parent })

        it('should return the browser object when passed a browser object', () => {
            expect(getBrowserObject(browserMock)).toBe(browserMock)
        })

        it('should return the browser object when passed an element with the browser as its parent', () => {
            expect(getBrowserObject(createElementMock(browserMock))).toBe(browserMock)
        })

        it('should return the browser object for a nested element structure', () => {
            const childElement = createElementMock(createElementMock(browserMock))
            expect(getBrowserObject(childElement)).toBe(browserMock)
        })

        // WebdriverIO v10: elements found from a browsing context (`browser.url()`, `context.frame()`)
        // have the context as parent, and the context holds the browser in `browser`
        const topLevelContextMock = { [WDIO_KIND]: 'browsing-context', browser: browserMock, isFrame: false }
        const frameContextMock = { [WDIO_KIND]: 'browsing-context', browser: browserMock, isFrame: true, parent: topLevelContextMock }

        it('should return the browser object when passed a WebdriverIO v10 browsing context', () => {
            expect(getBrowserObject(topLevelContextMock)).toBe(browserMock)
        })

        it('should return the browser object for an element found from a WebdriverIO v10 browsing context', () => {
            expect(getBrowserObject(createElementMock(topLevelContextMock))).toBe(browserMock)
        })

        it('should return the browser object for an element found in a WebdriverIO v10 frame', () => {
            expect(getBrowserObject(createElementMock(frameContextMock))).toBe(browserMock)
        })

        it('should not return a multiremote browser, which is also of kind "browser"', () => {
            const multiRemoteBrowser = { [WDIO_KIND]: 'browser', isMultiRemote: true }
            expect(() => getBrowserObject(createElementMock(multiRemoteBrowser))).toThrow('Could not find the browser of this element')
        })

        it('should throw for an object that is not a WebdriverIO object', () => {
            expect(() => getBrowserObject({ parent: browserMock })).toThrow('Could not find the browser of this element')
            expect(() => getBrowserObject(undefined)).toThrow('Could not find the browser of this element')
        })
    })

    describe('isMultiRemoteBrowser', () => {
        it('should return true for a multiremote browser', () => {
            expect(isMultiRemoteBrowser({ isMultiRemote: true } as any)).toBe(true)
        })

        it('should return false for a single browser', () => {
            expect(isMultiRemoteBrowser({ isMultiRemote: false } as any)).toBe(false)
        })

        it('should return false when the flag is not set', () => {
            expect(isMultiRemoteBrowser({} as any)).toBe(false)
        })
    })

    describe('isMultiRemoteElement', () => {
        // `multiRemoteBrowser.$()` gives an element without `parent`, `getInstance()` gives the element of each instance
        const getInstance = (instanceName: string) => ({ elementId: `${instanceName}-element` })

        it('should return true for a multiremote element', () => {
            expect(isMultiRemoteElement({ [WDIO_KIND]: 'element', isMultiRemote: true, instances: ['chrome'], getInstance })).toBe(true)
        })

        it('should return false for the element of one instance', () => {
            expect(isMultiRemoteElement({ [WDIO_KIND]: 'element', isMultiRemote: false, elementId: 'chrome-element', parent: {} })).toBe(false)
        })

        it('should return false for an object without the WebdriverIO element kind', () => {
            expect(isMultiRemoteElement({ isMultiRemote: true, instances: ['chrome'], getInstance })).toBe(false)
            expect(isMultiRemoteElement({ [WDIO_KIND]: 'browser', isMultiRemote: true, instances: ['chrome'], getInstance })).toBe(false)
        })

        it('should return false for a value that is not an object', () => {
            expect(isMultiRemoteElement(undefined)).toBe(false)
            expect(isMultiRemoteElement(null)).toBe(false)
            expect(isMultiRemoteElement('element')).toBe(false)
        })
    })

    describe('activateHiddenBrowsingContext', () => {
        const createBrowser = ({ isBidi = true, isMobile = false, isHidden = true, browserName = 'chrome' } = {}) => mock<WebdriverIO.Browser>({
            isBidi,
            isMobile,
            capabilities: { browserName },
            execute: vi.fn().mockResolvedValue(isHidden),
            getWindowHandle: vi.fn().mockResolvedValue('context-a'),
            browsingContextActivate: vi.fn().mockResolvedValue({}),
        })

        it('should activate the browsing context when the page is in a background tab', async () => {
            const browser = createBrowser()

            await activateHiddenBrowsingContext(browser, false)

            expect(browser.browsingContextActivate).toHaveBeenCalledWith({ context: 'context-a' })
        })

        it('should not activate the browsing context when the page is visible', async () => {
            const browser = createBrowser({ isHidden: false })

            await activateHiddenBrowsingContext(browser, false)

            expect(browser.browsingContextActivate).not.toHaveBeenCalled()
        })

        it('should do nothing in a WebDriver Classic session, on mobile or in a native context', async () => {
            const browsers = [createBrowser({ isBidi: false }), createBrowser({ isMobile: true }), createBrowser()]

            await activateHiddenBrowsingContext(browsers[0], false)
            await activateHiddenBrowsingContext(browsers[1], false)
            await activateHiddenBrowsingContext(browsers[2], true)

            for (const browser of browsers) {
                expect(browser.execute).not.toHaveBeenCalled()
                expect(browser.browsingContextActivate).not.toHaveBeenCalled()
            }
        })

        it('should activate the browsing context in Edge and Chromium too', async () => {
            for (const browserName of ['MicrosoftEdge', 'msedge', 'chromium', 'chrome-headless-shell']) {
                const browser = createBrowser({ browserName })

                await activateHiddenBrowsingContext(browser, false)

                expect(browser.browsingContextActivate).toHaveBeenCalledWith({ context: 'context-a' })
            }
        })

        it('should do nothing in a browser that is not based on Chromium', async () => {
            const browser = createBrowser({ browserName: 'firefox' })

            await activateHiddenBrowsingContext(browser, false)

            expect(browser.execute).not.toHaveBeenCalled()
            expect(browser.browsingContextActivate).not.toHaveBeenCalled()
        })

        it('should not fail when the browser cannot activate the browsing context', async () => {
            const browser = createBrowser()
            vi.mocked(browser.browsingContextActivate).mockRejectedValue(new Error('unknown command'))

            await expect(activateHiddenBrowsingContext(browser, false)).resolves.toBeUndefined()
        })

        it('should not fail when the visibility of the page cannot be read', async () => {
            const browser = createBrowser()
            vi.mocked(browser.execute).mockRejectedValue(new Error('no such frame'))

            await expect(activateHiddenBrowsingContext(browser, false)).resolves.toBeUndefined()
            expect(browser.browsingContextActivate).not.toHaveBeenCalled()
        })
    })

    describe('getNativeContext', () => {
        it('should return false if capabilities is not an object', () => {
            expect(getNativeContext({ capabilities: null as any, isMobile: true })).toBe(false)
            expect(getNativeContext({ capabilities: undefined as any, isMobile: true })).toBe(false)
            expect(getNativeContext({ capabilities: 'not-object' as any, isMobile: true })).toBe(false)
        })

        it('should return false if isMobile is false', () => {
            expect(getNativeContext({ capabilities: {}, isMobile: false })).toBe(false)
        })

        it('should return false if browserName is present', () => {
            const capabilities = { browserName: 'chrome' }
            expect(getNativeContext({ capabilities, isMobile: true })).toBe(false)
        })

        it('should return false if autoWebview is true in various places', () => {
            const variants = [
                { autoWebview: true },
                { 'appium:autoWebview': true },
                { 'appium:options': { autoWebview: true } },
                { 'lt:options': { autoWebview: true } },
            ]

            for (const caps of variants) {
                const capabilities = { browserName: undefined, ...caps }
                expect(getNativeContext({ capabilities, isMobile: true })).toBe(false)
            }
        })

        it('should return true if browserName is falsy, autoWebview is false, and appium app caps are present in root', () => {
            const capabilities = {
                browserName: undefined,
                app: 'my.app',
            }
            expect(getNativeContext({ capabilities, isMobile: true })).toBe(true)
        })

        it('should return true if appPackage is in appium:options and autoWebview is false', () => {
            const capabilities = {
                browserName: undefined,
                'appium:options': {
                    appPackage: 'com.example',
                },
            }
            expect(getNativeContext({ capabilities, isMobile: true })).toBe(true)
        })

        it('should return true if bundleId is in lt:options and autoWebview is false', () => {
            const capabilities = {
                browserName: undefined,
                'lt:options': {
                    bundleId: 'com.example.app',
                },
            }
            expect(getNativeContext({ capabilities, isMobile: true })).toBe(true)
        })

        it('should return false if no appium-related caps are found', () => {
            const capabilities = {
                browserName: undefined,
                someOtherCap: true
            }
            expect(getNativeContext({ capabilities, isMobile: true })).toBe(false)
        })
    })

    describe('enrichTestContext', () => {
        it('should generate the expected TestContext structure with values', () => {
            const result = enrichTestContext({
                commandName: 'checkScreen',
                currentTestContext: {
                    commandName: 'checkScreen',
                    framework: 'mocha',
                    parent: 'Login tests',
                    tag: 'login-screen',
                    title: 'should show login screen',
                    instanceData: {
                        browser: {
                            name: 'chrome',
                            version: '114',
                        },
                        deviceName: 'Pixel_5',
                        platform: {
                            name: 'android',
                            version: '13.0',
                        },
                        app: 'myApp.apk',
                        isMobile: true,
                        isAndroid: true,
                        isIOS: false,
                    }
                },
                instanceData: {
                    appName: 'myApp.apk',
                    browserName: 'chrome',
                    browserVersion: '114',
                    deviceName: 'Pixel_5',
                    isMobile: true,
                    isAndroid: true,
                    isIOS: false,
                    platformName: 'android',
                    platformVersion: '13.0',
                    devicePixelRatio: 3.5,
                    deviceRectangles: {
                        bottomBar: { y: 0, x: 0, width: 0, height: 0 },
                        homeBar: { y: 0, x: 0, width: 0, height: 0 },
                        leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                        rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                        statusBar: { y: 0, x: 0, width: 0, height: 0 },
                        statusBarAndAddressBar: { y: 0, x: 0, width: 0, height: 0 },
                        screenSize: { width: 0, height: 0 },
                        viewport: { y: 0, x: 0, width: 0, height: 0 },
                    },
                    initialDevicePixelRatio: 3.5,
                    logName: 'Pixel_5_Chrome',
                    name: 'Pixel_5',
                    nativeWebScreenshot: false,
                },
                tag: 'login-screen'
            })

            expect(result).toMatchSnapshot()
        })
    })
})

describe('warnIfBiDiScriptsFailOnAndroid (#1232)', () => {
    const createBrowser = ({ isAndroid = true, isBidi = true, browserName = 'chrome', execute = vi.fn().mockResolvedValue(true) } = {}) => mock<WebdriverIO.Browser>({
        isAndroid,
        isBidi,
        capabilities: { browserName },
        execute,
    })

    afterEach(() => {
        vi.mocked(log.warn).mockClear()
    })

    it('should warn with the workaround when the driver does not run scripts', async () => {
        const bidiError = new Error('WebDriver Bidi command "script.callFunction" failed with error: unknown command')
        const browser = createBrowser({ execute: vi.fn().mockRejectedValue(bidiError) })

        await warnIfBiDiScriptsFailOnAndroid(browser)

        expect(log.warn).toHaveBeenCalledTimes(1)
        expect(log.warn).toHaveBeenCalledWith(expect.stringContaining("'wdio:enforceWebDriverClassic': true"))
        expect(log.warn).toHaveBeenCalledWith(expect.stringContaining(bidiError.message))
    })

    it('should not warn when the driver runs scripts', async () => {
        const browser = createBrowser()

        await warnIfBiDiScriptsFailOnAndroid(browser)

        expect(browser.execute).toHaveBeenCalledTimes(1)
        expect(log.warn).not.toHaveBeenCalled()
    })

    it.each([
        ['a WebDriver Classic session', { isBidi: false }],
        ['another platform', { isAndroid: false }],
        ['a native app session', { browserName: '' }],
    ])('should not test a script in %s', async (_name, overrides) => {
        const browser = createBrowser(overrides)

        await warnIfBiDiScriptsFailOnAndroid(browser)

        expect(browser.execute).not.toHaveBeenCalled()
        expect(log.warn).not.toHaveBeenCalled()
    })
})

