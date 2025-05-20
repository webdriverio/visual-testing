import { describe, it, expect, afterEach, vi } from 'vitest'
import {
    getBrowserObject,
    getDevicePixelRatio, getFolders,
    getInstanceData,
    getBase64ScreenshotSize,
    getNativeContext,
    enrichTestContext,
    getLtOptions,
} from '../src/utils.js'

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

        afterEach(() => {
            vi.restoreAllMocks()
        })

        it('should return instance data when the minimum of capabilities is provided', async() => {
            const driver = createDriverMock({})
            expect(await getInstanceData({ currentBrowser: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:false })).toMatchSnapshot()
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
            expect(await getInstanceData({ currentBrowser: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:false })).toMatchSnapshot()
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
            expect(await getInstanceData({ currentBrowser: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:false })).toMatchSnapshot()
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
            expect(await getInstanceData({ currentBrowser: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:true })).toMatchSnapshot()
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
            expect(await getInstanceData({ currentBrowser: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:true })).toMatchSnapshot()
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
            expect(await getInstanceData({ currentBrowser: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:true })).toMatchSnapshot()
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
            expect(await getInstanceData({ currentBrowser: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:true })).toMatchSnapshot()
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
            expect(await getInstanceData({ currentBrowser: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:true })).toMatchSnapshot()
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
            expect(await getInstanceData({ currentBrowser: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:true })).toMatchSnapshot()
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
            expect(await getInstanceData({ currentBrowser: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:true })).toMatchSnapshot()
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
            expect(await getInstanceData({ currentBrowser: driver, initialDeviceRectangles: DEVICE_RECTANGLES, isNativeContext:true })).toMatchSnapshot()
        })
    })

    describe('getBrowserObject', () => {
        function createElementMock(parent: WebdriverIO.Browser): WebdriverIO.Element {
            // @ts-expect-error
            return {
                isMultiremote: false,
                sessionId: 'mock-session-id',
                elementId: 'mock-element-id',
                ELEMENT: 'mock-ELEMENT',
                selector: 'mock-selector',
                parent: parent,
                capabilities: {},
                requestedCapabilities: {},
            } as WebdriverIO.Element
        }
        const browserMock = {
            isMultiremote: false,
            sessionId: 'mock-session-id',
            capabilities: {},
            requestedCapabilities: {},
            options: {},
        } as WebdriverIO.Browser

        it('should return the browser object when passed a browser object', () => {
            expect(getBrowserObject(browserMock)).toBe(browserMock)
        })

        it('should return the browser object when passed an element with the browser as its parent', () => {
            const elementWithBrowserParent = createElementMock(browserMock)
            expect(getBrowserObject(elementWithBrowserParent)).toBe(browserMock)
        })

        it('should return the browser object for a nested element structure', () => {
            const parentElement = createElementMock(browserMock)
            // @ts-ignore
            const childElement = createElementMock(parentElement)
            expect(getBrowserObject(childElement)).toBe(browserMock)
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
