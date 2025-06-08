import { describe, it, expect, vi } from 'vitest'
import beforeScreenshot from './beforeScreenshot.js'
import hideScrollBars from '../clientSideScripts/hideScrollbars.js'
import hideRemoveElements from '../clientSideScripts/hideRemoveElements.js'
import setCustomCss from '../clientSideScripts/setCustomCss.js'
import toggleTextTransparency from '../clientSideScripts/toggleTextTransparency.js'
import waitForFonts from '../clientSideScripts/waitForFonts.js'
import { CUSTOM_CSS_ID } from './constants.js'

vi.mock('@wdio/globals', () => ({
    browser: {
        execute: () => Promise.resolve()
    }
}))

vi.mock('../methods/instanceData.js', () => ({
    default: vi.fn().mockResolvedValue({
        appName: 'mocked-app',
        browserName: 'mocked-browser',
        devicePixelRatio: 1,
        isAndroid: false,
        isIOS: false,
        isMobile: false,
        platformName: 'mocked-platform',
    })
}))

describe('beforeScreenshot', () => {
    // Helper function to create mock browser with execute function
    const createMockBrowser = async (mockExecuteFn = vi.fn().mockResolvedValue('')) => {
        const mockBrowser = await vi.importMock('@wdio/globals') as any
        mockBrowser.browser.execute = mockExecuteFn
        return mockExecuteFn
    }

    // Base instance data that is common across tests
    const baseInstanceData = {
        appName: 'appName',
        browserName: 'browserName',
        browserVersion: 'browserVersion',
        deviceName: 'deviceName',
        devicePixelRatio: 1,
        logName: 'logName',
        deviceRectangles: {
            bottomBar: { y: 0, x: 0, width: 0, height: 0 },
            homeBar: { x: 0, y: 0, width: 0, height: 0 },
            leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
            rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
            screenSize: { height: 1, width: 1 },
            statusBar: { x: 0, y: 0, width: 0, height: 0 },
            statusBarAndAddressBar: { y: 0, x: 0, width: 0, height: 0 },
            viewport: { y: 0, x: 0, width: 0, height: 0 },
        },
        isAndroid: false,
        isIOS: false,
        isMobile: false,
        name: 'name',
        nativeWebScreenshot: false,
        platformName: 'platformName',
        platformVersion: 'platformVersion',
        initialDevicePixelRatio: 1,
    }

    const baseOptions = {
        addressBarShadowPadding: 6,
        disableBlinkingCursor: false,
        disableCSSAnimation: false,
        enableLayoutTesting: false,
        noScrollBars: false,
        toolBarShadowPadding: 6,
        hideElements: [],
        removeElements: [],
        waitForFontsLoaded: false,
    }

    const createOptions = (overrides = {}) => ({
        instanceData: baseInstanceData,
        ...baseOptions,
        ...overrides,
    })
    it('should be able to return the enriched instance data with default options', async () => {
        const options = createOptions()

        expect(await beforeScreenshot(options)).toMatchSnapshot()
    })

    it('should be able to return the enriched instance data with `addShadowPadding: true`', async () => {
        const options = createOptions({
            disableBlinkingCursor: true,
            disableCSSAnimation: true,
            noScrollBars: true,
            hideElements: [<HTMLElement>(<any>'<div></div>')],
            removeElements: [<HTMLElement>(<any>'<div></div>')],
            waitForFontsLoaded: true,
        })

        expect(await beforeScreenshot(options, true)).toMatchSnapshot()
    })

    it('should handle waitForFontsLoaded functionality', async () => {
        const mockExecute = await createMockBrowser()
        const options = createOptions({
            waitForFontsLoaded: true,
        })

        await beforeScreenshot(options)

        expect(mockExecute).toHaveBeenCalledWith(waitForFonts)
    })

    it('should handle waitForFontsLoaded error gracefully', async () => {
        const mockExecute = await createMockBrowser(vi.fn().mockRejectedValueOnce(new Error('Font load error')))
        const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})

        const options = createOptions({
            waitForFontsLoaded: true,
        })

        await beforeScreenshot(options)

        expect(mockExecute).toHaveBeenCalledWith(waitForFonts)
        consoleSpy.mockRestore()
    })

    it('should handle noScrollBars option', async () => {
        const mockExecute = await createMockBrowser()
        const options = createOptions({
            noScrollBars: true,
        })

        await beforeScreenshot(options)

        expect(mockExecute).toHaveBeenCalledWith(hideScrollBars, true)
    })

    it('should handle hide and remove elements', async () => {
        const mockExecute = await createMockBrowser()
        const hideElements = [<HTMLElement>(<any>'<div></div>')]
        const removeElements = [<HTMLElement>(<any>'<span></span>')]

        const options = createOptions({
            hideElements,
            removeElements,
        })

        await beforeScreenshot(options)

        expect(mockExecute).toHaveBeenCalledWith(hideRemoveElements, { hide: hideElements, remove: removeElements }, true)
    })

    it('should handle hide/remove elements error gracefully', async () => {
        const mockExecute = await createMockBrowser(vi.fn().mockRejectedValueOnce(new Error('Element not found')))
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const hideElements = [<HTMLElement>(<any>'<div></div>')]
        const options = createOptions({
            hideElements,
        })

        await beforeScreenshot(options)

        expect(mockExecute).toHaveBeenCalledWith(hideRemoveElements, { hide: hideElements, remove: [] }, true)
        consoleSpy.mockRestore()
    })

    it('should handle CSS customization for desktop', async () => {
        const mockExecute = await createMockBrowser()
        const options = createOptions({
            disableBlinkingCursor: true,
            disableCSSAnimation: true,
            addressBarShadowPadding: 10,
            toolBarShadowPadding: 15,
        })

        await beforeScreenshot(options)

        expect(mockExecute).toHaveBeenCalledWith(setCustomCss, {
            addressBarPadding: 0, // Should be 0 for desktop with addShadowPadding false
            disableBlinkingCursor: true,
            disableCSSAnimation: true,
            id: CUSTOM_CSS_ID,
            toolBarPadding: 0, // Should be 0 for desktop with addShadowPadding false
        })
    })

    it('should handle CSS customization for mobile platform', async () => {
        const mockExecute = await createMockBrowser()
        const options = createOptions({
            instanceData: {
                ...baseInstanceData,
                platformName: 'Android',
                isAndroid: true,
                isMobile: true,
            },
        })

        await beforeScreenshot(options)

        expect(mockExecute).toHaveBeenCalledWith(setCustomCss, {
            addressBarPadding: 0,
            disableBlinkingCursor: false,
            disableCSSAnimation: false,
            id: CUSTOM_CSS_ID,
            toolBarPadding: 0,
        })
    })

    it('should handle layout testing', async () => {
        const mockExecute = await createMockBrowser()
        const options = createOptions({
            enableLayoutTesting: true,
        })

        await beforeScreenshot(options)

        expect(mockExecute).toHaveBeenCalledWith(toggleTextTransparency, true)
    })

    it('should handle layout testing with addShadowPadding', async () => {
        const mockExecute = await createMockBrowser()
        const options = createOptions({
            enableLayoutTesting: true,
            instanceData: {
                ...baseInstanceData,
                browserName: 'Safari',
                platformName: 'iOS',
                isIOS: true,
                isMobile: true,
            },
        })

        await beforeScreenshot(options, true)

        expect(mockExecute).toHaveBeenCalledWith(toggleTextTransparency, true)
    })
})
