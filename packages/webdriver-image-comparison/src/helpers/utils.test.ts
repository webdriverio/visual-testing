import { describe, it, expect, afterEach } from 'vitest'
import { pathExistsSync, removeSync } from 'fs-extra'
import { join } from 'node:path'
import {
    calculateDprData,
    checkAndroidChromeDriverScreenshot,
    checkAndroidNativeWebScreenshot,
    checkIsAndroid,
    checkIsIos,
    checkIsMobile,
    checkTestInBrowser,
    checkTestInMobileBrowser,
    formatFileName,
    getAddressBarShadowPadding,
    getAndCreatePath,
    getScreenshotSize,
    getToolBarShadowPadding,
} from './utils.js'
import type { FormatFileNameOptions, GetAndCreatePathOptions } from './utils.interfaces.js'
import { IMAGE_STRING } from '../mocks/mocks.js'

describe('utils', () => {
    describe('getAndCreatePath', () => {
        const folder = join(process.cwd(), '/.tmp/utils')

        afterEach(() => removeSync(folder))

        it('should create the folder and return the folder name for a device that needs to have its own folder', () => {
            const options: GetAndCreatePathOptions = {
                browserName: '',
                deviceName: 'deviceName',
                isMobile: true,
                savePerInstance: true,
            }
            const expectedFolderName = join(folder, options.deviceName)

            expect(pathExistsSync(expectedFolderName)).toMatchSnapshot()
            expect(getAndCreatePath(folder, options)).toEqual(expectedFolderName)
            expect(pathExistsSync(expectedFolderName)).toMatchSnapshot()
        })

        it('should create the folder and return the folder name for a browser that needs to have its own folder', () => {
            const options: GetAndCreatePathOptions = {
                browserName: 'browser',
                deviceName: '',
                isMobile: false,
                savePerInstance: true,
            }
            const expectedFolderName = join(folder, `desktop_${options.browserName}`)

            expect(pathExistsSync(expectedFolderName)).toMatchSnapshot()
            expect(getAndCreatePath(folder, options)).toEqual(expectedFolderName)
            expect(pathExistsSync(expectedFolderName)).toMatchSnapshot()
        })

        it('should create the folder and return the folder name for a browser', () => {
            const options: GetAndCreatePathOptions = {
                browserName: 'browser',
                deviceName: '',
                isMobile: false,
                savePerInstance: false,
            }

            expect(pathExistsSync(folder)).toMatchSnapshot()
            expect(getAndCreatePath(folder, options)).toEqual(folder)
            expect(pathExistsSync(folder)).toMatchSnapshot()
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

    describe('getScreenshotSize', () => {
        it('should get the screenshot size of a screenshot string with the default DPR', () => {
            expect(getScreenshotSize(IMAGE_STRING)).toMatchSnapshot()
        })

        it('should get the screenshot size of a screenshot string with DRP 2', () => {
            expect(getScreenshotSize(IMAGE_STRING, 2)).toMatchSnapshot()
        })
    })
})
