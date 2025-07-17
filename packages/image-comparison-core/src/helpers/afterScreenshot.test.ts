import { join } from 'node:path'
import logger from '@wdio/logger'
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import afterScreenshot from './afterScreenshot.js'
import hideScrollBars from '../clientSideScripts/hideScrollbars.js'
import hideRemoveElements from '../clientSideScripts/hideRemoveElements.js'
import removeElementFromDom from '../clientSideScripts/removeElementFromDom.js'
import toggleTextTransparency from '../clientSideScripts/toggleTextTransparency.js'
import { CUSTOM_CSS_ID } from './constants.js'

const log = logger('test')

vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))

vi.mock('../methods/images.js', () => ({
    saveBase64Image: vi.fn()
}))

vi.mock('./utils.js', () => ({
    getAndCreatePath: vi.fn(),
    formatFileName: vi.fn()
}))

import { saveBase64Image } from '../methods/images.js'
import { getAndCreatePath, formatFileName } from './utils.js'

describe('afterScreenshot', () => {
    const mockPath = '/mocked/path'
    const mockFileName = 'mocked-file-name.png'

    afterEach(() => {
        vi.clearAllMocks()
    })

    beforeEach(() => {
        vi.mocked(getAndCreatePath).mockReturnValue(mockPath)
        vi.mocked(formatFileName).mockReturnValue(mockFileName)
    })

    const createMockBrowserInstance = (
        mockExecuteFn = vi.fn().mockResolvedValue(''),
        customProperties: Partial<WebdriverIO.Browser> = {}
    ) => {
        return {
            execute: mockExecuteFn,
            ...customProperties
        } as unknown as WebdriverIO.Browser
    }
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
        actualFolder: mockPath,
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

        const result = await afterScreenshot(mockBrowserInstance, options)

        expect(vi.mocked(getAndCreatePath)).toHaveBeenCalledWith(mockPath, options.filePath)
        expect(vi.mocked(formatFileName)).toHaveBeenCalledWith(options.fileName)
        expect(vi.mocked(saveBase64Image)).toHaveBeenCalledWith(options.base64Image, join(mockPath, mockFileName))

        expect(result).toMatchSnapshot()
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
            isNativeContext: true,
            hideElements: [<HTMLElement>(<any>'<div></div>')],
            platformName: 'iOS',
            removeElements: [<HTMLElement>(<any>'<div></div>')],
        })

        const result = await afterScreenshot(mockBrowserInstance, options)

        expect(vi.mocked(getAndCreatePath)).toHaveBeenCalledWith(mockPath, options.filePath)
        expect(vi.mocked(formatFileName)).toHaveBeenCalledWith(options.fileName)
        expect(vi.mocked(saveBase64Image)).toHaveBeenCalledWith(options.base64Image, join(mockPath, mockFileName))
        expect(mockBrowserInstance.execute).not.toHaveBeenCalled()
        expect(result).toMatchSnapshot()
    })

    it('should handle layout testing with enableLayoutTesting', async () => {
        const mockExecute = vi.fn().mockResolvedValue('')
        const mockBrowserInstance = createMockBrowserInstance(mockExecute)
        const options = createBaseOptions({
            enableLayoutTesting: true,
        })
        const result = await afterScreenshot(mockBrowserInstance, options)

        expect(vi.mocked(getAndCreatePath)).toHaveBeenCalledWith(mockPath, options.filePath)
        expect(vi.mocked(formatFileName)).toHaveBeenCalledWith(options.fileName)
        expect(vi.mocked(saveBase64Image)).toHaveBeenCalledWith(options.base64Image, join(mockPath, mockFileName))
        expect(mockExecute).toHaveBeenCalledWith(toggleTextTransparency, false)
        expect(result).toMatchSnapshot()
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
            platformName: 'Android',
        })
        const result = await afterScreenshot(mockBrowserInstance, options)

        expect(vi.mocked(getAndCreatePath)).toHaveBeenCalledWith(mockPath, options.filePath)
        expect(vi.mocked(formatFileName)).toHaveBeenCalledWith(options.fileName)
        expect(vi.mocked(saveBase64Image)).toHaveBeenCalledWith(options.base64Image, join(mockPath, mockFileName))
        expect(mockExecute).toHaveBeenCalledWith(removeElementFromDom, CUSTOM_CSS_ID)
        expect(result).toMatchSnapshot()
    })

    it('should handle hide/remove elements with error handling', async () => {
        const mockExecute = vi.fn().mockRejectedValueOnce(new Error('Element not found'))
        const mockBrowserInstance = createMockBrowserInstance(mockExecute)
        const hideElements = [<HTMLElement>(<any>'<div></div>')]
        const removeElements = [<HTMLElement>(<any>'<div></div>')]
        const options = createBaseOptions({
            hideElements,
            removeElements,
        })
        const result = await afterScreenshot(mockBrowserInstance, options)

        expect(vi.mocked(getAndCreatePath)).toHaveBeenCalledWith(mockPath, options.filePath)
        expect(vi.mocked(formatFileName)).toHaveBeenCalledWith(options.fileName)
        expect(vi.mocked(saveBase64Image)).toHaveBeenCalledWith(options.base64Image, join(mockPath, mockFileName))
        expect(mockExecute).toHaveBeenCalledWith(hideRemoveElements, { hide: hideElements, remove: removeElements }, false)
        expect(log.warn).toHaveBeenCalledTimes(1)
        expect(vi.mocked(log.warn).mock.calls[0]).toMatchSnapshot()
        expect(result).toMatchSnapshot()
    })

    it('should handle hideScrollBars when hideScrollBars is true', async () => {
        const mockExecute = vi.fn().mockResolvedValue('')
        const mockBrowserInstance = createMockBrowserInstance(mockExecute)
        const options = createBaseOptions({
            hideScrollBars: true,
        })
        const result = await afterScreenshot(mockBrowserInstance, options)
        expect(vi.mocked(getAndCreatePath)).toHaveBeenCalledWith(mockPath, options.filePath)
        expect(vi.mocked(formatFileName)).toHaveBeenCalledWith(options.fileName)
        expect(vi.mocked(saveBase64Image)).toHaveBeenCalledWith(options.base64Image, join(mockPath, mockFileName))
        expect(mockExecute).toHaveBeenCalledWith(hideScrollBars, false)
        expect(result).toMatchSnapshot()
    })

    it('should skip hide/remove elements when both are empty arrays', async () => {
        const mockExecute = vi.fn().mockResolvedValue('')
        const mockBrowserInstance = createMockBrowserInstance(mockExecute)
        const options = createBaseOptions({
            hideElements: [],
            removeElements: [],
        })
        const result = await afterScreenshot(mockBrowserInstance, options)

        expect(vi.mocked(getAndCreatePath)).toHaveBeenCalledWith(mockPath, options.filePath)
        expect(vi.mocked(formatFileName)).toHaveBeenCalledWith(options.fileName)
        expect(vi.mocked(saveBase64Image)).toHaveBeenCalledWith(options.base64Image, join(mockPath, mockFileName))
        expect(mockExecute).not.toHaveBeenCalledWith(hideRemoveElements, expect.any(Object), false)
        expect(result).toMatchSnapshot()
    })

    it('should skip hide/remove elements when both are falsy', async () => {
        const mockExecute = vi.fn().mockResolvedValue('')
        const mockBrowserInstance = createMockBrowserInstance(mockExecute)
        const options = createBaseOptions({
            hideElements: undefined,
            removeElements: null,
        })
        const result = await afterScreenshot(mockBrowserInstance, options)

        expect(vi.mocked(getAndCreatePath)).toHaveBeenCalledWith(mockPath, options.filePath)
        expect(vi.mocked(formatFileName)).toHaveBeenCalledWith(options.fileName)
        expect(vi.mocked(saveBase64Image)).toHaveBeenCalledWith(options.base64Image, join(mockPath, mockFileName))
        expect(mockExecute).not.toHaveBeenCalledWith(hideRemoveElements, expect.any(Object), false)
        expect(result).toMatchSnapshot()
    })

    it('should handle only hideElements with length > 0', async () => {
        const mockExecute = vi.fn().mockResolvedValue('')
        const mockBrowserInstance = createMockBrowserInstance(mockExecute)
        const hideElements = [<HTMLElement>(<any>'<div></div>')]
        const options = createBaseOptions({
            hideElements,
            removeElements: [],
        })
        const result = await afterScreenshot(mockBrowserInstance, options)

        expect(vi.mocked(getAndCreatePath)).toHaveBeenCalledWith(mockPath, options.filePath)
        expect(vi.mocked(formatFileName)).toHaveBeenCalledWith(options.fileName)
        expect(vi.mocked(saveBase64Image)).toHaveBeenCalledWith(options.base64Image, join(mockPath, mockFileName))
        expect(mockExecute).toHaveBeenCalledWith(hideRemoveElements, { hide: hideElements, remove: [] }, false)
        expect(result).toMatchSnapshot()
    })

    it('should handle only removeElements with length > 0', async () => {
        const mockExecute = vi.fn().mockResolvedValue('')
        const mockBrowserInstance = createMockBrowserInstance(mockExecute)
        const removeElements = [<HTMLElement>(<any>'<div></div>')]
        const options = createBaseOptions({
            hideElements: null,
            removeElements,
        })
        const result = await afterScreenshot(mockBrowserInstance, options)

        expect(vi.mocked(getAndCreatePath)).toHaveBeenCalledWith(mockPath, options.filePath)
        expect(vi.mocked(formatFileName)).toHaveBeenCalledWith(options.fileName)
        expect(vi.mocked(saveBase64Image)).toHaveBeenCalledWith(options.base64Image, join(mockPath, mockFileName))
        expect(mockExecute).toHaveBeenCalledWith(hideRemoveElements, { hide: null, remove: removeElements }, false)
        expect(result).toMatchSnapshot()
    })
})
