import { describe, it, expect, vi } from 'vitest'
import getEnrichedInstanceData from './instanceData.js'
import { DEVICE_RECTANGLES, NOT_KNOWN } from '../helpers/constants.js'

describe('getEnrichedInstanceData', () => {
    it('should be able to enrich the instance data with all the defaults for desktop with no shadow padding', async () => {
        const instanceOptions = {
            addressBarShadowPadding: 6,
            toolBarShadowPadding: 6,
            browserName: 'browserName',
            browserVersion: 'browserVersion',
            deviceName: 'deviceName',
            logName: 'logName',
            name: 'name',
            nativeWebScreenshot: false,
            platformName: 'platformName',
            platformVersion: 'platformVersion',
            // Defaults
            appName: NOT_KNOWN,
            devicePixelRatio: 1,
            deviceRectangles: DEVICE_RECTANGLES,
            initialDevicePixelRatio: 1,
            isAndroid: false,
            isIOS: false,
            isMobile: false,
        }
        const MOCKED_EXECUTOR = vi
            .fn()
            // getEnrichedInstanceData for: getScreenDimensions
            .mockResolvedValueOnce({
                body: {
                    offsetHeight: 0,
                    scrollHeight: 0,
                },
                html: {
                    clientHeight: 0,
                    clientWidth: 0,
                    offsetHeight: 0,
                    scrollHeight: 0,
                    scrollWidth: 0,
                },
                window: {
                    devicePixelRatio: 1,
                    isEmulated: false,
                    innerHeight: 768,
                    innerWidth: 1024,
                    outerHeight: 768,
                    outerWidth: 1024,
                    screenHeight: 0,
                    screenWidth: 0,
                },
            })

        expect(await getEnrichedInstanceData(MOCKED_EXECUTOR, instanceOptions, false)).toMatchSnapshot()
    })

    it('should be able to enrich the instance data with all the defaults for Android ChromeDriver with no shadow padding', async () => {
        const instanceOptions = {
            addressBarShadowPadding: 6,
            toolBarShadowPadding: 6,
            browserName: 'browserName',
            browserVersion: 'browserVersion',
            deviceName: 'deviceName',
            logName: 'logName',
            name: 'name',
            nativeWebScreenshot: false,
            platformName: 'Android',
            platformVersion: '8.0',
            // Defaults
            appName: NOT_KNOWN,
            devicePixelRatio: 1,
            deviceRectangles: DEVICE_RECTANGLES,
            initialDevicePixelRatio: 1,
            isAndroid: true,
            isIOS: false,
            isMobile: true,
        }
        const MOCKED_EXECUTOR = vi
            .fn()
            // getEnrichedInstanceData for: getScreenDimensions
            .mockResolvedValueOnce({
                body: {
                    offsetHeight: 0,
                    scrollHeight: 0,
                },
                html: {
                    clientHeight: 0,
                    clientWidth: 0,
                    offsetHeight: 0,
                    scrollHeight: 0,
                    scrollWidth: 0,
                },
                window: {
                    devicePixelRatio: 1,
                    isEmulated: false,
                    innerHeight: 768,
                    innerWidth: 1024,
                    outerHeight: 768,
                    outerWidth: 1024,
                    screenHeight: 0,
                    screenWidth: 0,
                },
            })

        expect(await getEnrichedInstanceData(MOCKED_EXECUTOR, instanceOptions, false)).toMatchSnapshot()
    })

    it('should be able to enrich the instance data with all the defaults for Android Native Webscreenshot with no shadow padding', async () => {
        const instanceOptions = {
            addressBarShadowPadding: 6,
            toolBarShadowPadding: 6,
            browserName: 'browserName',
            browserVersion: 'browserVersion',
            deviceName: 'deviceName',
            logName: 'logName',
            name: 'name',
            nativeWebScreenshot: true,
            platformName: 'Android',
            platformVersion: '8.0',
            // Defaults
            appName: NOT_KNOWN,
            devicePixelRatio: 1,
            deviceRectangles: DEVICE_RECTANGLES,
            initialDevicePixelRatio: 1,
            isAndroid: true,
            isIOS: false,
            isMobile: true,
        }
        const MOCKED_EXECUTOR = vi
            .fn()
            // getEnrichedInstanceData for: getScreenDimensions
            .mockResolvedValueOnce({
                body: {
                    offsetHeight: 0,
                    scrollHeight: 0,
                },
                html: {
                    clientHeight: 0,
                    clientWidth: 0,
                    offsetHeight: 0,
                    scrollHeight: 0,
                    scrollWidth: 0,
                },
                window: {
                    devicePixelRatio: 1,
                    isEmulated: false,
                    innerHeight: 768,
                    innerWidth: 1024,
                    outerHeight: 768,
                    outerWidth: 1024,
                    screenHeight: 0,
                    screenWidth: 0,
                },
            })

        expect(await getEnrichedInstanceData(MOCKED_EXECUTOR, instanceOptions, false)).toMatchSnapshot()
    })

    it('should be able to enrich the instance data with all the defaults for iOS with shadow padding', async () => {
        const instanceOptions = {
            addressBarShadowPadding: 6,
            toolBarShadowPadding: 6,
            browserName: 'browserName',
            browserVersion: 'browserVersion',
            deviceName: 'deviceName',
            logName: 'logName',
            name: 'name',
            nativeWebScreenshot: false,
            platformName: 'iOS',
            platformVersion: '12.4',
            // Defaults
            appName: NOT_KNOWN,
            devicePixelRatio: 1,
            deviceRectangles: DEVICE_RECTANGLES,
            initialDevicePixelRatio: 1,
            isAndroid: false,
            isIOS: true,
            isMobile: true,
        }
        const MOCKED_EXECUTOR = vi
            .fn()
            // getEnrichedInstanceData for: getScreenDimensions
            .mockResolvedValueOnce({
                body: {
                    offsetHeight: 0,
                    scrollHeight: 0,
                },
                html: {
                    clientHeight: 0,
                    clientWidth: 0,
                    offsetHeight: 0,
                    scrollHeight: 0,
                    scrollWidth: 0,
                },
                window: {
                    devicePixelRatio: 1,
                    isEmulated: false,
                    innerHeight: 768,
                    innerWidth: 1024,
                    outerHeight: 768,
                    outerWidth: 1024,
                    screenHeight: 0,
                    screenWidth: 0,
                },
            })

        expect(await getEnrichedInstanceData(MOCKED_EXECUTOR, instanceOptions, true)).toMatchSnapshot()
    })
})
