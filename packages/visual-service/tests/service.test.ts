import { dirname, join, normalize } from 'node:path'
import logger from '@wdio/logger'
import { expect as wdioExpect } from '@wdio/globals'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import VisualService from '../src/index.js'
import { checkElement, checkScreen, DEVICE_RECTANGLES, getMobileScreenSize, getMobileViewPortPosition, saveScreen } from '@wdio/image-comparison-core'

const log = logger('test')
// WebdriverIO brands its objects with their kind, see `isWdioKind()` in `src/utils.ts`
const WDIO_KIND = Symbol.for('wdio.kind')
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
                isMultiRemote: false,
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
            browser.isMultiRemote = true
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
            const createMultiRemoteBrowser = () => {
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
                        isMultiRemote: true,
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

            it('uses the context manager of each multiremote instance for its own commands', async () => {
                const { browser, instances } = createMultiRemoteBrowser()
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

        describe('commands of a multiremote browser and of its instances', () => {
            const createInstance = (browserName: string) => {
                const instance: Record<string, any> = {
                    addCommand: vi.fn((name: string, fn: (...args: unknown[]) => unknown) => {
                        instance[name] = fn
                    }),
                    on: vi.fn(),
                    execute: vi.fn().mockResolvedValue(1),
                    isMobile: false,
                    capabilities: { browserName },
                    requestedCapabilities: { browserName },
                }
                return instance
            }
            const createMultiRemoteBrowser = () => {
                const instances: Record<string, Record<string, any>> = {
                    chrome: createInstance('chrome'),
                    firefox: createInstance('firefox'),
                }
                const browser: Record<string, any> = {
                    isMultiRemote: true,
                    instances: Object.keys(instances),
                    getInstance: (name: string) => instances[name],
                    // The multiremote `addCommand()` also adds the command to each instance
                    addCommand: vi.fn((name: string, fn: (...args: unknown[]) => unknown) => {
                        for (const instance of Object.values(instances)) {
                            instance.addCommand(name, fn)
                        }
                        browser[name] = fn
                    }),
                    capabilities: {},
                    requestedCapabilities: {},
                    on: vi.fn(),
                }
                // `multiRemoteBrowser.$()` gives an element without `parent`, `getInstance()` gives the element of each instance
                const instanceElements: Record<string, { elementId: string }> = {
                    chrome: { elementId: 'chrome-element' },
                    firefox: { elementId: 'firefox-element' },
                }
                const multiRemoteElement = {
                    [WDIO_KIND]: 'element',
                    isMultiRemote: true,
                    selector: '#purplebox',
                    instances: Object.keys(instanceElements),
                    getInstance: (name: string) => instanceElements[name],
                }

                return {
                    browser: browser as any as WebdriverIO.MultiRemoteBrowser,
                    // The mock without its type, to call a command that the service added
                    browserMock: browser,
                    instances,
                    instanceElements,
                    multiRemoteElement,
                }
            }
            const multiremoteCapabilities = {
                chrome: { capabilities: {} },
                firefox: { capabilities: {} },
            } as any

            beforeEach(() => {
                // Mocked BaseClass does not set defaultOptions/folders; set them so the command can run
                ;(service as any).defaultOptions = {}
                ;(service as any).folders = { baselineFolder: './__snapshots__/' }
            })

            it('runs the element command of an instance on that instance only', async () => {
                const { browser, instances, instanceElements } = createMultiRemoteBrowser()

                await service.before(multiremoteCapabilities, [], browser)
                await instances.chrome.checkElement(instanceElements.chrome, 'purplebox')

                expect(checkElement).toHaveBeenCalledTimes(1)
                expect(vi.mocked(checkElement).mock.calls[0][0].browserInstance).toBe(instances.chrome)
                expect(vi.mocked(checkElement).mock.calls[0][0].element).toBe(instanceElements.chrome)
            })

            it('runs the page command of an instance on that instance only', async () => {
                const { browser, instances } = createMultiRemoteBrowser()

                await service.before(multiremoteCapabilities, [], browser)
                await instances.firefox.checkScreen('homepage')

                expect(checkScreen).toHaveBeenCalledTimes(1)
                expect(vi.mocked(checkScreen).mock.calls[0][0].browserInstance).toBe(instances.firefox)
            })

            it('gives the element of each instance to the multiremote element command', async () => {
                const { browser, browserMock, instances, instanceElements, multiRemoteElement } = createMultiRemoteBrowser()

                await service.before(multiremoteCapabilities, [], browser)
                await browserMock.checkElement(multiRemoteElement, 'purplebox')

                expect(checkElement).toHaveBeenCalledTimes(2)
                const [[chromeArgs], [firefoxArgs]] = vi.mocked(checkElement).mock.calls
                expect(chromeArgs.browserInstance).toBe(instances.chrome)
                expect(chromeArgs.element).toBe(instanceElements.chrome)
                expect(firefoxArgs.browserInstance).toBe(instances.firefox)
                expect(firefoxArgs.element).toBe(instanceElements.firefox)
            })

            it('gives the element of each instance when the multiremote element is not awaited', async () => {
                const { browser, browserMock, instanceElements, multiRemoteElement } = createMultiRemoteBrowser()
                // `multiRemoteBrowser.$()` without `await`: as in the chainable of WebdriverIO, a property is a chained command
                const notAwaitedElement = {
                    isMultiRemote: vi.fn(),
                    then: (resolve: (element: typeof multiRemoteElement) => void) => resolve(multiRemoteElement),
                }

                await service.before(multiremoteCapabilities, [], browser)
                await browserMock.checkElement(notAwaitedElement, 'purplebox')

                const [[chromeArgs], [firefoxArgs]] = vi.mocked(checkElement).mock.calls
                expect(chromeArgs.element).toBe(instanceElements.chrome)
                expect(firefoxArgs.element).toBe(instanceElements.firefox)
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

            it('sets the viewport of the device that the browser emulates when emulate("device") fails', async () => {
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

            it('reads the emulated device before emulate("device"), which removes it when it fails', async () => {
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

            it('keeps the emulation of emulate("device") when it works', async () => {
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

            it('sets the emulation on each instance of a multiremote browser', async () => {
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
        })

        it('should register custom matchers', async () => {
            const service = new VisualService({}, {}, {} as unknown as WebdriverIO.Config)
            const browser = {
                isMultiRemote: false,
                addCommand: vi.fn(),
                capabilities: {},
                requestedCapabilities: {},
                on: vi.fn(),
                execute: vi.fn().mockResolvedValue(1),
            } as any as WebdriverIO.Browser

            await service.before({}, [], browser)

            expect(wdioExpect.extend).toBeCalledTimes(1)
        })

        it('adds the matchers and logs a clear error when the setup fails', async () => {
            const service = new VisualService({}, {}, {} as unknown as WebdriverIO.Config)
            const setupError = new Error('WebDriver Bidi command "script.callFunction" failed with error: unknown command')
            const browser = {
                isMultiRemote: false,
                addCommand: vi.fn(),
                capabilities: {},
                requestedCapabilities: {},
                on: vi.fn(),
                execute: vi.fn().mockRejectedValue(setupError),
            } as any as WebdriverIO.Browser

            await expect(service.before({}, [], browser)).rejects.toThrow(setupError)

            expect(wdioExpect.extend).toBeCalledTimes(1)
            expect(vi.mocked(log.error)).toHaveBeenCalledWith(
                expect.stringContaining('The visual service setup failed for this session')
            )
            expect(vi.mocked(log.error)).toHaveBeenCalledWith(expect.stringContaining(setupError.message))
        })

        it('should register custom matchers with Jasmine when Jasmine is the framework', async () => {
            // With Jasmine, the global `expect` has no `extend()` and the Jasmine adapter does not see matchers added later
            const jasmineEnv = { beforeAll: vi.fn(), addAsyncMatchers: vi.fn() }
            ;(globalThis as { jasmine?: unknown }).jasmine = { getEnv: () => jasmineEnv }
            const service = new VisualService({}, {}, {} as unknown as WebdriverIO.Config)
            const browser = {
                isMultiRemote: false,
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
                isMultiRemote: false,
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
                isMultiRemote: false,
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
                isMultiRemote: false,
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
