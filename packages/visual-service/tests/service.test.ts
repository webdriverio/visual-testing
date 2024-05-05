import { join } from 'node:path'
import logger from '@wdio/logger'
import { expect as wdioExpect } from '@wdio/globals'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import VisualService from '../src/index.js'

const log = logger('test')
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))
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
vi.mock('@wdio/globals', async () => ({
    expect: {
        extend: vi.fn()
    }
}))

describe('@wdio/visual-service', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe('remoteSetup', () => {
        it('should call the before hook when using the remoteSetup method', async () => {
            const service = new VisualService({}, {}, {} as unknown as WebdriverIO.Config)
            const browser = { addCommand: vi.fn(), capabilities: {}, requestedCapabilities: {} } as any as WebdriverIO.Browser
            const spy = vi.spyOn(service, 'before')

            await service.remoteSetup(browser as any)

            expect(spy).toHaveBeenCalledWith(browser.capabilities, [], browser)

            spy.mockRestore()
        })
    })

    describe('before', () => {
        let service
        let browser
        let browserInstance
        const commands = ['saveElement', 'checkElement', 'saveScreen', 'saveFullPageScreen', 'saveTabbablePage', 'checkScreen', 'checkFullPageScreen', 'checkTabbablePage']

        beforeEach(() => {
            service = new VisualService({}, {}, {} as unknown as WebdriverIO.Config)
            browser = {
                isMultiremote: false,
                addCommand: vi.fn((name, fn) => {
                    browser[name] = fn
                }),
                capabilities: {},
                requestedCapabilities: {}
            } as any as WebdriverIO.Browser
            browserInstance = {
                addCommand: vi.fn((name, fn) => {
                    browserInstance[name] = fn
                }),
                capabilities: {},
                requestedCapabilities: {}
            }
        })

        it('adds command to normal browser in before hook', async () => {
            await service.before({}, [], browser)
            expect(browser.addCommand).toHaveBeenCalledTimes(commands.length)
            commands.forEach(command => {
                expect(browser.addCommand).toHaveBeenCalledWith(command, expect.any(Function))
            })
        })

        it('adds command to multiremote browser in before hook', async () => {
            browser.isMultiremote = true
            browser.getInstances = vi.fn().mockReturnValue(['chrome', 'firefox'])
            browser.getInstance = vi.fn().mockReturnValue(browserInstance)

            await service.before({
                'chrome': { capabilities: {} },
                'firefox': { capabilities: {} }
            } as any, [], browser)

            expect(browser.addCommand).toHaveBeenCalledTimes(commands.length)
            commands.forEach(command => {
                expect(browser.addCommand).toHaveBeenCalledWith(command, expect.any(Function))
                expect(browserInstance.addCommand).toHaveBeenCalledWith(command, expect.any(Function))
            })
            expect(browserInstance.addCommand).toHaveBeenCalledTimes(commands.length * 2)
        })

        it('should register custom matchers', async () => {
            const service = new VisualService({}, {}, {} as unknown as WebdriverIO.Config)
            const browser = {
                isMultiremote: false,
                addCommand: vi.fn(),
                capabilities: {},
                requestedCapabilities: {}
            } as any as WebdriverIO.Browser

            await service.before({}, [], browser)

            expect(wdioExpect.extend).toBeCalledTimes(1)
        })

        it('should fail registering custom matchers', async () => {
            const extendMock = vi.fn(() => {
                throw new Error('Expect package not found')
            })
            vi.mocked(wdioExpect.extend).mockImplementationOnce(extendMock)
            const service = new VisualService({}, {}, {} as unknown as WebdriverIO.Config)
            const browser = {
                isMultiremote: false,
                addCommand: vi.fn(),
                capabilities: {},
                requestedCapabilities: {}
            } as any as WebdriverIO.Browser

            await service.before({}, [], browser)

            expect(log.warn).toMatchSnapshot()
        })
    })

    describe('afterCommand', () => {
        it('should set _isNativeContext to true when dealing with a native app', () => {
            const service = new VisualService({}, {}, {} as unknown as WebdriverIO.Config)
            service.afterCommand('getContext', [], 'NATIVE_APP', undefined)

            // @ts-ignore
            expect(service._isNativeContext).toBe(true)
        })

        it('should set _isNativeContext to false when not dealing with a native app', () => {
            const service = new VisualService({}, {}, {} as unknown as WebdriverIO.Config)
            service.afterCommand('getContext', [], 'WEBVIEW', undefined)

            // @ts-ignore
            expect(service._isNativeContext).toBe(false)
        })
    })
})
