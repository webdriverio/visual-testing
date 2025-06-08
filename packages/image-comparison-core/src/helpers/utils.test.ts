import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import logger from '@wdio/logger'
import {
    calculateDprData,
    canUseBidiScreenshot,
    checkAndroidChromeDriverScreenshot,
    checkAndroidNativeWebScreenshot,
    checkIsAndroid,
    checkIsIos,
    checkIsMobile,
    checkTestInBrowser,
    checkTestInMobileBrowser,
    createConditionalProperty,
    executeNativeClick,
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
    isObject,
    isStorybook,
    loadBase64Html,
    logAllDeprecatedCompareOptions,
    updateVisualBaseline,
} from './utils.js'
import type { FormatFileNameOptions, GetAndCreatePathOptions } from './utils.interfaces.js'
import { IMAGE_STRING } from '../mocks/mocks.js'
import { DEVICE_RECTANGLES } from './constants.js'
import { injectWebviewOverlay } from '../clientSideScripts/injectWebviewOverlay.js'
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
    describe('getAndCreatePath', () => {
        const folder = join(process.cwd(), '/.tmp/utils')

        afterEach(() => rmSync(folder, { recursive: true, force: true }))

        it('should create the folder and return the folder name for a device that needs to have its own folder', () => {
            const options: GetAndCreatePathOptions = {
                browserName: '',
                deviceName: 'deviceName',
                isMobile: true,
                savePerInstance: true,
            }
            const expectedFolderName = join(folder, options.deviceName)

            expect(existsSync(expectedFolderName)).toMatchSnapshot()
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

            expect(existsSync(expectedFolderName)).toMatchSnapshot()
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

            expect(existsSync(folder)).toMatchSnapshot()
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

    describe('checkIsMobile', () => {
        it('should return false when no platform name is provided', () => {
            expect(checkIsMobile('')).toMatchSnapshot()
        })

        it('should return true when a platform name is provided', () => {
            expect(checkIsMobile('ios')).toMatchSnapshot()
        })
    })

    describe('checkIsAndroid', () => {
        it('should return false when no platform name is provided', () => {
            expect(checkIsAndroid('')).toMatchSnapshot()
        })

        it('should return false when a platform name is provided that is not accepted', () => {
            expect(checkIsAndroid('chrome')).toMatchSnapshot()
        })

        it('should return true when a valid platform name is provided', () => {
            expect(checkIsAndroid('androId')).toMatchSnapshot()
        })
    })

    describe('checkIsIos', () => {
        it('should return false when no platform name is provided', () => {
            expect(checkIsIos('')).toMatchSnapshot()
        })

        it('should return false when a platform name is provided that is not accepted', () => {
            expect(checkIsIos('chrome')).toMatchSnapshot()
        })

        it('should return true when a valid platform name is provided', () => {
            expect(checkIsIos('IoS')).toMatchSnapshot()
        })
    })

    describe('checkTestInBrowser', () => {
        it('should return false when no browser name is provided', () => {
            expect(checkTestInBrowser('')).toMatchSnapshot()
        })

        it('should return true when a browser name is provided', () => {
            expect(checkTestInBrowser('chrome')).toMatchSnapshot()
        })
    })

    describe('checkTestInMobileBrowser', () => {
        it('should return false when no platform name is provided', () => {
            expect(checkTestInMobileBrowser('', 'chrome')).toMatchSnapshot()
        })

        it('should return false when a plaform but no browser name is provided', () => {
            expect(checkTestInMobileBrowser('ios', '')).toMatchSnapshot()
        })

        it('should return true when a plaform and a browser name is provided', () => {
            expect(checkTestInMobileBrowser('ios', 'chrome')).toMatchSnapshot()
        })
    })

    describe('checkAndroidNativeWebScreenshot', () => {
        it('should return false when no platform name is provided', () => {
            expect(checkAndroidNativeWebScreenshot('', false)).toMatchSnapshot()
        })

        it('should return false when iOS and nativeWebscreenshot true is provided', () => {
            expect(checkAndroidNativeWebScreenshot('ios', true)).toMatchSnapshot()
        })

        it('should return false when iOS and nativeWebscreenshot false is provided', () => {
            expect(checkAndroidNativeWebScreenshot('ios', false)).toMatchSnapshot()
        })

        it('should return false when Android and nativeWebscreenshot false is provided', () => {
            expect(checkAndroidNativeWebScreenshot('Android', false)).toMatchSnapshot()
        })

        it('should return true when Android and nativeWebscreenshot true is provided ', () => {
            expect(checkAndroidNativeWebScreenshot('Android', true)).toMatchSnapshot()
        })
    })

    describe('checkAndroidChromeDriverScreenshot', () => {
        it('should return false when no platform name is provided', () => {
            expect(checkAndroidChromeDriverScreenshot('', false)).toMatchSnapshot()
        })

        it('should return false when iOS and nativeWebscreenshot true is provided', () => {
            expect(checkAndroidChromeDriverScreenshot('ios', true)).toMatchSnapshot()
        })

        it('should return false when iOS and nativeWebscreenshot false is provided', () => {
            expect(checkAndroidChromeDriverScreenshot('ios', false)).toMatchSnapshot()
        })

        it('should return false when Android and nativeWebscreenshot true is provided', () => {
            expect(checkAndroidChromeDriverScreenshot('Android', true)).toMatchSnapshot()
        })

        it('should return true when Android and nativeWebscreenshot false is provided ', () => {
            expect(checkAndroidChromeDriverScreenshot('Android', false)).toMatchSnapshot()
        })
    })

    describe('getAddressBarShadowPadding', () => {
        const getAddressBarShadowPaddingOptions = {
            platformName: '',
            browserName: '',
            nativeWebScreenshot: false,
            addressBarShadowPadding: 6,
            addShadowPadding: false,
        }

        it('should return 0 when this is a check for a desktop browser', () => {
            getAddressBarShadowPaddingOptions.browserName = 'chrome'

            expect(getAddressBarShadowPadding(getAddressBarShadowPaddingOptions)).toMatchSnapshot()
        })

        it('should return 0 when this is a check for an Android app', () => {
            getAddressBarShadowPaddingOptions.platformName = 'android'

            expect(getAddressBarShadowPadding(getAddressBarShadowPaddingOptions)).toMatchSnapshot()
        })

        it('should return 0 when this is a check for an iOS app', () => {
            getAddressBarShadowPaddingOptions.platformName = 'ios'

            expect(getAddressBarShadowPadding(getAddressBarShadowPaddingOptions)).toMatchSnapshot()
        })

        it('should return 0 when this is a check for Android with a native screenshot but without adding a shadow padding', () => {
            getAddressBarShadowPaddingOptions.platformName = 'android'
            getAddressBarShadowPaddingOptions.nativeWebScreenshot = true

            expect(getAddressBarShadowPadding(getAddressBarShadowPaddingOptions)).toMatchSnapshot()
        })

        it('should return 0 when this is a check for iOS but without adding a shadow padding', () => {
            getAddressBarShadowPaddingOptions.platformName = 'iOS'
            getAddressBarShadowPaddingOptions.nativeWebScreenshot = true

            expect(getAddressBarShadowPadding(getAddressBarShadowPaddingOptions)).toMatchSnapshot()
        })

        it('should return 6 when this is a check for Android with a native screenshot and adding a shadow padding', () => {
            getAddressBarShadowPaddingOptions.platformName = 'android'
            getAddressBarShadowPaddingOptions.nativeWebScreenshot = true
            getAddressBarShadowPaddingOptions.addShadowPadding = true

            expect(getAddressBarShadowPadding(getAddressBarShadowPaddingOptions)).toMatchSnapshot()
        })

        it('should return 6 when this is a check for iOS and adding a shadow padding', () => {
            getAddressBarShadowPaddingOptions.platformName = 'iOS'
            getAddressBarShadowPaddingOptions.addShadowPadding = true

            expect(getAddressBarShadowPadding(getAddressBarShadowPaddingOptions)).toMatchSnapshot()
        })
    })

    describe('getToolBarShadowPadding', () => {
        it('should return 0 when this is a check for a desktop browser', () => {
            const getToolBarShadowPaddingOptions = {
                platformName: '',
                browserName: 'chrome',
                toolBarShadowPadding: 6,
                addShadowPadding: false,
            }

            expect(getToolBarShadowPadding(getToolBarShadowPaddingOptions)).toMatchSnapshot()
        })

        it('should return 0 when this is a check for an Android app', () => {
            const getToolBarShadowPaddingOptions = {
                platformName: 'Android',
                browserName: '',
                toolBarShadowPadding: 6,
                addShadowPadding: false,
            }

            expect(getToolBarShadowPadding(getToolBarShadowPaddingOptions)).toMatchSnapshot()
        })

        it('should return 0 when this is a check for an iOS app', () => {
            const getToolBarShadowPaddingOptions = {
                platformName: 'iOS',
                browserName: '',
                toolBarShadowPadding: 6,
                addShadowPadding: false,
            }

            expect(getToolBarShadowPadding(getToolBarShadowPaddingOptions)).toMatchSnapshot()
        })

        it('should return 0 when this is a check for an Android app with adding a shadow padding', () => {
            const getToolBarShadowPaddingOptions = {
                platformName: 'android',
                browserName: '',
                toolBarShadowPadding: 6,
                addShadowPadding: true,
            }

            expect(getToolBarShadowPadding(getToolBarShadowPaddingOptions)).toMatchSnapshot()
        })

        it('should return 0 when this is a check for an iOS app with adding a shadow padding', () => {
            const getToolBarShadowPaddingOptions = {
                platformName: 'iOS',
                browserName: '',
                toolBarShadowPadding: 6,
                addShadowPadding: true,
            }

            expect(getToolBarShadowPadding(getToolBarShadowPaddingOptions)).toMatchSnapshot()
        })

        it('should return 0 when this is a check for Android browser and adding a shadow padding', () => {
            const getToolBarShadowPaddingOptions = {
                platformName: 'android',
                browserName: 'chrome',
                toolBarShadowPadding: 6,
                addShadowPadding: true,
            }

            expect(getToolBarShadowPadding(getToolBarShadowPaddingOptions)).toMatchSnapshot()
        })

        it('should return 15 when this is a check for iOS browser and adding a shadow padding', () => {
            const getToolBarShadowPaddingOptions = {
                platformName: 'ios',
                browserName: 'safari',
                toolBarShadowPadding: 6,
                addShadowPadding: true,
            }

            expect(getToolBarShadowPadding(getToolBarShadowPaddingOptions)).toMatchSnapshot()
        })
    })

    describe('calculateDprData', () => {
        it('should multiple all number values by the dpr value', () => {
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

    // @TODO: Need to fix this, for now it broke with Jest 27 with this error
    //   ● utils › waitFor › should wait for an amount of seconds and resolves the promise
    //
    //     expect(received).toHaveBeenCalledTimes(expected)
    //
    //     Matcher error: received value must be a mock or spy function
    //
    //     Received has type:  function
    //     Received has value: [Function setTimeout]
    //
    //       384 |       waitFor(500);
    //       385 |
    //     > 386 |       expect(setTimeout).toHaveBeenCalledTimes(1);
    //           |                          ^
    //       387 |       expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 500);
    //       388 |     });
    //       389 |   });
    //
    //       at Object.<anonymous> (lib/helpers/utils.spec.ts:386:26)

    // describe('waitFor', () => {
    //   jest.useFakeTimers();
    //
    //   it('should wait for an amount of seconds and resolves the promise', () => {
    //     waitFor(500);
    //
    //     expect(setTimeout).toHaveBeenCalledTimes(1);
    //     expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 500);
    //   });
    // });

    describe('getBase64ScreenshotSize', () => {
        it('should get the screenshot size of a screenshot string with the default DPR', () => {
            expect(getBase64ScreenshotSize(IMAGE_STRING)).toMatchSnapshot()
        })

        it('should get the screenshot size of a screenshot string with DRP 2', () => {
            expect(getBase64ScreenshotSize(IMAGE_STRING, 2)).toMatchSnapshot()
        })
    })

    describe('getDevicePixelRatio', () => {
        it('should return 1 when the screenshot width equals device screen width', () => {
            const deviceScreenSize = { width: 32, height: 64 }
            expect(getDevicePixelRatio(IMAGE_STRING, deviceScreenSize)).toMatchSnapshot()
        })

        it('should return 2 when the screenshot width is double the device screen width', () => {
            const deviceScreenSize = { width: 16, height: 32 }
            expect(getDevicePixelRatio(IMAGE_STRING, deviceScreenSize)).toMatchSnapshot()
        })

        it('should round the result to the nearest integer', () => {
            const deviceScreenSize = { width: 17, height: 32 }
            expect(getDevicePixelRatio(IMAGE_STRING, deviceScreenSize)).toMatchSnapshot()
        })
    })

    describe('getIosBezelImageNames', () => {
        const supportedDevices = [
            'iphonex',
            'iphonexs',
            'iphonexsmax',
            'iphonexr',
            'iphone11',
            'iphone11pro',
            'iphone11promax',
            'iphone12',
            'iphone12mini',
            'iphone12pro',
            'iphone12promax',
            'iphone13',
            'iphone13mini',
            'iphone13pro',
            'iphone13promax',
            'iphone14',
            'iphone14plus',
            'iphone14pro',
            'iphone14promax',
            'iphone15',
            'ipadmini',
            'ipadair',
            'ipadpro11',
            'ipadpro129',
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
        it('should return true for a plain object', () => {
            expect(isObject({})).toBe(true)
        })

        it('should return true for a function', () => {
            expect(isObject(() => {})).toBe(true)
        })

        it('should return false for null', () => {
            expect(isObject(null)).toBe(false)
        })

        it('should return false for undefined', () => {
            expect(isObject(undefined)).toBe(false)
        })

        it('should return false for a string', () => {
            expect(isObject('string')).toBe(false)
        })

        it('should return false for a number', () => {
            expect(isObject(123)).toBe(false)
        })

        it('should return false for a boolean', () => {
            expect(isObject(true)).toBe(false)
        })

        it('should return true for an array (since typeof array is object)', () => {
            expect(isObject([])).toBe(true)
        })
    })

    describe('isStorybook', () => {
        const originalArgv = [...process.argv]

        afterEach(() => {
            process.argv = [...originalArgv]
        })

        it('should return true when "--storybook" is in process.argv', () => {
            process.argv.push('--storybook')
            expect(isStorybook()).toBe(true)
        })

        it('should return false when "--storybook" is not in process.argv', () => {
            process.argv = originalArgv.filter(arg => arg !== '--storybook')
            expect(isStorybook()).toBe(false)
        })
    })

    describe('updateVisualBaseline', () => {
        const originalArgv = [...process.argv]

        afterEach(() => {
            process.argv = [...originalArgv]
        })

        it('should return true when "--update-visual-baseline" is in process.argv', () => {
            process.argv.push('--update-visual-baseline')
            expect(updateVisualBaseline()).toBe(true)
        })

        it('should return false when "--update-visual-baseline" is not in process.argv', () => {
            process.argv = originalArgv.filter(arg => arg !== '--update-visual-baseline')
            expect(updateVisualBaseline()).toBe(false)
        })
    })

    describe('getMobileScreenSize', () => {
        let mockBrowser: any

        beforeEach(async () => {
            vi.clearAllMocks()
            const { browser } = await vi.importMock('@wdio/globals') as any
            mockBrowser = browser
        })

        afterEach(() => {
            vi.restoreAllMocks()
        })

        it('returns iOS screen size in portrait', async () => {
            mockBrowser.execute = vi.fn().mockResolvedValue({
                screenSize: { width: 390, height: 844 },
            })
            const currentBrowser = { getOrientation: vi.fn().mockResolvedValue('PORTRAIT') } as any

            const result = await getMobileScreenSize({ currentBrowser, isIOS: true, isNativeContext: true })

            expect(mockBrowser.execute).toHaveBeenCalledWith('mobile: deviceScreenInfo')
            expect(result).toEqual({ width: 390, height: 844 })
        })

        it('returns iOS screen size in landscape', async () => {
            mockBrowser.execute = vi.fn().mockResolvedValue({
                screenSize: { width: 390, height: 844 },
            })
            const currentBrowser = { getOrientation: vi.fn().mockResolvedValue('LANDSCAPE') } as any

            const result = await getMobileScreenSize({ currentBrowser, isIOS: true, isNativeContext: true })

            expect(mockBrowser.execute).toHaveBeenCalledWith('mobile: deviceScreenInfo')
            expect(result).toEqual({ width: 844, height: 390 })
        })

        it('returns Android screen size in portrait', async () => {
            mockBrowser.execute = vi.fn().mockResolvedValue({ realDisplaySize: '1080x2400' })
            const currentBrowser = { getOrientation: vi.fn().mockResolvedValue('PORTRAIT') } as any

            const result = await getMobileScreenSize({ currentBrowser, isIOS: false, isNativeContext: true })

            expect(mockBrowser.execute).toHaveBeenCalledWith('mobile: deviceInfo')
            expect(result).toEqual({ width: 1080, height: 2400 })
        })

        it('falls back for iOS when screenSize is missing (web context)', async () => {
            mockBrowser.execute = vi.fn()
                .mockRejectedValueOnce(new Error('Missing screenSize'))
                .mockResolvedValueOnce({ width: 800, height: 1200 })
            const warnSpy = vi.spyOn(log, 'warn')
            const currentBrowser = {
                getOrientation: vi.fn().mockResolvedValue('PORTRAIT'),
            } as any

            const result = await getMobileScreenSize({ currentBrowser, isIOS: true, isNativeContext: false })

            expect(mockBrowser.execute).toHaveBeenCalledWith('mobile: deviceScreenInfo')
            expect(mockBrowser.execute).toHaveBeenCalledWith(expect.any(Function))
            expect(warnSpy).toHaveBeenCalled()
            expect(result).toEqual({ width: 800, height: 1200 })
        })

        it('falls back for Android when realDisplaySize is invalid (web context)', async () => {
            mockBrowser.execute = vi.fn()
                .mockResolvedValueOnce({ realDisplaySize: 'invalid' })
                .mockResolvedValueOnce({ width: 800, height: 1200 })
            const warnSpy = vi.spyOn(log, 'warn')
            const currentBrowser = {
                getOrientation: vi.fn().mockResolvedValue('PORTRAIT'),
            } as any

            const result = await getMobileScreenSize({ currentBrowser, isIOS: false, isNativeContext: false })

            expect(mockBrowser.execute).toHaveBeenCalledWith('mobile: deviceInfo')
            expect(mockBrowser.execute).toHaveBeenCalledWith(expect.any(Function))
            expect(warnSpy).toHaveBeenCalled()
            expect(result).toEqual({ width: 800, height: 1200 })
        })

        it('falls back to getWindowSize in native context', async () => {
            mockBrowser.execute = vi.fn().mockRejectedValueOnce(new Error('Boom'))
            const warnSpy = vi.spyOn(log, 'warn')
            const currentBrowser = {
                getOrientation: vi.fn().mockResolvedValue('PORTRAIT'),
                getWindowSize: vi.fn().mockResolvedValue({ width: 123, height: 456 })
            } as any

            const result = await getMobileScreenSize({ currentBrowser, isIOS: true, isNativeContext: true })

            expect(mockBrowser.execute).toHaveBeenCalledWith('mobile: deviceScreenInfo')
            expect(currentBrowser.getWindowSize).toHaveBeenCalled()
            expect(result).toEqual({ width: 123, height: 456 })
            expect(warnSpy).toHaveBeenCalled()
        })

        it('returns dimensions in landscape fallback native context', async () => {
            mockBrowser.execute = vi.fn().mockRejectedValueOnce(new Error('Boom'))
            const warnSpy = vi.spyOn(log, 'warn')
            const currentBrowser = {
                getOrientation: vi.fn().mockResolvedValue('LANDSCAPE'),
                getWindowSize: vi.fn().mockResolvedValue({ width: 123, height: 456 })
            } as any

            const result = await getMobileScreenSize({ currentBrowser, isIOS: true, isNativeContext: true })

            expect(mockBrowser.execute).toHaveBeenCalledWith('mobile: deviceScreenInfo')
            expect(currentBrowser.getWindowSize).toHaveBeenCalled()
            expect(result).toEqual({ width: 456, height: 123 })
            expect(warnSpy).toHaveBeenCalled()
        })
    })

    describe('loadBase64Html', () => {
        let mockBrowser: any

        beforeEach(async () => {
            vi.clearAllMocks()
            const { browser } = await vi.importMock('@wdio/globals') as any
            mockBrowser = browser
        })

        afterEach(() => {
            vi.clearAllMocks()
        })

        it('should call browser.execute with blob URL creation for all platforms', async () => {
            mockBrowser.execute = vi.fn()

            await loadBase64Html({ isIOS: false })

            expect(mockBrowser.execute).toHaveBeenCalledTimes(1)
            expect(mockBrowser.execute).toHaveBeenCalledWith(expect.any(Function), expect.any(String))
        })

        it('should call browser.execute with blob URL creation and checkMetaTag for iOS', async () => {
            mockBrowser.execute = vi.fn()

            await loadBase64Html({ isIOS: true })

            expect(mockBrowser.execute).toHaveBeenCalledTimes(2)
            expect(mockBrowser.execute).toHaveBeenNthCalledWith(1, expect.any(Function), expect.any(String))
            expect(mockBrowser.execute).toHaveBeenNthCalledWith(2, checkMetaTag)
        })
    })

    describe('executeNativeClick', () => {
        const coords = { x: 100, y: 200 }

        afterEach(() => {
            vi.clearAllMocks()
        })

        it('should call executor with "mobile: tap" on iOS', async () => {
            const executor = vi.fn()
            await executeNativeClick({ executor, isIOS: true, ...coords })

            expect(executor).toHaveBeenCalledWith('mobile: tap', coords)
        })

        it('should call executor with "mobile: clickGesture" on Android (Appium 2)', async () => {
            const executor = vi.fn()
            await executeNativeClick({ executor, isIOS: false, ...coords })

            expect(executor).toHaveBeenCalledWith('mobile: clickGesture', coords)
        })

        it('should fall back to "doubleClickGesture" when clickGesture fails (Appium 1)', async () => {
            const executor = vi.fn()
                .mockRejectedValueOnce(new Error('WebDriverError: Unknown mobile command: clickGesture'))
                .mockResolvedValueOnce(undefined)
            const logWarnMock = vi.spyOn(log, 'warn')

            await executeNativeClick({ executor, isIOS: false, ...coords })

            expect(executor).toHaveBeenCalledWith('mobile: clickGesture', coords)
            expect(executor).toHaveBeenCalledWith('mobile: doubleClickGesture', coords)
            expect(logWarnMock).toHaveBeenCalledWith(expect.stringContaining('falling back to `doubleClickGesture`'))

            logWarnMock.mockRestore()
        })

        it('should throw the error if it\'s not a known Appium command error', async () => {
            const executor = vi.fn().mockRejectedValueOnce(new Error('Some unexpected error'))

            await expect(executeNativeClick({ executor, isIOS: false, ...coords }))
                .rejects
                .toThrowError('Some unexpected error')
        })
    })

    describe('getMobileViewPortPosition', () => {
        const mockExecutor = vi.fn()
        const mockUrl = vi.fn()
        const mockGetUrl = vi.fn().mockResolvedValue('http://example.com')

        const baseOptions = {
            isAndroid: false,
            isIOS: true,
            isNativeContext: false,
            nativeWebScreenshot: true,
            screenHeight: 800,
            screenWidth: 400,
            methods: {
                executor: mockExecutor,
                url: mockUrl,
                getUrl: mockGetUrl,
            },
        }

        beforeEach(() => {
            vi.clearAllMocks()
        })

        it('should return correct device rectangles for iOS WebView flow', async () => {
            mockExecutor
                .mockResolvedValueOnce(undefined) // executor for the blob (loadBase64Html)
                .mockResolvedValueOnce(undefined) // checkMetaTag (loadBase64Html)
                .mockResolvedValueOnce(undefined) // injectWebviewOverlay
                .mockResolvedValueOnce(undefined) // nativeClick
                .mockResolvedValueOnce({ x: 150, y: 300, width: 100, height: 100 }) // getMobileWebviewClickAndDimensions

            const result = await getMobileViewPortPosition({
                ...baseOptions,
                initialDeviceRectangles: DEVICE_RECTANGLES,
            })

            expect(mockGetUrl).toHaveBeenCalled()
            expect(mockUrl).toHaveBeenCalledTimes(1)
            expect(mockExecutor).toHaveBeenCalledWith(injectWebviewOverlay, false)
            expect(mockExecutor).toHaveBeenCalledWith(getMobileWebviewClickAndDimensions, '[data-test="ics-overlay"]')

            expect(result).toMatchSnapshot()
        })

        it('should return initialDeviceRectangles if not WebView (native context)', async () => {
            const result = await getMobileViewPortPosition({
                ...baseOptions,
                isNativeContext: true,
                initialDeviceRectangles: DEVICE_RECTANGLES,
            })

            expect(result).toEqual(DEVICE_RECTANGLES)
            expect(mockExecutor).not.toHaveBeenCalled()
        })

        it('should return initialDeviceRectangles if Android + not nativeWebScreenshot', async () => {
            const result = await getMobileViewPortPosition({
                ...baseOptions,
                isAndroid: true,
                isIOS: false,
                nativeWebScreenshot: false,
                initialDeviceRectangles: DEVICE_RECTANGLES,
            })

            expect(result).toEqual(DEVICE_RECTANGLES)
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

        it('should only return deprecated keys when full config is provided', () => {
            const fullOptions: ClassOptions = {
                addressBarShadowPadding: 10,
                autoElementScroll: true,
                addIOSBezelCorners: false,
                clearRuntimeFolder: false,
                userBasedFullPageScreenshot: false,
                enableLegacyScreenshotMethod: false,
                formatImageName: 'test',
                isHybridApp: false,
                savePerInstance: true,
                toolBarShadowPadding: 5,
                waitForFontsLoaded: true,
                autoSaveBaseline: true,
                screenshotPath: './screenshots',
                baselineFolder: './baseline',
                disableBlinkingCursor: false,
                disableCSSAnimation: false,
                enableLayoutTesting: true,
                fullPageScrollTimeout: 500,
                hideScrollBars: true,
                storybook: { url: 'http://localhost:6006' },

                // Add deprecated keys mixed in
                ...allDeprecatedOptions
            }

            const result = logAllDeprecatedCompareOptions(fullOptions)
            expect(result).toEqual(allDeprecatedOptions)
        })
    })

    describe('getMethodOrWicOption', () => {
        const defaultOptions = {
            foo: 'bar',
            count: 42,
            isEnabled: true,
        }

        it('should return value from method if defined', () => {
            const method = { foo: 'baz' }

            const result = getMethodOrWicOption(method, defaultOptions, 'foo')
            expect(result).toBe('baz')
        })

        it('should return value from wic if method is undefined', () => {
            const result = getMethodOrWicOption(undefined, defaultOptions, 'count')
            expect(result).toBe(42)
        })

        it('should return value from wic if key in method is undefined', () => {
            const method = { foo: undefined }

            const result = getMethodOrWicOption(method, defaultOptions, 'foo')
            expect(result).toBe('bar')
        })

        it('should return boolean value from method if defined', () => {
            const method = { isEnabled: false }

            const result = getMethodOrWicOption(method, defaultOptions, 'isEnabled')
            expect(result).toBe(false)
        })

        it('should return value from wic for a missing key in method', () => {
            const method = {}

            const result = getMethodOrWicOption(method, defaultOptions, 'count')
            expect(result).toBe(42)
        })
    })

    describe('canUseBidiScreenshot', () => {
        let mockBrowser: any

        beforeEach(async () => {
            vi.clearAllMocks()
            const { browser } = await vi.importMock('@wdio/globals') as any
            mockBrowser = browser
        })

        it('should return true when both browsingContextCaptureScreenshot and getWindowHandle are functions', () => {
            mockBrowser.browsingContextCaptureScreenshot = vi.fn()
            mockBrowser.getWindowHandle = vi.fn()

            expect(canUseBidiScreenshot()).toBe(true)
        })

        it('should return false if browsingContextCaptureScreenshot is missing', () => {
            mockBrowser.browsingContextCaptureScreenshot = undefined
            mockBrowser.getWindowHandle = vi.fn()

            expect(canUseBidiScreenshot()).toBe(false)
        })

        it('should return false if getWindowHandle is missing', () => {
            mockBrowser.browsingContextCaptureScreenshot = vi.fn()
            mockBrowser.getWindowHandle = undefined

            expect(canUseBidiScreenshot()).toBe(false)
        })

        it('should return false if both are missing', () => {
            mockBrowser.browsingContextCaptureScreenshot = undefined
            mockBrowser.getWindowHandle = undefined

            expect(canUseBidiScreenshot()).toBe(false)
        })

        it('should return false if either is not a function', () => {
            mockBrowser.browsingContextCaptureScreenshot = 'notAFunction'
            mockBrowser.getWindowHandle = vi.fn()

            expect(canUseBidiScreenshot()).toBe(false)
        })
    })

    describe('getBooleanOption', () => {
        it('should return the boolean value when property exists', () => {
            const options: ClassOptions = { autoElementScroll: true }
            const result = getBooleanOption(options, 'autoElementScroll', false)
            expect(result).toBe(true)
        })

        it('should return the default value when property does not exist', () => {
            const options: ClassOptions = {}
            // Test the hasOwnProperty check directly
            const hasProperty = Object.prototype.hasOwnProperty.call(options, 'disableBlinkingCursor')
            expect(hasProperty).toBe(false) // This should be false since the property doesn't exist

            const result = getBooleanOption(options, 'disableBlinkingCursor', true)
            expect(result).toBe(true)
        })

        it('should convert truthy values to true', () => {
            const options: ClassOptions = { autoElementScroll: 'truthy' as any }
            const result = getBooleanOption(options, 'autoElementScroll', false)
            expect(result).toBe(true)
        })

        it('should convert falsy values to false', () => {
            const options: ClassOptions = { autoElementScroll: 0 as any }
            const result = getBooleanOption(options, 'autoElementScroll', true)
            expect(result).toBe(false)
        })

        it('should return default when property is undefined', () => {
            const options: ClassOptions = { autoElementScroll: undefined }
            const result = getBooleanOption(options, 'autoElementScroll', true)
            expect(result).toBe(true)
        })

        it('should return default when property is null', () => {
            const options: ClassOptions = { autoElementScroll: null as any }
            const result = getBooleanOption(options, 'autoElementScroll', false)
            expect(result).toBe(false)
        })
    })

    describe('createConditionalProperty', () => {
        it('should return an object with the property when condition is true', () => {
            const result = createConditionalProperty(true, 'testKey', 'testValue')
            expect(result).toEqual({ testKey: 'testValue' })
        })

        it('should return an empty object when condition is false', () => {
            const result = createConditionalProperty(false, 'testKey', 'testValue')
            expect(result).toEqual({})
        })

        it('should handle different value types', () => {
            const numberResult = createConditionalProperty(true, 'number', 42)
            expect(numberResult).toEqual({ number: 42 })

            const booleanResult = createConditionalProperty(true, 'boolean', false)
            expect(booleanResult).toEqual({ boolean: false })

            const objectResult = createConditionalProperty(true, 'object', { nested: 'value' })
            expect(objectResult).toEqual({ object: { nested: 'value' } })
        })

        it('should handle undefined and null values', () => {
            const undefinedResult = createConditionalProperty(true, 'undefined', undefined)
            expect(undefinedResult).toEqual({ undefined: undefined })

            const nullResult = createConditionalProperty(true, 'null', null)
            expect(nullResult).toEqual({ null: null })
        })

        it('should always return empty object when condition is false regardless of value', () => {
            expect(createConditionalProperty(false, 'key', 'value')).toEqual({})
            expect(createConditionalProperty(false, 'key', null)).toEqual({})
            expect(createConditionalProperty(false, 'key', undefined)).toEqual({})
            expect(createConditionalProperty(false, 'key', { complex: 'object' })).toEqual({})
        })
    })

})
