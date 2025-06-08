import { describe, it, expect, vi } from 'vitest'
import getEnrichedInstanceData from './instanceData.js'
import { DEVICE_RECTANGLES, NOT_KNOWN } from '../helpers/constants.js'

vi.mock('@wdio/globals', () => ({
    browser: {
        execute: () => Promise.resolve({
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
    }
}))

describe('getEnrichedInstanceData', () => {
    // Base instance options that are common across tests
    const baseInstanceOptions = {
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

    const createInstanceOptions = (overrides = {}) => ({
        ...baseInstanceOptions,
        ...overrides,
    })
    it('should be able to enrich the instance data with all the defaults for desktop with no shadow padding', async () => {
        const instanceOptions = createInstanceOptions()

        expect(await getEnrichedInstanceData(instanceOptions, false)).toMatchSnapshot()
    })

    it('should be able to enrich the instance data with all the defaults for Android ChromeDriver with no shadow padding', async () => {
        const instanceOptions = createInstanceOptions({
            platformName: 'Android',
            platformVersion: '8.0',
            isAndroid: true,
            isMobile: true,
        })

        expect(await getEnrichedInstanceData(instanceOptions, false)).toMatchSnapshot()
    })

    it('should be able to enrich the instance data with all the defaults for Android Native Webscreenshot with no shadow padding', async () => {
        const instanceOptions = createInstanceOptions({
            nativeWebScreenshot: true,
            platformName: 'Android',
            platformVersion: '8.0',
            isAndroid: true,
            isMobile: true,
        })

        expect(await getEnrichedInstanceData(instanceOptions, false)).toMatchSnapshot()
    })

    it('should be able to enrich the instance data with all the defaults for iOS with shadow padding', async () => {
        const instanceOptions = createInstanceOptions({
            platformName: 'iOS',
            platformVersion: '12.4',
            isIOS: true,
            isMobile: true,
        })

        expect(await getEnrichedInstanceData(instanceOptions, true)).toMatchSnapshot()
    })

    it('should handle test in mobile browser scenario', async () => {
        const instanceOptions = createInstanceOptions({
            browserName: 'Chrome',
            platformName: 'Android',
            platformVersion: '11.0',
            isAndroid: true,
            isMobile: true,
        })

        expect(await getEnrichedInstanceData(instanceOptions, false)).toMatchSnapshot()
    })

    it('should handle native context without browserName', async () => {
        const instanceOptions = createInstanceOptions({
            browserName: '',
            platformName: 'iOS',
            platformVersion: '15.0',
            isIOS: true,
            isMobile: true,
        })

        expect(await getEnrichedInstanceData(instanceOptions, false)).toMatchSnapshot()
    })

    it('should handle case-insensitive platform names', async () => {
        const instanceOptions = createInstanceOptions({
            platformName: 'ANDROID',
            platformVersion: '12.0',
            isAndroid: true,
            isMobile: true,
        })

        expect(await getEnrichedInstanceData(instanceOptions, true)).toMatchSnapshot()
    })

    it('should handle unknown platform name', async () => {
        const instanceOptions = createInstanceOptions({
            platformName: 'Windows',
            platformVersion: '10',
        })

        expect(await getEnrichedInstanceData(instanceOptions, false)).toMatchSnapshot()
    })

    it('should handle Android with shadow padding enabled', async () => {
        const instanceOptions = createInstanceOptions({
            browserName: 'Chrome',
            nativeWebScreenshot: true,
            platformName: 'Android',
            platformVersion: '10.0',
            isAndroid: true,
            isMobile: true,
        })

        expect(await getEnrichedInstanceData(instanceOptions, true)).toMatchSnapshot()
    })

    it('should handle iOS home bar padding calculation', async () => {
        const instanceOptions = createInstanceOptions({
            browserName: 'Safari',
            platformName: 'iOS',
            platformVersion: '16.0',
            toolBarShadowPadding: 10,
            isIOS: true,
            isMobile: true,
        })

        expect(await getEnrichedInstanceData(instanceOptions, true)).toMatchSnapshot()
    })
})
