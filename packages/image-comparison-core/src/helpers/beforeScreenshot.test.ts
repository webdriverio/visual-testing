import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'
import logger from '@wdio/logger'
import beforeScreenshot from './beforeScreenshot.js'
import hideScrollBars from '../clientSideScripts/hideScrollbars.js'
import hideRemoveElements from '../clientSideScripts/hideRemoveElements.js'
import setCustomCss from '../clientSideScripts/setCustomCss.js'
import toggleTextTransparency from '../clientSideScripts/toggleTextTransparency.js'
import waitForFonts from '../clientSideScripts/waitForFonts.js'
import { CUSTOM_CSS_ID } from './constants.js'
import type { BeforeScreenshotOptions } from './beforeScreenshot.interfaces.js'

const log = logger('test')

vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))

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
    let logDebugSpy: ReturnType<typeof vi.spyOn>
    let logWarnSpy: ReturnType<typeof vi.spyOn>

    // Helper function to create mock browser instance with custom properties
    const createMockBrowserInstance = (
        mockExecuteFn = vi.fn().mockResolvedValue(''),
        customProperties: Partial<WebdriverIO.Browser> = {}
    ) => {
        return {
            execute: mockExecuteFn,
            ...customProperties
        } as unknown as WebdriverIO.Browser
    }

    beforeEach(() => {
        // Set up log spies
        logDebugSpy = vi.spyOn(log, 'debug').mockImplementation(() => {})
        logWarnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.clearAllMocks()
        logDebugSpy.mockRestore()
        logWarnSpy.mockRestore()
    })

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

    const createOptions = (overrides: Partial<BeforeScreenshotOptions> = {}): BeforeScreenshotOptions => ({
        instanceData: baseInstanceData,
        ...baseOptions,
        ...overrides,
    })

    it('should be able to return the enriched instance data with default options', async () => {
        const mockBrowserInstance = createMockBrowserInstance()
        const options = createOptions()

        expect(await beforeScreenshot(mockBrowserInstance, options)).toMatchSnapshot()
    })

    it('should be able to return the enriched instance data with `addShadowPadding: true`', async () => {
        const mockBrowserInstance = createMockBrowserInstance()
        const options = createOptions({
            disableBlinkingCursor: true,
            disableCSSAnimation: true,
            noScrollBars: true,
            hideElements: [<HTMLElement>(<any>'<div></div>')],
            removeElements: [<HTMLElement>(<any>'<div></div>')],
            waitForFontsLoaded: true,
        })

        expect(await beforeScreenshot(mockBrowserInstance, options, true)).toMatchSnapshot()
    })

    it('should handle waitForFontsLoaded functionality', async () => {
        const mockBrowserInstance = createMockBrowserInstance()
        const options = createOptions({
            waitForFontsLoaded: true,
        })

        await beforeScreenshot(mockBrowserInstance, options)

        expect(mockBrowserInstance.execute).toHaveBeenCalledWith(waitForFonts)
    })

    it('should handle waitForFontsLoaded error gracefully and log debug message', async () => {
        const fontError = new Error('Font load error')
        const mockExecute = vi.fn().mockRejectedValue(fontError)
        const mockBrowserInstance = createMockBrowserInstance(mockExecute)

        const options = createOptions({
            waitForFontsLoaded: true,
        })

        await beforeScreenshot(mockBrowserInstance, options)

        expect(mockBrowserInstance.execute).toHaveBeenCalledWith(waitForFonts)
        expect(logDebugSpy).toHaveBeenCalledWith('Waiting for fonts to load threw an error:', fontError)
    })

    it('should handle noScrollBars option', async () => {
        const mockBrowserInstance = createMockBrowserInstance()
        const options = createOptions({
            noScrollBars: true,
        })

        await beforeScreenshot(mockBrowserInstance, options)

        expect(mockBrowserInstance.execute).toHaveBeenCalledWith(hideScrollBars, true)
    })

    it('should handle hide and remove elements', async () => {
        const mockBrowserInstance = createMockBrowserInstance()
        const hideElements = [<HTMLElement>(<any>'<div></div>')]
        const removeElements = [<HTMLElement>(<any>'<span></span>')]

        const options = createOptions({
            hideElements,
            removeElements,
        })

        await beforeScreenshot(mockBrowserInstance, options)

        expect(mockBrowserInstance.execute).toHaveBeenCalledWith(hideRemoveElements, { hide: hideElements, remove: removeElements }, true)
    })

    it('should handle hide/remove elements error gracefully and log warning', async () => {
        const elementError = new Error('Element not found')
        const mockExecute = vi.fn().mockRejectedValue(elementError)
        const mockBrowserInstance = createMockBrowserInstance(mockExecute)

        const hideElements = [<HTMLElement>(<any>'<div></div>')]
        const options = createOptions({
            hideElements,
        })

        await beforeScreenshot(mockBrowserInstance, options)

        expect(mockBrowserInstance.execute).toHaveBeenCalledWith(hideRemoveElements, { hide: hideElements, remove: [] }, true)
        expect(logWarnSpy).toHaveBeenCalledWith(
            '\x1b[33m%s\x1b[0m',
            `
#####################################################################################
 WARNING:
 (One of) the elements that needed to be hidden or removed could not be found on the
 page and caused this error
 Error: ${elementError}
 We made sure the test didn't break.
#####################################################################################
`
        )
    })

    it('should handle CSS customization for desktop', async () => {
        const mockBrowserInstance = createMockBrowserInstance()
        const options = createOptions({
            disableBlinkingCursor: true,
            disableCSSAnimation: true,
            addressBarShadowPadding: 10,
            toolBarShadowPadding: 15,
        })

        await beforeScreenshot(mockBrowserInstance, options)

        expect(mockBrowserInstance.execute).toHaveBeenCalledWith(setCustomCss, {
            addressBarPadding: 0, // Should be 0 for desktop with addShadowPadding false
            disableBlinkingCursor: true,
            disableCSSAnimation: true,
            id: CUSTOM_CSS_ID,
            toolBarPadding: 0, // Should be 0 for desktop with addShadowPadding false
        })
    })

    it('should handle CSS customization for mobile platform', async () => {
        const mockBrowserInstance = createMockBrowserInstance(undefined, { isAndroid: true, isIOS: false, isMobile: true })
        const options = createOptions({
            instanceData: {
                ...baseInstanceData,
                platformName: 'Android',
                isAndroid: true,
                isMobile: true,
            },
        })

        await beforeScreenshot(mockBrowserInstance, options)

        expect(mockBrowserInstance.execute).toHaveBeenCalledWith(setCustomCss, {
            addressBarPadding: 0,
            disableBlinkingCursor: false,
            disableCSSAnimation: false,
            id: CUSTOM_CSS_ID,
            toolBarPadding: 0,
        })
    })

    it('should handle layout testing', async () => {
        const mockBrowserInstance = createMockBrowserInstance()
        const options = createOptions({
            enableLayoutTesting: true,
        })

        await beforeScreenshot(mockBrowserInstance, options)

        expect(mockBrowserInstance.execute).toHaveBeenCalledWith(toggleTextTransparency, true)
    })

    it('should handle layout testing with addShadowPadding', async () => {
        const mockBrowserInstance = createMockBrowserInstance()
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

        await beforeScreenshot(mockBrowserInstance, options, true)

        expect(mockBrowserInstance.execute).toHaveBeenCalledWith(toggleTextTransparency, true)
    })

    it('should not execute browser commands when no options are enabled', async () => {
        const mockBrowserInstance = createMockBrowserInstance()
        const options = createOptions()

        await beforeScreenshot(mockBrowserInstance, options)

        // Should only call the instanceData mock, no browser execute calls
        expect(mockBrowserInstance.execute).not.toHaveBeenCalled()
        expect(logDebugSpy).not.toHaveBeenCalled()
        expect(logWarnSpy).not.toHaveBeenCalled()
    })

    it('should handle multiple options simultaneously', async () => {
        const mockBrowserInstance = createMockBrowserInstance()
        const hideElements = [<HTMLElement>(<any>'<div></div>')]
        const options = createOptions({
            waitForFontsLoaded: true,
            noScrollBars: true,
            hideElements,
            disableBlinkingCursor: true,
            enableLayoutTesting: true,
        })

        await beforeScreenshot(mockBrowserInstance, options)

        expect(mockBrowserInstance.execute).toHaveBeenCalledWith(waitForFonts)
        expect(mockBrowserInstance.execute).toHaveBeenCalledWith(hideScrollBars, true)
        expect(mockBrowserInstance.execute).toHaveBeenCalledWith(hideRemoveElements, { hide: hideElements, remove: [] }, true)
        expect(mockBrowserInstance.execute).toHaveBeenCalledWith(setCustomCss, expect.any(Object))
        expect(mockBrowserInstance.execute).toHaveBeenCalledWith(toggleTextTransparency, true)
    })

    it('should handle multiple errors and log both debug and warning messages', async () => {
        const fontError = new Error('Font load error')
        const elementError = new Error('Element not found')

        const mockExecute = vi.fn()
            .mockRejectedValueOnce(fontError) // waitForFonts
            .mockRejectedValueOnce(elementError) // hideRemoveElements
        const mockBrowserInstance = createMockBrowserInstance(mockExecute)

        const options = createOptions({
            waitForFontsLoaded: true,
            hideElements: [<HTMLElement>(<any>'<div></div>')],
        })

        await beforeScreenshot(mockBrowserInstance, options)

        expect(logDebugSpy).toHaveBeenCalledWith('Waiting for fonts to load threw an error:', fontError)
        expect(logWarnSpy).toHaveBeenCalledWith(
            '\x1b[33m%s\x1b[0m',
            `
#####################################################################################
 WARNING:
 (One of) the elements that needed to be hidden or removed could not be found on the
 page and caused this error
 Error: ${elementError}
 We made sure the test didn't break.
#####################################################################################
`
        )
    })

    it('should handle custom browser properties when needed', async () => {
        const mockBrowserInstance = createMockBrowserInstance(undefined, {
            getWindowSize: vi.fn().mockResolvedValue({ width: 1920, height: 1080 }),
            getOrientation: vi.fn().mockResolvedValue('LANDSCAPE')
        })

        const options = createOptions()

        await beforeScreenshot(mockBrowserInstance, options)

        // This test demonstrates that custom properties are available if needed
        expect(mockBrowserInstance.getWindowSize).toBeDefined()
        expect(mockBrowserInstance.getOrientation).toBeDefined()
    })
})
