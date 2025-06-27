import { join } from 'node:path'
import { describe, it, expect, afterEach, vi } from 'vitest'
import afterScreenshot from './afterScreenshot.js'
import { rmSync } from 'node:fs'
import hideScrollBars from '../clientSideScripts/hideScrollbars.js'
import hideRemoveElements from '../clientSideScripts/hideRemoveElements.js'
import removeElementFromDom from '../clientSideScripts/removeElementFromDom.js'
import toggleTextTransparency from '../clientSideScripts/toggleTextTransparency.js'
import { CUSTOM_CSS_ID } from './constants.js'

vi.mock('../methods/images.js', () => ({
    saveBase64Image: vi.fn()
}))

describe('afterScreenshot', () => {
    const folder = join(process.cwd(), '/.tmp/afterScreenshot')

    afterEach(() => rmSync(folder, { recursive: true, force: true }))

    // Helper function to create mock browser instance with execute function
    const createMockBrowserInstance = (
        mockExecuteFn = vi.fn().mockResolvedValue(''),
        customProperties: Partial<WebdriverIO.Browser> = {}
    ) => {
        return {
            execute: mockExecuteFn,
            ...customProperties
        } as unknown as WebdriverIO.Browser
    }

    // Base options that are common across tests
    const baseFilePath = {
        browserName: 'browserName',
        deviceName: 'deviceName',
        isMobile: false,
        savePerInstance: true,
    }

    const baseFileName = {
        browserName: 'browserName',
        browserVersion: 'browserVersion',
        deviceName: 'deviceName',
        devicePixelRatio: 2,
        formatImageName: '{tag}-{browserName}-{width}x{height}-dpr-{dpr}',
        isMobile: false,
        isTestInBrowser: true,
        logName: 'logName',
        name: 'name',
        outerHeight: 850,
        outerWidth: 1400,
        platformName: 'platformName',
        platformVersion: 'platformVersion',
        screenHeight: 900,
        screenWidth: 1440,
        tag: 'tag',
    }

    const createBaseOptions = (overrides = {}) => ({
        actualFolder: folder,
        base64Image: 'string',
        filePath: baseFilePath,
        fileName: baseFileName,
        hideScrollBars: false,
        isLandscape: false,
        isNativeContext: false,
        platformName: '',
        ...overrides,
    })

    it('should be able to return the ScreenshotOutput with default options', async () => {
        const mockBrowserInstance = createMockBrowserInstance()
        const options = createBaseOptions({
            disableBlinkingCursor: false,
            disableCSSAnimation: false,
            hideScrollBars: true,
            hideElements: [<HTMLElement>(<any>'<div></div>')],
            removeElements: [<HTMLElement>(<any>'<div></div>')],
        })

        expect(await afterScreenshot(mockBrowserInstance, options)).toMatchSnapshot()
    })

    it('should handle native context and skip browser operations', async () => {
        const mockBrowserInstance = createMockBrowserInstance()
        const options = createBaseOptions({
            disableBlinkingCursor: true,
            disableCSSAnimation: true,
            enableLayoutTesting: true,
            fileName: {
                ...baseFileName,
                devicePixelRatio: 1.5,
                outerHeight: 600,
                outerWidth: 800,
                screenHeight: 700,
                screenWidth: 900,
            },
            hideScrollBars: true,
            isLandscape: true,
            isNativeContext: true, // This should skip all browser operations
            hideElements: [<HTMLElement>(<any>'<div></div>')],
            platformName: 'iOS',
            removeElements: [<HTMLElement>(<any>'<div></div>')],
        })

        expect(await afterScreenshot(mockBrowserInstance, options)).toMatchSnapshot()
    })

    it('should handle layout testing with enableLayoutTesting', async () => {
        const mockExecute = vi.fn().mockResolvedValue('')
        const mockBrowserInstance = createMockBrowserInstance(mockExecute)
        const options = createBaseOptions({
            enableLayoutTesting: true,
        })

        await afterScreenshot(mockBrowserInstance, options)

        // Should call toggleTextTransparency to show text again (enableLayoutTesting = true, so !enableLayoutTesting = false)
        expect(mockExecute).toHaveBeenCalledWith(toggleTextTransparency, false)
    })

    it('should handle mobile platform and remove custom CSS', async () => {
        const mockExecute = vi.fn().mockResolvedValue('')
        const mockBrowserInstance = createMockBrowserInstance(mockExecute, { isMobile: true })
        const options = createBaseOptions({
            disableBlinkingCursor: false,
            disableCSSAnimation: false,
            filePath: {
                ...baseFilePath,
                isMobile: true,
            },
            fileName: {
                ...baseFileName,
                isMobile: true,
                platformName: 'Android',
            },
            platformName: 'Android', // This should trigger CSS removal for mobile platform
        })

        await afterScreenshot(mockBrowserInstance, options)

        // Should call removeElementFromDom with CUSTOM_CSS_ID for mobile platform
        expect(mockExecute).toHaveBeenCalledWith(removeElementFromDom, CUSTOM_CSS_ID)
    })

    it('should handle hide/remove elements with error handling', async () => {
        const mockExecute = vi.fn().mockRejectedValueOnce(new Error('Element not found'))
        const mockBrowserInstance = createMockBrowserInstance(mockExecute)
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const hideElements = [<HTMLElement>(<any>'<div></div>')]
        const removeElements = [<HTMLElement>(<any>'<div></div>')]

        const options = createBaseOptions({
            hideElements,
            removeElements,
        })

        await afterScreenshot(mockBrowserInstance, options)

        // Should call hideRemoveElements with proper parameters and handle error gracefully
        expect(mockExecute).toHaveBeenCalledWith(hideRemoveElements, { hide: hideElements, remove: removeElements }, false)

        consoleSpy.mockRestore()
    })

    it('should handle hideScrollBars when hideScrollBars is true', async () => {
        const mockExecute = vi.fn().mockResolvedValue('')
        const mockBrowserInstance = createMockBrowserInstance(mockExecute)
        const options = createBaseOptions({
            hideScrollBars: true, // This should trigger hideScrollBars call
        })

        await afterScreenshot(mockBrowserInstance, options)

        // Should call hideScrollBars with false to show scrollbars again (hideScrollBars = true, so !hideScrollBars = false)
        expect(mockExecute).toHaveBeenCalledWith(hideScrollBars, false)
    })
})
