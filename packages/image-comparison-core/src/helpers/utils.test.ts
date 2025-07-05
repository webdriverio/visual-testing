import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

vi.mock('node:fs', async () => {
    const actual = await vi.importActual('node:fs')
    return {
        ...actual,
        existsSync: vi.fn(),
        mkdirSync: vi.fn(),
    }
})
import logger from '@wdio/logger'
import {
    calculateDprData,
    canUseBidiScreenshot,
    checkAndroidChromeDriverScreenshot,
    checkAndroidNativeWebScreenshot,
    checkTestInBrowser,
    checkTestInMobileBrowser,
    createConditionalProperty,
    executeNativeClick,
    extractCommonCheckVariables,
    formatFileName,
    getAddressBarShadowPadding,
    getAndCreatePath,
    getBase64ScreenshotSize,
    getBooleanOption,
    getDevicePixelRatio,
    getIosBezelImageNames,
    getMethodOrWicOption,
    getMobileScreenSize,
    getMobileViewPortPosition,
    getToolBarShadowPadding,
    hasResizeDimensions,
    isObject,
    isStorybook,
    loadBase64Html,
    logAllDeprecatedCompareOptions,
    updateVisualBaseline,
} from './utils.js'
import type { FormatFileNameOptions, GetAndCreatePathOptions, ExtractCommonCheckVariablesOptions } from './utils.interfaces.js'
import { IMAGE_STRING } from '../mocks/image.js'
import { DEVICE_RECTANGLES } from './constants.js'
import { getMobileWebviewClickAndDimensions } from '../clientSideScripts/getMobileWebviewClickAndDimensions.js'
import { checkMetaTag } from '../clientSideScripts/checkMetaTag.js'
import type { ClassOptions } from './options.interfaces.js'

vi.mock('../clientSideScripts/injectWebviewOverlay.js', () => ({
    injectWebviewOverlay: Symbol('injectWebviewOverlay'),
}))

vi.mock('../clientSideScripts/getMobileWebviewClickAndDimensions.js', () => ({
    getMobileWebviewClickAndDimensions: Symbol('getMobileWebviewClickAndDimensions'),
}))

vi.mock('../clientSideScripts/checkMetaTag.js', () => ({
    checkMetaTag: Symbol('checkMetaTag'),
}))

const log = logger('test')
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))

// Mock the global browser object for functions that use it
vi.mock('@wdio/globals', () => ({
    browser: {
        execute: vi.fn(),
        browsingContextCaptureScreenshot: vi.fn(),
        getWindowHandle: vi.fn(),
    }
}))

