import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { determineNativeContext, getBrowserObject, getDevicePixelRatio, getFolders, getInstanceData, getScreenshotSize } from '../src/utils.js'
import type { AppiumCapabilities } from '@wdio/types/build/Capabilities.js'

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

    describe('getScreenshotSize', () => {
        // Transparent image of 20x40 pixels
        const mockScreenshot = 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAoCAIAAABxU02MAAAAJElEQVR4nO3LMQEAAAgDILV/59nBV/jpJHU15ynLsizLsvw+L/3pA02VPl1RAAAAAElFTkSuQmCC'
        const width = 20
        const height = 40

        it('should correctly calculate size with default device pixel ratio', () => {
            const size = getScreenshotSize(mockScreenshot)
            expect(size.width).toEqual(width)
            expect(size.height).toEqual(height)
        })

        it('should correctly calculate size with different device pixel ratios', () => {
            const dpr = 2
            const size = getScreenshotSize(mockScreenshot, dpr)
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
        } as any as WebdriverIO.Browser
        const createDriverMock = (customProps: Partial<WebdriverIO.Browser>) => {
            return ({ ...DEFAULT_DESKTOP_BROWSER, ...customProps }) as WebdriverIO.Browser
        }

        afterEach(() => {
            vi.restoreAllMocks()
        })

        it('should return instance data when the minimum of capabilities is provided', async() => {
            const driver = createDriverMock({})
            expect(await getInstanceData(driver)).toMatchSnapshot()
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
            })
            expect(await getInstanceData(driver)).toMatchSnapshot()
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
            })
            expect(await getInstanceData(driver)).toMatchSnapshot()
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
            })
            expect(await getInstanceData(driver)).toMatchSnapshot()
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
                isAndroid: false,
                isMobile: true,
                getWindowSize: vi.fn().mockResolvedValueOnce({ height: 852, width: 393 }),
                takeScreenshot: vi.fn().mockResolvedValueOnce(mockScreenshot),
            })
            expect(await getInstanceData(driver)).toMatchSnapshot()
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
                isAndroid: false,
                isMobile: true,
                getWindowSize: vi.fn().mockResolvedValueOnce({ height: 1194, width: 834 }),
                takeScreenshot: vi.fn().mockResolvedValueOnce(mockScreenshot),
            })
            expect(await getInstanceData(driver)).toMatchSnapshot()
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
                isAndroid: false,
                isMobile: true,
                getWindowSize: vi.fn().mockResolvedValueOnce({ height: 834, width: 1194 }),
                takeScreenshot: vi.fn().mockResolvedValueOnce(mockScreenshot),
            })
            expect(await getInstanceData(driver)).toMatchSnapshot()
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
                isAndroid: false,
                isMobile: true,
                getWindowSize: vi.fn().mockResolvedValueOnce({ height: 888, width: 1234 }),
                takeScreenshot: vi.fn().mockResolvedValueOnce(mockScreenshot),
            })
            expect(await getInstanceData(driver)).toMatchSnapshot()
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
                getWindowSize: vi.fn().mockResolvedValueOnce({ width: 100, height: 200 }),
            })
            expect(await getInstanceData(driver)).toMatchSnapshot()
        })

        it('should return instance data when the browserstack capabilities are provided', async() => {
            const driver = createDriverMock({
                ...DEFAULT_DESKTOP_BROWSER,
                requestedCapabilities:{
                    ...DEFAULT_DESKTOP_BROWSER.requestedCapabilities,
                    'bstack:options': {
                        deviceName: 'Samsung Galaxy S22',
                        osVersion: '12.0'
                    },
                },
                isAndroid: true,
                isMobile: true,
                getWindowSize: vi.fn().mockResolvedValueOnce({ width: 100, height: 200 }),
            })
            expect(await getInstanceData(driver)).toMatchSnapshot()
        })

        it('should return instance data when the lambdatest capabilities are provided', async() => {
            const driver = createDriverMock({
                ...DEFAULT_DESKTOP_BROWSER,
                requestedCapabilities:{
                    ...DEFAULT_DESKTOP_BROWSER.requestedCapabilities,
                    'lt:options': {
                        deviceName: 'Samsung Galaxy S22 LT',
                        platformVersion: '11',
                    },
                },
                capabilities: {
                    ...DEFAULT_DESKTOP_BROWSER.capabilities,
                    // @ts-expect-error
                    platformVersion: '11',
                },
                isAndroid: true,
                isMobile: true,
                getWindowSize: vi.fn().mockResolvedValueOnce({ width: 100, height: 200 }),
            })
            expect(await getInstanceData(driver)).toMatchSnapshot()
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

    describe('determineNativeContext', ()=>{
        const DRIVER_DEFAULTS = {
            sessionId: 'sessionId',
            isMobile: true,
            capabilities:{} as WebdriverIO.Capabilities,
            requestedCapabilities:{} as WebdriverIO.Capabilities | AppiumCapabilities,
        }
        let driver = {} as WebdriverIO.Browser
        beforeEach(() => {
            driver = structuredClone(DRIVER_DEFAULTS) as WebdriverIO.Browser
        })

        it('should return false for desktop browsers', async() => {
            driver.isMobile = false
            expect(await determineNativeContext(driver)).toBeFalsy()
        })

        it('should return false for mobile browsers when no browser has been set', async() => {
            expect(await determineNativeContext(driver)).toBeFalsy()
        })

        it('should return false for mobile browsers', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = 'chrome'
            expect(await determineNativeContext(driver)).toBeFalsy()
        })

        it('should return true for when the app is provided and browser name is empty', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:app'] = 'app'
            expect(await determineNativeContext(driver)).toBeTruthy()
        })

        it('should return true for when the app is provided and autoWebview is false', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:app'] = 'app';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:autoWebview'] = false

            expect(await determineNativeContext(driver)).toBeTruthy()
        })

        it('should return false for when the app is provided and autoWebview is true', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:app'] = 'app';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:autoWebview'] = true

            expect(await determineNativeContext(driver)).toBeFalsy()
        })

        it('should return true for when appium:appPackage is provided and autoWebview is true', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:appPackage'] = 'string';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:autoWebview'] = true

            expect(await determineNativeContext(driver)).toBeFalsy()
        })

        // For iOS
        it('should return true for when appium:bundleId is provided and autoWebview is true', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:bundleId'] = 'string';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:autoWebview'] = true

            expect(await determineNativeContext(driver)).toBeFalsy()
        })

        // For Android
        it('should return true for when appium:appPackage is provided', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:appPackage'] = 'string'

            expect(await determineNativeContext(driver)).toBeTruthy()
        })

        it('should return true for when appium:appActivity is provided', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:appActivity'] = 'appActivity'

            expect(await determineNativeContext(driver)).toBeTruthy()
        })

        it('should return true for when appium:appWaitActivity is provided', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:appWaitActivity'] = 'appWaitActivity'

            expect(await determineNativeContext(driver)).toBeTruthy()
        })

        it('should return true for when appium:appWaitPackage is provided', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:appWaitPackage'] = 'appWaitPackage'

            expect(await determineNativeContext(driver)).toBeTruthy()
        })

        /**
         * For the `appium:options`
         */
        it('should return true for when the app is provided and browser name is empty for the `appium:options`', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:options'] = { 'app': 'app' }
            expect(await determineNativeContext(driver)).toBeTruthy()
        })

        it('should return true for when the app is provided and autoWebview is false for the `appium:options`', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:options'] = { app: 'app', autoWebview: false }

            expect(await determineNativeContext(driver)).toBeTruthy()
        })

        it('should return false for when the app is provided and autoWebview is true for the `appium:options`', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:options'] = { app: 'app', autoWebview: true }

            expect(await determineNativeContext(driver)).toBeFalsy()
        })

        it('should return true for when appium:appPackage is provided and autoWebview is true for the `appium:options`', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:options'] = { appPackage: 'string', autoWebview: true }

            expect(await determineNativeContext(driver)).toBeFalsy()
        })

        // For iOS
        it('should return true for when appium:bundleId is provided and autoWebview is true for the `appium:options`', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:options'] = { bundleId: 'string', autoWebview: true }

            expect(await determineNativeContext(driver)).toBeFalsy()
        })

        // For Android
        it('should return true for when appium:appPackage is provided for the `appium:options`', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:options'] = { appPackage: 'string' }

            expect(await determineNativeContext(driver)).toBeTruthy()
        })

        it('should return true for when appium:appActivity is provided for the `appium:options`', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:options'] = { appActivity: 'appActivity' }

            expect(await determineNativeContext(driver)).toBeTruthy()
        })

        it('should return true for when appium:appWaitActivity is provided for the `appium:options`', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:options'] = { appWaitActivity: 'appWaitActivity' }

            expect(await determineNativeContext(driver)).toBeTruthy()
        })

        it('should return true for when appium:appWaitPackage is provided for the `appium:options`', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:options'] = { appWaitPackage: 'appWaitPackage' }

            expect(await determineNativeContext(driver)).toBeTruthy()
        })
    })
})
