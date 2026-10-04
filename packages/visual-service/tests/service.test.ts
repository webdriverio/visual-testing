import { dirname, join, normalize } from 'node:path'
import logger from '@wdio/logger'
import { expect as wdioExpect } from '@wdio/globals'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import VisualService from '../src/index.js'
import { checkScreen, DEVICE_RECTANGLES, getMobileScreenSize, getMobileViewPortPosition, saveScreen } from '@wdio/image-comparison-core'

const log = logger('test')
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))
vi.mock('@wdio/image-comparison-core', () => ({
    BaseClass: class {},
    checkElement: vi.fn(),
    checkFullPageScreen: vi.fn(),
    checkScreen: vi.fn(),
    saveElement: vi.fn(),
    saveFullPageScreen: vi.fn(),
    saveScreen: vi.fn(),
    saveTabbablePage: vi.fn(),
    checkTabbablePage: vi.fn(),
    getMobileScreenSize: vi.fn(),
    getMobileViewPortPosition: vi.fn(),
    IOS_OFFSETS: {},
    DEFAULT_TEST_CONTEXT: {},
    FOLDERS: { ACTUAL: 'actual', DIFF: 'diff', TEMP_FULL_SCREEN: 'tempFullScreen', DEFAULT: { BASE: './__snapshots__/', SCREENSHOTS: '.tmp/' } },
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

        describe('multiremote browser with a web session and a native app session', () => {
            const createInstance = (props: Record<string, unknown>) => {
                const instance: Record<string, any> = {
                    addCommand: vi.fn((name: string, fn: (...args: unknown[]) => unknown) => {
                        instance[name] = fn
                    }),
                    on: vi.fn(),
                    execute: vi.fn().mockResolvedValue(1),
                    ...props,
                }
                return instance
            }
            const createMultiRemoteBrowser = (version: 'v9' | 'v10') => {
                const instances: Record<string, Record<string, any>> = {
                    webInstance: createInstance({
                        isMobile: false,
                        capabilities: { browserName: 'chrome' },
                        requestedCapabilities: { browserName: 'chrome' },
                    }),
                    // The native app session is the last instance
                    appInstance: createInstance({
                        isMobile: true,
                        isAndroid: true,
                        capabilities: { platformName: 'Android' },
                        requestedCapabilities: { platformName: 'Android', 'appium:app': '/path/to/app.apk' },
                    }),
                }
                return {
                    instances,
                    browser: {
                        // WebdriverIO v9 has `isMultiremote` and the instances as properties, v10 has `isMultiRemote`
                        ...(version === 'v10' ? { isMultiRemote: true } : { isMultiremote: true, ...instances }),
                        instances: Object.keys(instances),
                        getInstance: (name: string) => instances[name],
                        addCommand: vi.fn(),
                        capabilities: {},
                        requestedCapabilities: {},
                        on: vi.fn(),
                    } as any as WebdriverIO.MultiRemoteBrowser,
                }
            }

            beforeEach(() => {
                vi.mocked(getMobileScreenSize).mockResolvedValue({ height: 2856, width: 1280 })
                vi.mocked(getMobileViewPortPosition).mockResolvedValue(structuredClone(DEVICE_RECTANGLES))
            })

            it.each(['v9', 'v10'] as const)('uses the context manager of each multiremote instance for its own commands (WebdriverIO %s)', async (version) => {
                const { browser, instances } = createMultiRemoteBrowser(version)
                // Mocked BaseClass does not set defaultOptions/folders; set them so the command can run
                ;(service as any).defaultOptions = {}
                ;(service as any).folders = { baselineFolder: './__snapshots__/' }

                await service.before({
                    webInstance: { capabilities: {} },
                    appInstance: { capabilities: {} },
                } as any, [], browser)
                await instances.webInstance.checkScreen('web-tag')
                await instances.appInstance.checkScreen('app-tag')

                expect(vi.mocked(checkScreen).mock.calls[0][0]).toMatchObject({ tag: 'web-tag', isNativeContext: false })
                expect(vi.mocked(checkScreen).mock.calls[1][0]).toMatchObject({ tag: 'app-tag', isNativeContext: true })
            })
        })

        describe('mobile emulation with mobileEmulation.deviceName', () => {
            const createBrowser = (emulate: ReturnType<typeof vi.fn>) => ({
                addCommand: vi.fn(),
                capabilities: { 'goog:chromeOptions': { mobileEmulation: { deviceName: 'iPhone 12 Pro' } } },
                requestedCapabilities: {},
                on: vi.fn(),
                // A string script is the device pixel ratio of the instance data, a function reads the emulated device
                execute: vi.fn((script: unknown) => Promise.resolve(
                    typeof script === 'function' ? { width: 390, height: 844, devicePixelRatio: 3 } : 1
                )),
                isBidi: true,
                getWindowHandle: vi.fn().mockResolvedValue('context-id'),
                emulate,
                browsingContextSetViewport: vi.fn(),
            } as any as WebdriverIO.Browser)

            it('sets the viewport of the device that the browser emulates when emulate("device") fails (WebdriverIO v10)', async () => {
                const browser = createBrowser(vi.fn().mockRejectedValue(
                    new Error('WebDriver Bidi command "emulation.setTextLayoutModeOverride" failed with error: unknown command')
                ))

                await service.before(browser.capabilities as WebdriverIO.Capabilities, [], browser)

                expect(browser.browsingContextSetViewport).toHaveBeenCalledWith({
                    context: 'context-id',
                    devicePixelRatio: 3,
                    viewport: { width: 390, height: 844 },
                })
            })

            it('reads the emulated device before emulate("device"), which removes it when it fails (WebdriverIO v10)', async () => {
                const browser = createBrowser(vi.fn().mockRejectedValue(new Error('unknown command')))
                // After a failed `emulate('device')`, the browser no longer emulates the device
                let deviceReads = 0
                vi.mocked(browser.execute).mockImplementation(((script: unknown) => Promise.resolve(
                    typeof script !== 'function' ? 1 : (deviceReads++ === 0 && vi.mocked(browser.emulate).mock.calls.length === 0
                        ? { width: 390, height: 844, devicePixelRatio: 3 }
                        : { width: 800, height: 600, devicePixelRatio: 1 })
                )) as any)

                await service.before(browser.capabilities as WebdriverIO.Capabilities, [], browser)

                expect(browser.browsingContextSetViewport).toHaveBeenCalledWith({
                    context: 'context-id',
                    devicePixelRatio: 3,
                    viewport: { width: 390, height: 844 },
                })
            })

            it('keeps the emulation of emulate("device") when it works (WebdriverIO v9)', async () => {
                const browser = createBrowser(vi.fn().mockResolvedValue(() => {}))

                await service.before(browser.capabilities as WebdriverIO.Capabilities, [], browser)

                expect(browser.emulate).toHaveBeenCalledWith('device', 'iPhone 12 Pro')
                expect(browser.browsingContextSetViewport).not.toHaveBeenCalled()
            })
        })

        describe('mobile emulation for multiremote browsers', () => {
            const mobileEmulationCapabilities = {
                'goog:chromeOptions': {
                    mobileEmulation: { deviceMetrics: { width: 390, height: 844, pixelRatio: 3 } },
                },
            }
            const multiremoteCapabilities = {
                chrome: { capabilities: mobileEmulationCapabilities },
                firefox: { capabilities: mobileEmulationCapabilities },
            } as any

            function createInstance() {
                return {
                    addCommand: vi.fn(),
                    capabilities: mobileEmulationCapabilities,
                    requestedCapabilities: {},
                    on: vi.fn(),
                    execute: vi.fn().mockResolvedValue(1),
                    isBidi: true,
                    getWindowHandle: vi.fn().mockResolvedValue('context-id'),
                    browsingContextSetViewport: vi.fn(),
                } as any as WebdriverIO.Browser
            }

            it('sets the emulation on each instance of a WebdriverIO v10 multiremote browser', async () => {
                const instances: Record<string, WebdriverIO.Browser> = {
                    chrome: createInstance(),
                    firefox: createInstance(),
                }
                // WebdriverIO v10 does not store the instances as properties of the multiremote browser
                const multiremoteBrowser = {
                    isMultiRemote: true,
                    instances: ['chrome', 'firefox'],
                    getInstance: vi.fn((name: string) => instances[name]),
                    addCommand: vi.fn(),
                    capabilities: {},
                    requestedCapabilities: {},
                    on: vi.fn(),
                } as any as WebdriverIO.MultiRemoteBrowser

                await service.before(multiremoteCapabilities, [], multiremoteBrowser)

                for (const instance of Object.values(instances)) {
                    expect(instance.browsingContextSetViewport).toHaveBeenCalledWith({
                        context: 'context-id',
                        devicePixelRatio: 3,
                        viewport: { width: 390, height: 844 },
                    })
                }
            })

            it('sets the emulation on each instance of a WebdriverIO v9 multiremote browser', async () => {
                const instances: Record<string, WebdriverIO.Browser> = {
                    chrome: createInstance(),
                    firefox: createInstance(),
                }
                const multiremoteBrowser = {
                    isMultiremote: true,
                    instances: ['chrome', 'firefox'],
                    getInstance: vi.fn((name: string) => instances[name]),
                    addCommand: vi.fn(),
                    capabilities: {},
                    requestedCapabilities: {},
                    on: vi.fn(),
                    ...instances,
                } as any as WebdriverIO.MultiRemoteBrowser

                await service.before(multiremoteCapabilities, [], multiremoteBrowser)

                for (const instance of Object.values(instances)) {
                    expect(instance.browsingContextSetViewport).toHaveBeenCalledTimes(1)
                }
            })
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

        it('adds the matchers and logs a clear error when the command setup fails', async () => {
            const service = new VisualService({}, {}, {} as unknown as WebdriverIO.Config)
            const setupError = new Error('WebDriver Bidi command "script.callFunction" failed with error: unknown command')
            const browser = {
                isMultiremote: false,
                addCommand: vi.fn(),
                capabilities: {},
                requestedCapabilities: {},
                on: vi.fn(),
                execute: vi.fn().mockRejectedValue(setupError),
            } as any as WebdriverIO.Browser

            await expect(service.before({}, [], browser)).rejects.toThrow(setupError)

            expect(wdioExpect.extend).toBeCalledTimes(1)
            expect(vi.mocked(log.error)).toHaveBeenCalledWith(
                expect.stringContaining('The visual service could not add its commands to this session')
            )
            expect(vi.mocked(log.error)).toHaveBeenCalledWith(expect.stringContaining(setupError.message))
        })

        it('should register custom matchers with Jasmine when Jasmine is the framework', async () => {
            // With Jasmine, the global `expect` has no `extend()` and the Jasmine adapter does not see matchers added later
            const jasmineEnv = { beforeAll: vi.fn(), addAsyncMatchers: vi.fn() }
            ;(globalThis as { jasmine?: unknown }).jasmine = { getEnv: () => jasmineEnv }
            const service = new VisualService({}, {}, {} as unknown as WebdriverIO.Config)
            const browser = {
                isMultiremote: false,
                addCommand: vi.fn(),
                capabilities: {},
                requestedCapabilities: {},
                on: vi.fn(),
                execute: vi.fn().mockResolvedValue(1),
            } as any as WebdriverIO.Browser

            try {
                await service.before({}, [], browser)
            } finally {
                delete (globalThis as { jasmine?: unknown }).jasmine
            }

            expect(wdioExpect.extend).not.toHaveBeenCalled()
            expect(jasmineEnv.beforeAll).toHaveBeenCalledTimes(1)
            jasmineEnv.beforeAll.mock.calls[0][0]()
            expect(Object.keys(jasmineEnv.addAsyncMatchers.mock.calls[0][0])).toEqual([
                'toMatchScreenSnapshot',
                'toMatchFullPageSnapshot',
                'toMatchElementSnapshot',
                'toMatchTabbablePageSnapshot',
            ])
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

            expect(vi.mocked(log.warn).mock.calls).toEqual([[
                'The custom matchers `toMatchScreenSnapshot|toMatchFullPageSnapshot|toMatchElementSnapshot|toMatchTabbablePageSnapshot` could not be added and can not be used. Use the `check*` methods instead. Error: Expect package not found',
            ]])
        })

        it('should pass alwaysSaveActualImage: true to core for direct saveScreen calls when config is false', async () => {
            vi.mocked(saveScreen).mockResolvedValue({} as any)
            const service = new VisualService({ alwaysSaveActualImage: false }, {}, {} as unknown as WebdriverIO.Config)
            // Mocked BaseClass does not set defaultOptions/folders; set them so the command can run
            ;(service as any).defaultOptions = { alwaysSaveActualImage: false }
            ;(service as any).folders = { baselineFolder: './__snapshots__/' }
            const browser = {
                isMultiremote: false,
                addCommand: vi.fn((name, fn) => {
                    (browser as any)[name] = fn
                }),
                capabilities: {},
                requestedCapabilities: {},
                on: vi.fn(),
                execute: vi.fn().mockResolvedValue(1),
            } as any as WebdriverIO.Browser

            await service.before({}, [], browser)
            await (browser as any).saveScreen('tag')

            expect(saveScreen).toHaveBeenCalledTimes(1)
            const [saveScreenOptions] = vi.mocked(saveScreen).mock.calls[0]
            expect((saveScreenOptions as any).saveScreenOptions?.wic?.alwaysSaveActualImage).toBe(true)
        })

        it('should use dirname() of resolveSnapshotPath result as baselineFolder to avoid EISDIR conflicts', async () => {
            vi.mocked(saveScreen).mockResolvedValue({} as any)
            const resolveSnapshotPath = vi.fn().mockReturnValue('/custom/snapshots/specs/test.e2e.png')
            const config = {
                framework: 'mocha',
                resolveSnapshotPath,
            } as unknown as WebdriverIO.Config
            const service = new VisualService({}, {}, config)
            ;(service as any).defaultOptions = {}
            ;(service as any).folders = { baselineFolder: normalize('./__snapshots__/') }
            const browser = {
                isMultiremote: false,
                addCommand: vi.fn((name, fn) => {
                    (browser as any)[name] = fn
                }),
                capabilities: {},
                requestedCapabilities: {},
                on: vi.fn(),
                execute: vi.fn().mockResolvedValue(1),
            } as any as WebdriverIO.Browser

            await service.before({}, [], browser)
            service.beforeTest({
                file: '/project/specs/test.e2e.ts',
                parent: 'suite',
                title: 'test',
            } as any)
            await (browser as any).saveScreen('tag')

            expect(resolveSnapshotPath).toHaveBeenCalledWith('/project/specs/test.e2e.ts', '.png')
            const [saveScreenOptions] = vi.mocked(saveScreen).mock.calls[0]
            expect((saveScreenOptions as any).folders.baselineFolder).toBe(
                dirname('/custom/snapshots/specs/test.e2e.png')
            )
        })
    })
})
