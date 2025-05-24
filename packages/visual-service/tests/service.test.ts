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
    DEFAULT_TEST_CONTEXT: {},
    NOT_KNOWN: 'not_known',
    DEVICE_RECTANGLES: {
        bottomBar: { y: 0, x: 0, width: 0, height: 0 },
        homeBar: { y: 0, x: 0, width: 0, height: 0 },
        leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
        rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
        statusBar: { y: 0, x: 0, width: 0, height: 0 },
        statusBarAndAddressBar: { y: 0, x: 0, width: 0, height: 0 },
        screenSize: { width: 0, height: 0 },
        viewport: { y: 0, x: 0, width: 0, height: 0 },
    },
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
            const browser = {
                addCommand: vi.fn(),
                capabilities: {},
                requestedCapabilities: {},
                on: vi.fn(),
                execute: vi.fn().mockResolvedValue(1),
            } as any as WebdriverIO.Browser
            const spy = vi.spyOn(service, 'before')

            await service.remoteSetup(browser as any)

            expect(spy).toHaveBeenCalledWith(browser.capabilities, [], browser)

            spy.mockRestore()
        })
    })

    describe('before', () => {
        let service: VisualService
        let browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
        let browserInstance: WebdriverIO.Browser
        let chromeInstance
        let firefoxInstance
        const commands = ['saveElement', 'checkElement', 'saveScreen', 'saveFullPageScreen', 'saveTabbablePage', 'checkScreen', 'checkFullPageScreen', 'checkTabbablePage', 'waitForStorybookComponentToBeLoaded']

        beforeEach(() => {
            service = new VisualService({}, {}, {} as unknown as WebdriverIO.Config)
            chromeInstance = {
                addCommand: vi.fn(),
                capabilities: {},
                requestedCapabilities: {},
                on: vi.fn()
            }
            firefoxInstance = {
                addCommand: vi.fn(),
                capabilities: {},
                requestedCapabilities: {},
                on: vi.fn()
            }
            browser = {
                isMultiremote: false,
                addCommand: vi.fn((name, fn) => {
                    // @ts-expect-error
                    browser[name] = fn
                }),
                capabilities: {},
                requestedCapabilities: {},
                instances: ['chrome', 'firefox'],
                getInstance: vi.fn().mockReturnValue(browserInstance),
                chrome: chromeInstance,
                firefox: firefoxInstance,
                on: vi.fn(), execute: vi.fn().mockResolvedValue(1),
            } as any as WebdriverIO.Browser
            // @ts-expect-error
            browserInstance = {
                addCommand: vi.fn((name, fn) => {
                    // @ts-expect-error
                    browserInstance[name] = fn
                }),
                capabilities: {},
                requestedCapabilities: {},
                on: vi.fn()
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
            // @ts-expect-error
            browser.getInstances = vi.fn().mockReturnValue(['chrome', 'firefox'])
            // @ts-expect-error
            browser.getInstance = vi.fn().mockReturnValue(browserInstance)
            browserInstance.execute = vi.fn().mockResolvedValue(1)

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
                requestedCapabilities: {},
                on: vi.fn(),
                execute: vi.fn().mockResolvedValue(1),
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
                requestedCapabilities: {},
                on: vi.fn(),
                execute: vi.fn().mockResolvedValue(1),
            } as any as WebdriverIO.Browser

            await service.before({}, [], browser)

            expect(log.warn).toMatchSnapshot()
        })
    })
})
