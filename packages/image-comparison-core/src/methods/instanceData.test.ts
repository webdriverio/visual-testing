import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import getEnrichedInstanceData from './instanceData.js'
import { DEVICE_RECTANGLES, NOT_KNOWN } from '../helpers/constants.js'
import type { InstanceOptions } from './instanceData.interfaces.js'

describe('getEnrichedInstanceData', () => {
    let mockBrowserInstance: WebdriverIO.Browser
    let mockExecute: ReturnType<typeof vi.fn>

    beforeEach(() => {
        mockExecute = vi.fn().mockResolvedValue({
            dimensions: {
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
            }
        })

        mockBrowserInstance = {
            execute: mockExecute
        } as unknown as WebdriverIO.Browser
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

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
    const createInstanceOptions = (overrides: Partial<InstanceOptions> = {}): InstanceOptions => ({
        ...baseInstanceOptions,
        ...overrides,
    })

    it('should be able to enrich the instance data with all the defaults for desktop with no shadow padding', async () => {
        const instanceOptions = createInstanceOptions()
        const result = await getEnrichedInstanceData(mockBrowserInstance, instanceOptions, false)

        expect(result).toMatchSnapshot()
        expect(mockExecute).toHaveBeenCalledWith(expect.any(Function), false)
    })

    it('should be able to enrich the instance data with all the defaults for Android ChromeDriver with no shadow padding', async () => {
        const instanceOptions = createInstanceOptions({
            platformName: 'Android',
            platformVersion: '8.0',
            isAndroid: true,
            isMobile: true,
        })
        const result = await getEnrichedInstanceData(mockBrowserInstance, instanceOptions, false)

        expect(result).toMatchSnapshot()
        expect(mockExecute).toHaveBeenCalledWith(expect.any(Function), true) // isMobile = true
    })

    it('should be able to enrich the instance data with all the defaults for Android Native Webscreenshot with no shadow padding', async () => {
        const instanceOptions = createInstanceOptions({
            nativeWebScreenshot: true,
            platformName: 'Android',
            platformVersion: '8.0',
            isAndroid: true,
            isMobile: true,
        })
        const result = await getEnrichedInstanceData(mockBrowserInstance, instanceOptions, false)

        expect(result).toMatchSnapshot()
        expect(mockExecute).toHaveBeenCalledWith(expect.any(Function), true) // isMobile = true
    })

    it('should be able to enrich the instance data with all the defaults for iOS with shadow padding', async () => {
        const instanceOptions = createInstanceOptions({
            platformName: 'iOS',
            platformVersion: '12.4',
            isIOS: true,
            isMobile: true,
        })
        const result = await getEnrichedInstanceData(mockBrowserInstance, instanceOptions, true)

        expect(result).toMatchSnapshot()
        expect(mockExecute).toHaveBeenCalledWith(expect.any(Function), true) // isMobile = true
    })

    it('should handle test in mobile browser scenario', async () => {
        const instanceOptions = createInstanceOptions({
            browserName: 'Chrome',
            platformName: 'Android',
            platformVersion: '11.0',
            isAndroid: true,
            isMobile: true,
        })
        const result = await getEnrichedInstanceData(mockBrowserInstance, instanceOptions, false)

        expect(result).toMatchSnapshot()
        expect(mockExecute).toHaveBeenCalledWith(expect.any(Function), true) // isMobile = true
    })

    it('should handle native context without browserName', async () => {
        const instanceOptions = createInstanceOptions({
            browserName: '',
            platformName: 'iOS',
            platformVersion: '15.0',
            isIOS: true,
            isMobile: true,
        })
        const result = await getEnrichedInstanceData(mockBrowserInstance, instanceOptions, false)

        expect(result).toMatchSnapshot()
        expect(mockExecute).toHaveBeenCalledWith(expect.any(Function), true) // isMobile = true
    })

    it('should handle case-insensitive platform names', async () => {
        const instanceOptions = createInstanceOptions({
            platformName: 'ANDROID',
            platformVersion: '12.0',
            isAndroid: true,
            isMobile: true,
        })
        const result = await getEnrichedInstanceData(mockBrowserInstance, instanceOptions, true)

        expect(result).toMatchSnapshot()
        expect(mockExecute).toHaveBeenCalledWith(expect.any(Function), true) // isMobile = true
    })

    it('should handle unknown platform name', async () => {
        const instanceOptions = createInstanceOptions({
            platformName: 'Windows',
            platformVersion: '10',
        })
        const result = await getEnrichedInstanceData(mockBrowserInstance, instanceOptions, false)

        expect(result).toMatchSnapshot()
        expect(mockExecute).toHaveBeenCalledWith(expect.any(Function), false) // isMobile = false
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
        const result = await getEnrichedInstanceData(mockBrowserInstance, instanceOptions, true)

        expect(result).toMatchSnapshot()
        expect(mockExecute).toHaveBeenCalledWith(expect.any(Function), true) // isMobile = true
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
        const result = await getEnrichedInstanceData(mockBrowserInstance, instanceOptions, true)

        expect(result).toMatchSnapshot()
        expect(mockExecute).toHaveBeenCalledWith(expect.any(Function), true) // isMobile = true
    })

    it('should handle different screen dimensions', async () => {
        mockExecute.mockResolvedValueOnce({
            dimensions: {
                body: {
                    offsetHeight: 100,
                    scrollHeight: 2000,
                },
                html: {
                    clientHeight: 1080,
                    clientWidth: 1920,
                    offsetHeight: 1080,
                    scrollHeight: 2000,
                    scrollWidth: 1920,
                },
                window: {
                    devicePixelRatio: 2,
                    isEmulated: true,
                    innerHeight: 1080,
                    innerWidth: 1920,
                    outerHeight: 1080,
                    outerWidth: 1920,
                    screenHeight: 1080,
                    screenWidth: 1920,
                },
            }
        })

        const instanceOptions = createInstanceOptions({
            devicePixelRatio: 2,
        })
        const result = await getEnrichedInstanceData(mockBrowserInstance, instanceOptions, false)

        expect(result).toBeDefined()
        expect(result.dimensions.window.devicePixelRatio).toBe(2)
        expect(result.dimensions.window.isEmulated).toBe(true)
    })

    it('should handle browser execute failure gracefully', async () => {
        mockExecute.mockRejectedValueOnce(new Error('Failed to get screen dimensions'))

        const instanceOptions = createInstanceOptions()

        await expect(getEnrichedInstanceData(mockBrowserInstance, instanceOptions, false))
            .rejects.toThrow('Failed to get screen dimensions')
    })
})
