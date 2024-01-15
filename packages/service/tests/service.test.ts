import { describe, expect, it, vi } from 'vitest'
import { expect as wdioExpect } from '@wdio/globals'

import VisualService from '../src/index.js'

vi.mock('webdriver-image-comparison', () => ({
    BaseClass: class {},
    checkElement: vi.fn(),
    checkFullPageScreen: vi.fn(),
    checkScreen: vi.fn(),
    saveElement: vi.fn(),
    saveFullPageScreen: vi.fn(),
    saveScreen: vi.fn(),
    saveTabbablePage: vi.fn(),
    checkTabbablePage: vi.fn(),
}))

vi.mock('@wdio/globals', () => ({
    expect: {
        extend: vi.fn()
    }
}))

describe('@wdio/visual-service', () => {
    it('should register custom matchers', async () => {
        const service = new VisualService({})
        const browser = {
            isMultiremote: false,
            addCommand: vi.fn(),
            requestedCapabilities: {}
        } as any as WebdriverIO.Browser
        await service.before({}, [], browser)
        expect(wdioExpect.extend).toBeCalledTimes(1)
    })

    it('adds command to normal browser in before hook', async () => {
        const service = new VisualService({})
        const browser = {
            isMultiremote: false,
            addCommand: vi.fn(),
            requestedCapabilities: {}
        } as any as WebdriverIO.Browser
        await service.before({}, [], browser)
        expect(browser.addCommand).toHaveBeenCalledTimes(8)
        expect(browser.addCommand).toHaveBeenCalledWith('saveElement', expect.any(Function))
        expect(browser.addCommand).toHaveBeenCalledWith('checkElement', expect.any(Function))
        expect(browser.addCommand).toHaveBeenCalledWith('saveScreen', expect.any(Function))
        expect(browser.addCommand).toHaveBeenCalledWith('saveFullPageScreen', expect.any(Function))
        expect(browser.addCommand).toHaveBeenCalledWith('saveTabbablePage', expect.any(Function))
        expect(browser.addCommand).toHaveBeenCalledWith('checkScreen', expect.any(Function))
        expect(browser.addCommand).toHaveBeenCalledWith('checkFullPageScreen', expect.any(Function))
        expect(browser.addCommand).toHaveBeenCalledWith('checkTabbablePage', expect.any(Function))
    })

    it('adds command to multiremote browser in before hook', async () => {
        const service = new VisualService({})
        const browserInstance = {
            addCommand: vi.fn(),
            requestedCapabilities: {}
        }
        const browser = {
            isMultiremote: true,
            addCommand: vi.fn(),
            getInstances: vi.fn().mockReturnValue(['chrome', 'firefox']),
            getInstance: vi.fn().mockReturnValue(browserInstance)
        } as any as WebdriverIO.MultiRemoteBrowser
        await service.before({
            'chrome': { capabilities: {} },
            'firefox': { capabilities: {} }
        } as any, [], browser)
        expect(browser.addCommand).toHaveBeenCalledTimes(8)
        expect(browser.addCommand).toHaveBeenCalledWith('saveElement', expect.any(Function))
        expect(browser.addCommand).toHaveBeenCalledWith('checkElement', expect.any(Function))
        expect(browser.addCommand).toHaveBeenCalledWith('saveScreen', expect.any(Function))
        expect(browser.addCommand).toHaveBeenCalledWith('saveFullPageScreen', expect.any(Function))
        expect(browser.addCommand).toHaveBeenCalledWith('saveTabbablePage', expect.any(Function))
        expect(browser.addCommand).toHaveBeenCalledWith('checkScreen', expect.any(Function))
        expect(browser.addCommand).toHaveBeenCalledWith('checkFullPageScreen', expect.any(Function))
        expect(browser.addCommand).toHaveBeenCalledWith('checkTabbablePage', expect.any(Function))
        expect(browserInstance.addCommand).toHaveBeenCalledTimes(16)
        expect(browserInstance.addCommand).toHaveBeenCalledWith('saveElement', expect.any(Function))
        expect(browserInstance.addCommand).toHaveBeenCalledWith('checkElement', expect.any(Function))
        expect(browserInstance.addCommand).toHaveBeenCalledWith('saveScreen', expect.any(Function))
        expect(browserInstance.addCommand).toHaveBeenCalledWith('saveFullPageScreen', expect.any(Function))
        expect(browserInstance.addCommand).toHaveBeenCalledWith('saveTabbablePage', expect.any(Function))
        expect(browserInstance.addCommand).toHaveBeenCalledWith('checkScreen', expect.any(Function))
        expect(browserInstance.addCommand).toHaveBeenCalledWith('checkFullPageScreen', expect.any(Function))
        expect(browserInstance.addCommand).toHaveBeenCalledWith('checkTabbablePage', expect.any(Function))
    })
})