describe('utils', () => {
    // Helper function to create mock browser instance
    const createMockBrowserInstance = () => {
        return {
            execute: vi.fn(),
            browsingContextCaptureScreenshot: vi.fn(),
            getWindowHandle: vi.fn(),
            isBidi: true,
            getOrientation: vi.fn().mockResolvedValue('PORTRAIT'),
            getWindowSize: vi.fn().mockResolvedValue({ width: 375, height: 667 }),
            getUrl: vi.fn().mockResolvedValue('http://example.com'),
            url: vi.fn(),
        } as unknown as WebdriverIO.Browser
    }

    describe('getAndCreatePath', () => {
        const folder = join(process.cwd(), '/.tmp/utils')

        beforeEach(() => {
            vi.mocked(existsSync).mockClear()
        })

        it('should create the folder and return the folder name for a device that needs to have its own folder', () => {
            const options: GetAndCreatePathOptions = {
                browserName: '',
                deviceName: 'deviceName',
                isMobile: true,
                savePerInstance: true,
            }
            const expectedFolderName = join(folder, options.deviceName)

            // Mock: folder doesn't exist initially
            vi.mocked(existsSync).mockReturnValueOnce(false)
            expect(existsSync(expectedFolderName)).toMatchSnapshot()

            // Mock: folder exists after creation
            vi.mocked(existsSync).mockReturnValue(true)
            expect(getAndCreatePath(folder, options)).toEqual(expectedFolderName)
            expect(existsSync(expectedFolderName)).toMatchSnapshot()
        })

        it('should create the folder and return the folder name for a browser that needs to have its own folder', () => {
            const options: GetAndCreatePathOptions = {
                browserName: 'browser',
                deviceName: '',
                isMobile: false,
                savePerInstance: true,
            }
            const expectedFolderName = join(folder, `desktop_${options.browserName}`)

            // Mock: folder doesn't exist initially
            vi.mocked(existsSync).mockReturnValueOnce(false)
            expect(existsSync(expectedFolderName)).toMatchSnapshot()

            // Mock: folder exists after creation
            vi.mocked(existsSync).mockReturnValue(true)
            expect(getAndCreatePath(folder, options)).toEqual(expectedFolderName)
            expect(existsSync(expectedFolderName)).toMatchSnapshot()
        })

        it('should create the folder and return the folder name for a browser', () => {
            const options: GetAndCreatePathOptions = {
                browserName: 'browser',
                deviceName: '',
                isMobile: false,
                savePerInstance: false,
            }

            // Mock: folder doesn't exist initially
            vi.mocked(existsSync).mockReturnValueOnce(false)
            expect(existsSync(folder)).toMatchSnapshot()

            // Mock: folder exists after creation
            vi.mocked(existsSync).mockReturnValue(true)
            expect(getAndCreatePath(folder, options)).toEqual(folder)
            expect(existsSync(folder)).toMatchSnapshot()
        })
    })

    describe('formatFileName', () => {
        const formatFileOptions: FormatFileNameOptions = {
            browserName: '',
            browserVersion: '',
            deviceName: '',
            devicePixelRatio: 2,
            formatImageName: '',
            isMobile: false,
            isTestInBrowser: true,
            logName: '',
            name: '',
            outerHeight: 768,
            outerWidth: 1366,
            platformName: '',
            platformVersion: '',
            screenHeight: 900,
            screenWidth: 1400,
            tag: 'theTag',
        }

        it('should format a string with all options provided', () => {
            formatFileOptions.formatImageName =
                'browser.{browserName}-{browserVersion}-platform.{platformName}-{platformVersion}-dpr.{dpr}-{height}-{logName}-{name}-{tag}-{width}'
            formatFileOptions.browserName = 'chrome'
            formatFileOptions.browserVersion = '74'
            formatFileOptions.logName = 'chrome-latest'
            formatFileOptions.name = 'chrome-name'
            formatFileOptions.platformName = 'osx'
            formatFileOptions.platformVersion = '12'

            expect(formatFileName(formatFileOptions)).toMatchSnapshot()
        })

        it('should format a string for mobile app', () => {
            formatFileOptions.formatImageName = '{tag}-{mobile}-{dpr}-{width}x{height}'
            formatFileOptions.deviceName = 'iPhoneX'
            formatFileOptions.isMobile = true
            formatFileOptions.isTestInBrowser = false

            expect(formatFileName(formatFileOptions)).toMatchSnapshot()
        })

        it('should format a string for mobile browser', () => {
            formatFileOptions.formatImageName = '{tag}-{mobile}-{dpr}-{width}x{height}'
            formatFileOptions.browserName = 'chrome'
            formatFileOptions.deviceName = 'iPhoneX'
            formatFileOptions.isMobile = true
            formatFileOptions.isTestInBrowser = true

            expect(formatFileName(formatFileOptions)).toMatchSnapshot()
        })
    })

    describe('checkTestInBrowser', () => {
        const testCases = [
            { browserName: 'chrome', expected: true },
            { browserName: '', expected: false },
        ]

        testCases.forEach(({ browserName, expected }) => {
            it(`should return ${expected} for browserName:'${browserName}'`, () => {
                expect(checkTestInBrowser(browserName)).toMatchSnapshot()
            })
        })
    })

    describe('checkTestInMobileBrowser', () => {
        const testCases = [
            { isMobile: false, browserName: 'chrome', expected: false },
            { isMobile: true, browserName: '', expected: false },
            { isMobile: true, browserName: 'chrome', expected: true },
        ]

        testCases.forEach(({ isMobile, browserName, expected }) => {
            it(`should return ${expected} for isMobile:'${isMobile}' and browserName:'${browserName}'`, () => {
                expect(checkTestInMobileBrowser(isMobile, browserName)).toMatchSnapshot()
            })
        })
    })

    describe('checkAndroidNativeWebScreenshot', () => {
        const testCases = [
            { isAndroid: false, nativeWeb: false, expected: false },
            { isAndroid: true, nativeWeb: true, expected: true },
            { isAndroid: true, nativeWeb: false, expected: false },
        ]

        testCases.forEach(({ isAndroid, nativeWeb, expected }) => {
            it(`should return ${expected} for isAndroid:'${isAndroid}' and nativeWeb:${nativeWeb}`, () => {
                expect(checkAndroidNativeWebScreenshot(isAndroid, nativeWeb)).toMatchSnapshot()
            })
        })
    })

    describe('checkAndroidChromeDriverScreenshot', () => {
        const testCases = [
            { isAndroid: false, nativeWeb: false, expected: false },
            { isAndroid: true, nativeWeb: true, expected: false },
            { isAndroid: true, nativeWeb: false, expected: true },
        ]

        testCases.forEach(({ isAndroid, nativeWeb, expected }) => {
            it(`should return ${expected} for isAndroid:'${isAndroid}' and nativeWeb:${nativeWeb}`, () => {
                expect(checkAndroidChromeDriverScreenshot(isAndroid, nativeWeb)).toMatchSnapshot()
            })
        })
    })

    describe('getAddressBarShadowPadding', () => {
        const baseOptions = {
            isAndroid: false,
            isIOS: false,
            isMobile: false,
            browserName: '',
            nativeWebScreenshot: false,
            addressBarShadowPadding: 6,
            addShadowPadding: false,
        }

        const testCases = [
            { ...baseOptions, browserName: 'chrome', description: 'desktop browser', expected: 0 },
            { ...baseOptions, isAndroid: true, description: 'Android app', expected: 0 },
            { ...baseOptions, isIOS: true, description: 'iOS app', expected: 0 },
            { ...baseOptions, isAndroid: true, nativeWebScreenshot: true, description: 'Android native web without shadow padding', expected: 0 },
            { ...baseOptions, isAndroid: true, nativeWebScreenshot: true, addShadowPadding: true, description: 'Android native web with shadow padding', expected: 6 },
            { ...baseOptions, isIOS: true, addShadowPadding: true, description: 'iOS with shadow padding', expected: 6 },
        ]

        testCases.forEach(({ description, expected, ...options }) => {
            it(`should return ${expected} for ${description}`, () => {
                expect(getAddressBarShadowPadding(options)).toMatchSnapshot()
            })
        })
    })

    describe('getToolBarShadowPadding', () => {
        const baseOptions = {
            isAndroid: false,
            isIOS: false,
            isMobile: false,
            browserName: '',
            nativeWebScreenshot: false,
            toolBarShadowPadding: 6,
            addShadowPadding: false,
        }

        const testCases = [
            { ...baseOptions, browserName: 'chrome', description: 'desktop browser', expected: 0 },
            { ...baseOptions, isAndroid: true, isMobile: true, description: 'Android app', expected: 0 },
            { ...baseOptions, isIOS: true, isMobile: true,  description: 'iOS app', expected: 0 },
            { ...baseOptions, isAndroid: true, isMobile: true, addShadowPadding: true, description: 'Android app with shadow padding', expected: 0 },
            { ...baseOptions, isAndroid: true, isMobile: true, browserName: 'chrome', addShadowPadding: true, description: 'Android browser with shadow padding', expected: 6 },
            { ...baseOptions, isIOS: true, isMobile: true, browserName: 'safari', addShadowPadding: true, description: 'iOS with shadow padding', expected: 15 },
        ]

        testCases.forEach(({ description, expected, ...options }) => {
            it(`should return ${expected} for ${description}`, () => {
                expect(getToolBarShadowPadding(options)).toMatchSnapshot()
            })
        })
    })

    describe('calculateDprData', () => {
        it('should multiply all number values by the dpr value', () => {
            const data = {
                a: 1,
                b: 2,
                1: 3,
                a1: 9,
                bool: true,
                string: 'string',
            }

            expect(calculateDprData(data, 2)).toMatchSnapshot()
        })
    })

    describe('getBase64ScreenshotSize', () => {
        const testCases = [
            { dpr: undefined, description: 'default DPR' },
            { dpr: 2, description: 'DPR 2' },
        ]

        testCases.forEach(({ dpr, description }) => {
            it(`should get the screenshot size with ${description}`, () => {
                expect(getBase64ScreenshotSize(IMAGE_STRING, dpr)).toMatchSnapshot()
            })
        })
    })

    describe('getDevicePixelRatio', () => {
        const testCases = [
            { deviceSize: { width: 32, height: 64 }, expected: 1, description: 'equal width' },
            { deviceSize: { width: 16, height: 32 }, expected: 2, description: 'double width' },
            { deviceSize: { width: 17, height: 32 }, expected: 'rounded', description: 'rounded result' },
        ]

        testCases.forEach(({ deviceSize, description }) => {
            it(`should return correct ratio for ${description}`, () => {
                expect(getDevicePixelRatio(IMAGE_STRING, deviceSize)).toMatchSnapshot()
            })
        })
    })

    describe('getIosBezelImageNames', () => {
        const supportedDevices = [
            'iphonex', 'iphonexs', 'iphonexsmax', 'iphonexr', 'iphone11', 'iphone11pro', 'iphone11promax',
            'iphone12', 'iphone12mini', 'iphone12pro', 'iphone12promax', 'iphone13', 'iphone13mini',
            'iphone13pro', 'iphone13promax', 'iphone14', 'iphone14plus', 'iphone14pro', 'iphone14promax',
            'iphone15', 'ipadmini', 'ipadair', 'ipadpro11', 'ipadpro129',
        ]

        supportedDevices.forEach((device) => {
            it(`should return bezel image names for "${device}"`, () => {
                expect(getIosBezelImageNames(device)).toMatchSnapshot()
            })
        })

        it('should throw an error for unsupported device names', () => {
            expect(() => getIosBezelImageNames('unsupportedDevice')).toThrowErrorMatchingSnapshot()
        })
    })

    describe('isObject', () => {
        const testCases = [
            { value: {}, expected: true, description: 'plain object' },
            { value: () => {}, expected: true, description: 'function' },
            { value: [], expected: true, description: 'array' },
            { value: null, expected: false, description: 'null' },
            { value: undefined, expected: false, description: 'undefined' },
            { value: 'string', expected: false, description: 'string' },
            { value: 123, expected: false, description: 'number' },
            { value: true, expected: false, description: 'boolean' },
        ]

        testCases.forEach(({ value, expected, description }) => {
            it(`should return ${expected} for ${description}`, () => {
                expect(isObject(value)).toBe(expected)
            })
        })
    })

    describe('process.argv dependent functions', () => {
        const originalArgv = [...process.argv]

        afterEach(() => {
            process.argv = [...originalArgv]
        })

        const processArgvTests = [
            { functionName: 'isStorybook', testFunction: isStorybook, flag: '--storybook' },
            { functionName: 'updateVisualBaseline', testFunction: updateVisualBaseline, flag: '--update-visual-baseline' },
        ]

        processArgvTests.forEach(({ functionName, testFunction, flag }) => {
            describe(functionName, () => {
                it(`should return true when "${flag}" is in process.argv`, () => {
                    process.argv.push(flag)
                    expect(testFunction()).toBe(true)
                })

                it(`should return false when "${flag}" is not in process.argv`, () => {
                    process.argv = originalArgv.filter(arg => arg !== flag)
                    expect(testFunction()).toBe(false)
                })
            })
        })
    })

    describe('getMobileScreenSize', () => {
        let mockBrowserInstance: WebdriverIO.Browser

        beforeEach(() => {
            mockBrowserInstance = createMockBrowserInstance()
        })

        const testCases = [
            {
                description: 'iOS in portrait',
                isIOS: true,
                orientation: 'PORTRAIT',
                mockResponse: { screenSize: { width: 390, height: 844 } },
                expected: { width: 390, height: 844 }
            },
            {
                description: 'iOS in landscape',
                isIOS: true,
                orientation: 'LANDSCAPE',
                mockResponse: { screenSize: { width: 390, height: 844 } },
                expected: { width: 844, height: 390 }
            },
            {
                description: 'Android in portrait',
                isIOS: false,
                orientation: 'PORTRAIT',
                mockResponse: { realDisplaySize: '1080x2400' },
                expected: { width: 1080, height: 2400 }
            }
        ]

        testCases.forEach(({ description, isIOS, orientation, mockResponse, expected }) => {
            it(`should return correct screen size for ${description}`, async () => {
                vi.mocked(mockBrowserInstance.getOrientation).mockResolvedValue(orientation as any)
                vi.mocked(mockBrowserInstance.execute).mockResolvedValue(mockResponse)

                const result = await getMobileScreenSize({
                    browserInstance: mockBrowserInstance,
                    isIOS,
                    isNativeContext: true
                })

                expect(result).toEqual(expected)
            })
        })

        it('should fall back to web context for iOS', async () => {
            vi.mocked(mockBrowserInstance.execute)
                .mockRejectedValueOnce(new Error('Missing screenSize'))
                .mockResolvedValueOnce({ width: 800, height: 1200 })
            vi.mocked(mockBrowserInstance.getOrientation).mockResolvedValue('PORTRAIT')

            const result = await getMobileScreenSize({
                browserInstance: mockBrowserInstance,
                isIOS: true,
                isNativeContext: false
            })

            expect(result).toEqual({ width: 800, height: 1200 })
        })

        it('should fall back to getWindowSize in native context', async () => {
            vi.mocked(mockBrowserInstance.execute).mockRejectedValue(new Error('Boom'))
            vi.mocked(mockBrowserInstance.getOrientation).mockResolvedValue('PORTRAIT')
            vi.mocked(mockBrowserInstance.getWindowSize).mockResolvedValue({ width: 123, height: 456 })

            const result = await getMobileScreenSize({
                browserInstance: mockBrowserInstance,
                isIOS: true,
                isNativeContext: true
            })

            expect(result).toEqual({ width: 123, height: 456 })
        })
    })

    describe('loadBase64Html', () => {
        let mockBrowserInstance: WebdriverIO.Browser

        beforeEach(() => {
            mockBrowserInstance = createMockBrowserInstance()
        })

        it('should call browserInstance.execute with blob URL creation for all platforms', async () => {
            await loadBase64Html({ browserInstance: mockBrowserInstance, isIOS: false })

            expect(mockBrowserInstance.execute).toHaveBeenCalledTimes(1)
            expect(mockBrowserInstance.execute).toHaveBeenCalledWith(expect.any(Function), expect.any(String))
        })

        it('should call browserInstance.execute with blob URL creation and checkMetaTag for iOS', async () => {
            await loadBase64Html({ browserInstance: mockBrowserInstance, isIOS: true })

            expect(mockBrowserInstance.execute).toHaveBeenCalledTimes(2)
            expect(mockBrowserInstance.execute).toHaveBeenNthCalledWith(1, expect.any(Function), expect.any(String))
            expect(mockBrowserInstance.execute).toHaveBeenNthCalledWith(2, checkMetaTag)
        })
    })

    describe('executeNativeClick', () => {
        let mockBrowserInstance: WebdriverIO.Browser
        const coords = { x: 100, y: 200 }

        beforeEach(() => {
            mockBrowserInstance = createMockBrowserInstance()
        })

        it('should call browserInstance.execute with "mobile: tap" on iOS', async () => {
            await executeNativeClick({ browserInstance: mockBrowserInstance, isIOS: true, ...coords })

            expect(mockBrowserInstance.execute).toHaveBeenCalledWith('mobile: tap', coords)
        })

        it('should call browserInstance.execute with "mobile: clickGesture" on Android (Appium 2)', async () => {
            await executeNativeClick({ browserInstance: mockBrowserInstance, isIOS: false, ...coords })

            expect(mockBrowserInstance.execute).toHaveBeenCalledWith('mobile: clickGesture', coords)
        })

        it('should fall back to "doubleClickGesture" when clickGesture fails (Appium 1)', async () => {
            vi.mocked(mockBrowserInstance.execute)
                .mockRejectedValueOnce(new Error('WebDriverError: Unknown mobile command: clickGesture'))
                .mockResolvedValueOnce(undefined)

            await executeNativeClick({ browserInstance: mockBrowserInstance, isIOS: false, ...coords })

            expect(mockBrowserInstance.execute).toHaveBeenCalledWith('mobile: clickGesture', coords)
            expect(mockBrowserInstance.execute).toHaveBeenCalledWith('mobile: doubleClickGesture', coords)
        })

        it('should throw the error if it\'s not a known Appium command error', async () => {
            vi.mocked(mockBrowserInstance.execute).mockRejectedValue(new Error('Some unexpected error'))

            await expect(executeNativeClick({ browserInstance: mockBrowserInstance, isIOS: false, ...coords }))
                .rejects
                .toThrowError('Some unexpected error')
        })
    })

    describe('getMobileViewPortPosition', () => {
        let mockBrowserInstance: WebdriverIO.Browser

        const baseOptions = {
            isAndroid: false,
            isIOS: true,
            isNativeContext: false,
            nativeWebScreenshot: true,
            screenHeight: 800,
            screenWidth: 400,
            initialDeviceRectangles: DEVICE_RECTANGLES,
        }

        beforeEach(() => {
            mockBrowserInstance = createMockBrowserInstance()
        })

        it('should return correct device rectangles for iOS WebView flow', async () => {
            vi.mocked(mockBrowserInstance.execute)
                .mockResolvedValueOnce(undefined) // loadBase64Html
                .mockResolvedValueOnce(undefined) // checkMetaTag
                .mockResolvedValueOnce(undefined) // injectWebviewOverlay
                .mockResolvedValueOnce(undefined) // executeNativeClick
                .mockResolvedValueOnce({ x: 150, y: 300, width: 100, height: 100 }) // getMobileWebviewClickAndDimensions

            const result = await getMobileViewPortPosition({
                browserInstance: mockBrowserInstance,
                ...baseOptions,
            })

            expect(mockBrowserInstance.getUrl).toHaveBeenCalled()
            expect(mockBrowserInstance.url).toHaveBeenCalledWith('http://example.com')
            expect(mockBrowserInstance.execute).toHaveBeenCalledWith(getMobileWebviewClickAndDimensions, '[data-test="ics-overlay"]')
            expect(result).toMatchSnapshot()
        })

        it('should return initialDeviceRectangles if not WebView (native context)', async () => {
            const result = await getMobileViewPortPosition({
                browserInstance: mockBrowserInstance,
                ...baseOptions,
                isNativeContext: true,
            })

            expect(result).toEqual(DEVICE_RECTANGLES)
            expect(mockBrowserInstance.execute).not.toHaveBeenCalled()
        })

        it('should return initialDeviceRectangles if Android + not nativeWebScreenshot', async () => {
            const result = await getMobileViewPortPosition({
                browserInstance: mockBrowserInstance,
                ...baseOptions,
                isAndroid: true,
                isIOS: false,
                nativeWebScreenshot: false,
            })

            expect(result).toEqual(DEVICE_RECTANGLES)
            expect(mockBrowserInstance.getUrl).not.toHaveBeenCalled()
        })
    })

    describe('canUseBidiScreenshot', () => {
        it('should return true when both required methods are functions', () => {
            const mockBrowserInstance = createMockBrowserInstance()
            expect(canUseBidiScreenshot(mockBrowserInstance)).toBe(true)
        })

        it('should return false if browsingContextCaptureScreenshot is missing', () => {
            const mockBrowserInstance = createMockBrowserInstance()
            delete (mockBrowserInstance as any).browsingContextCaptureScreenshot

            expect(canUseBidiScreenshot(mockBrowserInstance)).toBe(false)
        })

        it('should return false if getWindowHandle is missing', () => {
            const mockBrowserInstance = createMockBrowserInstance()
            delete (mockBrowserInstance as any).getWindowHandle

            expect(canUseBidiScreenshot(mockBrowserInstance)).toBe(false)
        })

        it('should return false if either is not a function', () => {
            const mockBrowserInstance = createMockBrowserInstance()
            ;(mockBrowserInstance as any).browsingContextCaptureScreenshot = 'notAFunction'

            expect(canUseBidiScreenshot(mockBrowserInstance)).toBe(false)
        })
    })

    describe('logAllDeprecatedCompareOptions', () => {
        const allDeprecatedOptions = {
            blockOutSideBar: true,
            blockOutStatusBar: true,
            blockOutToolBar: true,
            createJsonReportFiles: true,
            diffPixelBoundingBoxProximity: 5,
            ignoreAlpha: true,
            ignoreAntialiasing: true,
            ignoreColors: true,
            ignoreLess: true,
            ignoreNothing: true,
            rawMisMatchPercentage: true,
            returnAllCompareData: true,
            saveAboveTolerance: 100,
            scaleImagesToSameSize: true,
        }

        it('should log a deprecation warning for each deprecated key', () => {
            const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {})

            logAllDeprecatedCompareOptions(allDeprecatedOptions)

            expect(warnSpy).toHaveBeenCalledTimes(1)
            expect(warnSpy.mock.calls[0][0]).toMatchSnapshot()
        })

        it('should return a subset of CompareOptions with deprecated keys only', () => {
            const result = logAllDeprecatedCompareOptions(allDeprecatedOptions)
            expect(result).toMatchSnapshot()
        })
    })

    describe('getMethodOrWicOption', () => {
        const defaultOptions = { foo: 'bar', count: 42, isEnabled: true }

        const testCases = [
            { method: { foo: 'baz' }, key: 'foo', expected: 'baz', description: 'value from method if defined' },
            { method: undefined, key: 'count', expected: 42, description: 'value from wic if method is undefined' },
            { method: { foo: undefined }, key: 'foo', expected: 'bar', description: 'value from wic if key in method is undefined' },
            { method: { isEnabled: false }, key: 'isEnabled', expected: false, description: 'boolean value from method if defined' },
            { method: {}, key: 'count', expected: 42, description: 'value from wic for missing key in method' },
        ]

        testCases.forEach(({ method, key, expected, description }) => {
            it(`should return ${description}`, () => {
                const result = getMethodOrWicOption(method, defaultOptions, key as keyof typeof defaultOptions)
                expect(result).toBe(expected)
            })
        })
    })

    describe('getBooleanOption', () => {
        const testCases = [
            { options: { autoElementScroll: true }, key: 'autoElementScroll', defaultValue: false, expected: true, description: 'boolean value when property exists' },
            { options: {}, key: 'disableBlinkingCursor', defaultValue: true, expected: true, description: 'default value when property does not exist' },
            { options: { autoElementScroll: 'truthy' as any }, key: 'autoElementScroll', defaultValue: false, expected: true, description: 'truthy values to true' },
            { options: { autoElementScroll: 0 as any }, key: 'autoElementScroll', defaultValue: true, expected: false, description: 'falsy values to false' },
            { options: { autoElementScroll: undefined }, key: 'autoElementScroll', defaultValue: true, expected: true, description: 'default when property is undefined' },
            { options: { autoElementScroll: null as any }, key: 'autoElementScroll', defaultValue: false, expected: false, description: 'default when property is null' },
        ]

        testCases.forEach(({ options, key, defaultValue, expected, description }) => {
            it(`should return ${description}`, () => {
                const result = getBooleanOption(options as ClassOptions, key as keyof ClassOptions, defaultValue)
                expect(result).toBe(expected)
            })
        })
    })

    describe('createConditionalProperty', () => {
        const testCases = [
            { condition: true, key: 'testKey', value: 'testValue', expected: { testKey: 'testValue' }, description: 'object with property when condition is true' },
            { condition: false, key: 'testKey', value: 'testValue', expected: {}, description: 'empty object when condition is false' },
            { condition: true, key: 'number', value: 42, expected: { number: 42 }, description: 'number value' },
            { condition: true, key: 'boolean', value: false, expected: { boolean: false }, description: 'boolean value' },
            { condition: true, key: 'object', value: { nested: 'value' }, expected: { object: { nested: 'value' } }, description: 'object value' },
            { condition: true, key: 'undefined', value: undefined, expected: { undefined: undefined }, description: 'undefined value' },
            { condition: true, key: 'null', value: null, expected: { null: null }, description: 'null value' },
        ]

        testCases.forEach(({ condition, key, value, expected, description }) => {
            it(`should return ${description}`, () => {
                const result = createConditionalProperty(condition, key, value)
                expect(result).toEqual(expected)
            })
        })

        it('should always return empty object when condition is false regardless of value', () => {
            const values = ['value', null, undefined, { complex: 'object' }]
            values.forEach(value => {
                expect(createConditionalProperty(false, 'key', value)).toEqual({})
            })
        })
    })

    describe('hasResizeDimensions', () => {
        it('should return true when any value is non-zero', () => {
            expect(hasResizeDimensions({ top: 10, right: 0, bottom: 0, left: 0 })).toBe(true)
            expect(hasResizeDimensions({ top: 0, right: 0, bottom: 0, left: -5 })).toBe(true)
        })

        it('should return false when all values are zero', () => {
            expect(hasResizeDimensions({ top: 0, right: 0, bottom: 0, left: 0 })).toBe(false)
        })

        it('should return falsy when input is falsy', () => {
            expect(hasResizeDimensions(null)).toBe(null)
            expect(hasResizeDimensions(undefined)).toBe(undefined)
            expect(hasResizeDimensions(false)).toBe(false)
        })

        it('should return false for empty object', () => {
            expect(hasResizeDimensions({})).toBe(false)
        })
    })

    describe('extractCommonCheckVariables', () => {
        const baseFolders = {
            actualFolder: '/path/to/actual',
            baselineFolder: '/path/to/baseline',
            diffFolder: '/path/to/diff',
        }

        const baseInstanceData = {
            browserName: 'chrome',
            deviceName: 'iPhone 12',
            deviceRectangles: { screenSize: { width: 390, height: 844 } },
            isAndroid: false,
            isMobile: true,
            nativeWebScreenshot: true,
        }

        const baseWicOptions = {
            autoSaveBaseline: true,
            savePerInstance: false,
        }

        it('should extract all required common variables', () => {
            const options: ExtractCommonCheckVariablesOptions = {
                folders: baseFolders,
                instanceData: baseInstanceData,
                wicOptions: baseWicOptions,
            }

            const result = extractCommonCheckVariables(options)

            expect(result).toEqual({
                actualFolder: '/path/to/actual',
                baselineFolder: '/path/to/baseline',
                diffFolder: '/path/to/diff',
                browserName: 'chrome',
                deviceName: 'iPhone 12',
                deviceRectangles: { screenSize: { width: 390, height: 844 } },
                isAndroid: false,
                isMobile: true,
                isAndroidNativeWebScreenshot: true,
                autoSaveBaseline: true,
                savePerInstance: false,
            })
        })

        it('should include optional fields when they exist', () => {
            const options: ExtractCommonCheckVariablesOptions = {
                folders: baseFolders,
                instanceData: {
                    ...baseInstanceData,
                    platformName: 'iOS',
                    isIOS: true,
                },
                wicOptions: {
                    ...baseWicOptions,
                    isHybridApp: true,
                },
            }

            const result = extractCommonCheckVariables(options)

            expect(result).toEqual({
                actualFolder: '/path/to/actual',
                baselineFolder: '/path/to/baseline',
                diffFolder: '/path/to/diff',
                browserName: 'chrome',
                deviceName: 'iPhone 12',
                deviceRectangles: { screenSize: { width: 390, height: 844 } },
                isAndroid: false,
                isMobile: true,
                isAndroidNativeWebScreenshot: true,
                platformName: 'iOS',
                isIOS: true,
                autoSaveBaseline: true,
                savePerInstance: false,
                isHybridApp: true,
            })
        })

        it('should exclude optional fields when they are falsy or undefined', () => {
            const options: ExtractCommonCheckVariablesOptions = {
                folders: baseFolders,
                instanceData: {
                    ...baseInstanceData,
                    platformName: null,
                    isIOS: undefined,
                },
                wicOptions: {
                    ...baseWicOptions,
                    isHybridApp: undefined,
                },
            }

            const result = extractCommonCheckVariables(options)

            expect(result).toEqual({
                actualFolder: '/path/to/actual',
                baselineFolder: '/path/to/baseline',
                diffFolder: '/path/to/diff',
                browserName: 'chrome',
                deviceName: 'iPhone 12',
                deviceRectangles: { screenSize: { width: 390, height: 844 } },
                isAndroid: false,
                isMobile: true,
                isAndroidNativeWebScreenshot: true,
                autoSaveBaseline: true,
                savePerInstance: false,
            })
        })

        it('should handle partial optional fields correctly', () => {
            const options: ExtractCommonCheckVariablesOptions = {
                folders: baseFolders,
                instanceData: {
                    ...baseInstanceData,
                    platformName: 'Android',
                    isIOS: false,
                },
                wicOptions: baseWicOptions,
            }

            const result = extractCommonCheckVariables(options)

            expect(result).toEqual({
                actualFolder: '/path/to/actual',
                baselineFolder: '/path/to/baseline',
                diffFolder: '/path/to/diff',
                browserName: 'chrome',
                deviceName: 'iPhone 12',
                deviceRectangles: { screenSize: { width: 390, height: 844 } },
                isAndroid: false,
                isMobile: true,
                isAndroidNativeWebScreenshot: true,
                platformName: 'Android',
                isIOS: false,
                autoSaveBaseline: true,
                savePerInstance: false,
            })
        })

        it('should handle Android device correctly', () => {
            const options: ExtractCommonCheckVariablesOptions = {
                folders: baseFolders,
                instanceData: {
                    browserName: 'chromium',
                    deviceName: 'Pixel 4',
                    deviceRectangles: { screenSize: { width: 412, height: 869 } },
                    isAndroid: true,
                    isMobile: true,
                    nativeWebScreenshot: false,
                },
                wicOptions: baseWicOptions,
            }

            const result = extractCommonCheckVariables(options)

            expect(result.isAndroid).toBe(true)
            expect(result.isAndroidNativeWebScreenshot).toBe(false)
            expect(result.browserName).toBe('chromium')
            expect(result.deviceName).toBe('Pixel 4')
        })
    })
})
