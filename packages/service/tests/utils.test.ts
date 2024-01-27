import { describe, it, expect, beforeEach } from 'vitest'
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
            expect(getFolders(methodOptions, folders)).toMatchSnapshot()
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
            expect(getFolders(methodOptions, folders)).toMatchSnapshot()
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
        const capabilities = {
            browserName: 'chrome',
            version: '75.123',
            platformName: 'osx',
            platformVersion: '12',
        } as WebdriverIO.Capabilities
        const browser = {
            capabilities,
            requestedCapabilities: capabilities,
        } as any as WebdriverIO.Browser

        it('should return instance data when the minimum of capabilities is provided', async() => {
            const capabilities = {} as WebdriverIO.Capabilities
            expect(await getInstanceData(capabilities, browser)).toMatchSnapshot()
        })

        it('should return instance data when wdio-ics option log name is provided', async() => {
            const capabilities = {
                browserName: 'chrome',
                'wdio-ics:options': {
                    logName: 'wdio-ics-logName',
                },
            } as WebdriverIO.Capabilities
            expect(await getInstanceData(capabilities, browser)).toMatchSnapshot()
        })

        it('should return instance data when log name is provided', async () => {
            const capabilities = {
                browserName: 'chrome',
                logName: 'logName',
                'wdio-ics:options': {
                    foo: 'bar',
                },
            } as WebdriverIO.Capabilities
            expect(await getInstanceData(capabilities, browser)).toMatchSnapshot()
        })

        it('should return instance data when the sauce log name is provided', async() => {
            const capabilities = {
                browserName: 'chrome',
                'sauce:options': {
                    logName: 'sauceLogName',
                },
            } as WebdriverIO.Capabilities
            expect(await getInstanceData(capabilities, browser)).toMatchSnapshot()
        })

        it('should return instance data when the appium log name is provided', async() => {
            const capabilities = {
                browserName: 'chrome',
                'appium:options': {
                    logName: 'appiumLogName',
                },
            } as WebdriverIO.Capabilities
            expect(await getInstanceData(capabilities, browser)).toMatchSnapshot()
        })

        it('should return instance data when all capabilities are provided', async() => {
            const capabilities = {
                browserName: 'chrome',
                logName: 'logName',
                deviceName: 'deviceName',
                platformName: 'platformName',
            } as WebdriverIO.Capabilities
            expect(await getInstanceData(capabilities, browser)).toMatchSnapshot()
        })

        it('should return platformName based on the currentCapabilities.platform', async() => {
            const capabilities = {}
            expect(await getInstanceData(capabilities, {
                ...browser,
                platform: 'browser.platform'
            } as any)).toMatchSnapshot()
        })

        it('should return correct instance data when JSONWP Mobile capabilities are provided', async() => {
            const capabilities = {
                browserName: 'chrome',
                logName: 'logName',
                deviceName: 'deviceName',
                platformName: 'platformName',
                nativeWebScreenshot: true,
            } as WebdriverIO.Capabilities
            expect(await getInstanceData(capabilities, browser)).toMatchSnapshot()
        })

        it('should return correct instance data when W3C Mobile capabilities are provided', async () => {
            const capabilities = {
                browserName: 'chrome',
                logName: 'logName',
                'appium:deviceName': 'appium:deviceName',
                platformName: 'platformName',
                'appium:nativeWebScreenshot': true,
            } as WebdriverIO.Capabilities
            expect(await getInstanceData(capabilities, browser)).toMatchSnapshot()
        })
    })

    describe('getBrowserObject', () => {
        function createElementMock(parent: WebdriverIO.Browser): WebdriverIO.Element {
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

        it('should return true for when the app is provided and and autoWebview is false', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:app'] = 'app';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:autoWebview'] = false

            expect(await determineNativeContext(driver)).toBeTruthy()
        })

        it('should return false for when the app is provided and and autoWebview is true', async() => {
            (driver.capabilities as WebdriverIO.Capabilities).browserName = '';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:app'] = 'app';
            (driver.requestedCapabilities as AppiumCapabilities)['appium:autoWebview'] = true

            expect(await determineNativeContext(driver)).toBeFalsy()
        })
    })
})
