import logger from '@wdio/logger'
import { expect } from '@wdio/globals'
import { dirname, normalize, resolve } from 'node:path'
import type { Capabilities, Frameworks } from '@wdio/types'
import {
    BaseClass,
    checkElement,
    checkFullPageScreen,
    checkScreen,
    saveElement,
    saveFullPageScreen,
    saveScreen,
    saveTabbablePage,
    checkTabbablePage,
    FOLDERS,
    DEFAULT_TEST_CONTEXT,
} from '@wdio/image-comparison-core'
import type { InstanceData, TestContext } from '@wdio/image-comparison-core'
import { SevereServiceError } from 'webdriverio'
import {
    enrichTestContext,
    getFolders,
    getInstanceData,
    getNativeContext,
} from './utils.js'
import {
    toMatchScreenSnapshot,
    toMatchFullPageSnapshot,
    toMatchElementSnapshot,
    toMatchTabbablePageSnapshot
} from './matcher.js'
import { waitForStorybookComponentToBeLoaded } from './storybook/utils.js'
import type { WaitForStorybookComponentToBeLoaded } from './storybook/Types.js'
import type { CommandMap, VisualServiceOptions } from './types.js'
import { PAGE_OPTIONS_MAP } from './constants.js'
import { ContextManager } from './contextManager.js'
import { wrapWithContext } from './wrapWithContext.js'

const log = logger('@wdio/visual-service')
const elementCommands = { saveElement, checkElement }
const pageCommands = {
    saveScreen,
    saveFullPageScreen,
    saveTabbablePage,
    checkScreen,
    checkFullPageScreen,
    checkTabbablePage,
    waitForStorybookComponentToBeLoaded,
}

export default class WdioImageComparisonService extends BaseClass {
    #config: WebdriverIO.Config
    #currentFile?: string
    #currentFilePath?: string
    #testContext: TestContext
    #browser?: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
    private _contextManager?: ContextManager
    private _contextManagers?: Map<string, ContextManager> = new Map()

    constructor(options: VisualServiceOptions, _: WebdriverIO.Capabilities, config: WebdriverIO.Config) {
        super(options)
        this.#config = config
        this.#testContext = DEFAULT_TEST_CONTEXT
    }

    /**
     * Set up the service if users want to use it in standalone mode
     */
    async remoteSetup(browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser) {
        await this.before(browser.capabilities as WebdriverIO.Capabilities, [], browser)
    }

    async before(
        capabilities: WebdriverIO.Capabilities,
        _specs: string[],
        browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
    ) {
        this.#browser = browser

        if (!this.#browser.isMultiremote) {
            log.info('Adding commands to global browser')
            await this.#addCommandsToBrowser(this.#browser)
        } else {
            await this.#extendMultiremoteBrowser(capabilities as Capabilities.RequestedMultiremoteCapabilities)
        }
        // There is an issue with the emulation mode for Chrome or Edge with WebdriverIO v9
        // It doesn't set the correct emulation mode for the browser based on the capabilities
        // So we need to set the emulation mode manually
        // this is a temporary fix until the issue is fixed in WebdriverIO v9 and enough users have upgraded to the latest version
        await this.#setEmulation(this.#browser, capabilities)

        /**
         * add custom matcher for visual comparison when expect has been added.
         * this is not the case in standalone mode
         */
        try {
            expect.extend({
                toMatchScreenSnapshot,
                toMatchFullPageSnapshot,
                toMatchElementSnapshot,
                toMatchTabbablePageSnapshot,
            })
        } catch (_err) {
            log.warn('Expect package not found. This means that the custom matchers `toMatchScreenSnapshot|toMatchFullPageSnapshot|toMatchElementSnapshot|toMatchTabbablePageSnapshot` are not added and can not be used. Please make sure to add it to your `package.json` if you want to use the Visual custom matchers.')
        }
    }

    async beforeTest(test: Frameworks.Test) {
        this.#currentFile = (test.file || (test as Frameworks.Test & { filename?: string }).filename) as string
        this.#currentFilePath = resolve(dirname(this.#currentFile), FOLDERS.DEFAULT.BASE)
        this.#testContext = this.#getTestContext(test)
    }

    // For Cucumber only
    beforeScenario(world: Frameworks.World) {
        this.#testContext = this.#getTestContext(world)
    }

    #getBaselineFolder() {
        const isDefaultBaselineFolder = normalize(FOLDERS.DEFAULT.BASE) === this.folders.baselineFolder
        const baselineFolder =(isDefaultBaselineFolder && this.#currentFilePath ? this.#currentFilePath : this.folders.baselineFolder) as string

        /**
         * support `resolveSnapshotPath` WebdriverIO option
         * @ref https://webdriver.io/docs/configuration#resolvesnapshotpath
         *
         * We only use this option if the baselineFolder is the default one, otherwise the
         * service option for setting the baselineFolder should be used
         *
         * We also check `this.#config` because for standalone usage of the service, the config is not available
         */
        if (this.#config && typeof this.#config.resolveSnapshotPath === 'function' && this.#currentFile && isDefaultBaselineFolder) {
            return this.#config.resolveSnapshotPath(this.#currentFile, '.png')
        }

        return baselineFolder
    }

    async #extendMultiremoteBrowser (capabilities: Capabilities.RequestedMultiremoteCapabilities) {
        const browser = this.#browser as WebdriverIO.MultiRemoteBrowser
        const browserNames = Object.keys(capabilities)

        /**
         * Add all the commands to the global browser object that will execute
         * on each browser in the Multi Remote
         * Start with the page commands
         */
        for (const [commandName, command] of Object.entries(pageCommands)) {
            this.#addMultiremoteCommand(browser, browserNames, commandName as keyof CommandMap, command)
        }

        /**
         * Add all the commands to each browser in the Multi Remote
         */
        for (const browserName of browserNames) {
            log.info(`Adding commands to Multi Browser: ${browserName}`)

            const browserInstance = browser.getInstance(browserName)
            const contextManager = new ContextManager(browserInstance)

            this._contextManagers?.set(browserName, contextManager)

            await this.#addCommandsToBrowser(browserInstance)
        }

        /**
         * Add all the element commands to the global browser object that will execute
         * on each browser in the Multi Remote
         */
        for (const [commandName, command] of Object.entries(elementCommands)) {
            this.#addMultiremoteElementCommand(browser, browserNames, commandName as keyof CommandMap, command)
        }
    }

    /**
     * Add commands to the "normal" browser object
     */
    async #addCommandsToBrowser(browserInstance: WebdriverIO.Browser) {
        this._contextManager = new ContextManager(browserInstance);
        (browserInstance as any).visualService = this
        const instanceData = await getInstanceData({
            browserInstance,
            initialDeviceRectangles: this._contextManager.getViewportContext(),
            isNativeContext: this._contextManager.isNativeContext,
        })

        // Update the context manager with the current viewport
        this._contextManager.setViewPortContext(instanceData.deviceRectangles)

        for (const [commandName, command] of Object.entries(elementCommands)) {
            this.#addElementCommand(browserInstance, commandName as keyof CommandMap, command, instanceData)
        }

        for (const [commandName, command] of Object.entries(pageCommands)) {
            this.#addPageCommand(browserInstance, commandName as keyof CommandMap, command, instanceData)
        }
    }

    /**
     * Add new element commands to the browser object
     */
    #addElementCommand<K extends keyof CommandMap>(
        browserInstance: WebdriverIO.Browser,
        commandName: K,
        command: CommandMap[K],
        initialInstanceData: InstanceData,
    ) {
        log.info(`Adding element command "${commandName}" to browser object`)

        const elementOptionsKey = commandName === 'saveElement' ? 'saveElementOptions' : 'checkElementOptions'
        const self = this

        browserInstance.addCommand(
            commandName,
            function (
                this: WebdriverIO.Browser,
                element: WebdriverIO.Element,
                tag: string,
                elementOptions = {}
            ) {
                const wrapped = wrapWithContext({
                    browserInstance,
                    command,
                    contextManager: self.contextManager,
                    getArgs: () => {
                        const updatedInstanceData = {
                            ...initialInstanceData,
                            deviceRectangles: self.contextManager.getViewportContext(),
                        }
                        const isCurrentContextNative = self.contextManager.isNativeContext

                        return [{
                            browserInstance,
                            element,
                            folders: getFolders(elementOptions, self.folders, self.#getBaselineFolder()),
                            instanceData: updatedInstanceData,
                            isNativeContext: isCurrentContextNative,
                            tag,
                            [elementOptionsKey]: {
                                wic: self.defaultOptions,
                                method: elementOptions,
                            },
                            testContext: enrichTestContext({
                                commandName,
                                currentTestContext: self.#testContext,
                                instanceData: updatedInstanceData,
                                tag,
                            }),
                        }] as unknown as Parameters<CommandMap[K]>
                    }
                })

                return wrapped.call(this)
            }
        )
    }

    /**
     * Add new page commands to the browser object
     */
    #addPageCommand<K extends keyof CommandMap>(
        browserInstance: WebdriverIO.Browser,
        commandName: K,
        command: CommandMap[K],
        initialInstanceData: InstanceData,
    ) {
        log.info(`Adding browser command "${commandName}" to browser object`)

        const self = this
        const pageOptionsKey = PAGE_OPTIONS_MAP[commandName]

        if (commandName === 'waitForStorybookComponentToBeLoaded') {
            browserInstance.addCommand(commandName, (options: WaitForStorybookComponentToBeLoaded) =>
                waitForStorybookComponentToBeLoaded(options)
            )
            return
        }

        browserInstance.addCommand(
            commandName,
            function (
                this: WebdriverIO.Browser,
                tag: string,
                pageOptions = {}
            ) {
                const wrapped = wrapWithContext({
                    browserInstance,
                    command,
                    contextManager: self.contextManager,
                    getArgs: () => {
                        const updatedInstanceData = {
                            ...initialInstanceData,
                            deviceRectangles: self.contextManager.getViewportContext()
                        }
                        const isCurrentContextNative = self.contextManager.isNativeContext

                        return [{
                            browserInstance,
                            folders: getFolders(pageOptions, self.folders, self.#getBaselineFolder()),
                            instanceData: updatedInstanceData,
                            isNativeContext: isCurrentContextNative,
                            tag,
                            [pageOptionsKey]: {
                                wic: self.defaultOptions,
                                method: pageOptions,
                            },
                            testContext: enrichTestContext({
                                commandName,
                                currentTestContext: self.#testContext,
                                instanceData: updatedInstanceData,
                                tag,
                            }),
                        }] as unknown as Parameters<CommandMap[K]>
                    }
                })

                return wrapped.call(this)
            }
        )
    }

    #addMultiremoteElementCommand<K extends keyof CommandMap>(
        browser: WebdriverIO.MultiRemoteBrowser,
        browserNames: string[],
        commandName: K,
        command: CommandMap[K],
    ) {
        log.info(`Adding element command "${commandName}" to Multi browser object`)
        const self = this

        browser.addCommand(
            commandName,
            async function (
                this: WebdriverIO.MultiRemoteBrowser,
                element,
                tag,
                elementOptions = {}
            ) {
                const returnData: Record<string, any> = {}
                const elementOptionsKey = commandName === 'saveElement' ? 'saveElementOptions' : 'checkElementOptions'

                for (const browserName of browserNames) {
                    const browserInstance = browser.getInstance(browserName)
                    const contextManager = self._contextManagers?.get(browserName)

                    if (!contextManager) {
                        throw new Error(`No ContextManager found for browser instance: ${browserName}`)
                    }

                    const isNativeContext = contextManager.isNativeContext
                    const initialInstanceData = await getInstanceData({
                        browserInstance: browserInstance,
                        initialDeviceRectangles: contextManager.getViewportContext(),
                        isNativeContext
                    })

                    const wrapped = wrapWithContext({
                        browserInstance,
                        command,
                        contextManager,
                        getArgs: () => {
                            const updatedInstanceData = {
                                ...initialInstanceData,
                                deviceRectangles: contextManager.getViewportContext(),
                            }

                            return [{
                                browserInstance,
                                instanceData: updatedInstanceData,
                                folders: getFolders(elementOptions, self.folders, self.#getBaselineFolder()),
                                tag,
                                element,
                                [elementOptionsKey]: {
                                    wic: self.defaultOptions,
                                    method: elementOptions,
                                },
                                isNativeContext,
                                testContext: enrichTestContext({
                                    commandName,
                                    currentTestContext: self.#testContext,
                                    instanceData: updatedInstanceData,
                                    tag,
                                }),
                            }] as unknown as Parameters<CommandMap[K]>
                        }
                    })

                    returnData[browserName] = await wrapped.call(browserInstance)
                }

                return returnData
            })
    }

    #addMultiremoteCommand<K extends keyof CommandMap>(
        browser: WebdriverIO.MultiRemoteBrowser,
        browserNames: string[],
        commandName: K,
        command: CommandMap[K],
    ) {
        log.info(`Adding browser command "${commandName}" to Multi browser object`)
        const self = this

        if (commandName === 'waitForStorybookComponentToBeLoaded') {
            browser.addCommand(commandName, waitForStorybookComponentToBeLoaded)
            return
        }

        browser.addCommand(
            commandName,
            async function (
                this: WebdriverIO.MultiRemoteBrowser,
                tag,
                pageOptions = {}
            ) {
                const returnData: Record<string, any> = {}
                const pageOptionsKey = PAGE_OPTIONS_MAP[commandName]

                for (const browserName of browserNames) {
                    const browserInstance = browser.getInstance(browserName)
                    const contextManager = self._contextManagers?.get(browserName)

                    if (!contextManager) {
                        throw new Error(`No ContextManager found for browser instance: ${browserName}`)
                    }

                    const isNativeContext = getNativeContext({
                        capabilities: browserInstance.requestedCapabilities,
                        isMobile: browserInstance.isMobile,
                    })
                    const initialInstanceData = await getInstanceData({
                        browserInstance: browserInstance,
                        initialDeviceRectangles: contextManager.getViewportContext(),
                        isNativeContext
                    })

                    const wrapped = wrapWithContext({
                        browserInstance,
                        command,
                        contextManager,
                        getArgs: () => {
                            const updatedInstanceData = {
                                ...initialInstanceData,
                                deviceRectangles: contextManager.getViewportContext()
                            }
                            const isCurrentContextNative = contextManager.isNativeContext

                            return [{
                                browserInstance,
                                folders: getFolders(pageOptions, self.folders, self.#getBaselineFolder()),
                                instanceData: updatedInstanceData,
                                isNativeContext: isCurrentContextNative,
                                tag,
                                [pageOptionsKey]: {
                                    wic: self.defaultOptions,
                                    method: pageOptions,
                                },
                                testContext: enrichTestContext({
                                    commandName,
                                    currentTestContext: self.#testContext,
                                    instanceData: updatedInstanceData,
                                    tag,
                                }),
                            }] as unknown as Parameters<CommandMap[K]>
                        }
                    })

                    returnData[browserName] = await wrapped.call(browserInstance)
                }

                return returnData
            }
        )
    }

    #getTestContext(test: Frameworks.Test | Frameworks.World): TestContext {
        const framework = this.#config?.framework
        if (framework === 'mocha' && test) {
            return {
                ...this.#testContext,
                framework: 'mocha',
                parent: (test as Frameworks.Test).parent,
                title: (test as Frameworks.Test).title,
            }
        } else if (framework === 'jasmine' && test) {
            /**
             * When using Jasmine as the framework the title/parent are not set as with mocha.
             *
             * `fullName` contains all describe(), and it() separated by a space.
             * `description` contains the current it() statement.
             *
             * e.g.:
             * With the following configuration
             *
             * describe('x', () => {
             *   describe('y', () => {
             *     it('z', () => {});
             *   })
             * })
             *
             * fullName will be "x y z"
             * description will be "z"
             *
             */
            const { description: title, fullName } = test as Frameworks.Test

            return {
                ...this.#testContext,
                framework: 'jasmine',
                parent : fullName?.replace(` ${title}`, '') as string,
                title: title as string,
            }
        } else if (framework === 'cucumber' && test) {
            return {
                ...this.#testContext,
                framework: 'cucumber',
                // @ts-ignore
                parent: (test as Frameworks.World)?.gherkinDocument?.feature?.name as string,
                title: (test as Frameworks.World)?.pickle?.name as string,
            }

        }

        throw new SevereServiceError(`Framework ${framework} is not supported by the Visual Service and should be either "mocha", "jasmine" or "cucumber".`)
    }

    get contextManager(): ContextManager {
        if (!this._contextManager) {
            throw new Error('ContextManager has not been initialized')
        }
        return this._contextManager
    }

    async #setEmulationForBrowser(browserInstance: WebdriverIO.Browser, capabilities: WebdriverIO.Capabilities) {
        if (!browserInstance.isBidi) {
            return
        }

        const chromeMobileEmulation = capabilities['goog:chromeOptions']?.mobileEmulation
        const edgeMobileEmulation = capabilities['ms:edgeOptions']?.mobileEmulation
        const mobileEmulation = chromeMobileEmulation || edgeMobileEmulation

        if (!mobileEmulation) {
            return
        }

        const { deviceName, deviceMetrics } = mobileEmulation

        if (deviceName) {
            await (browserInstance.emulate as any)('device', deviceName)
            return
        }

        const { pixelRatio: devicePixelRatio = 1, width = 320, height = 658 } = deviceMetrics || {}
        await browserInstance.browsingContextSetViewport({
            context: await browserInstance.getWindowHandle(),
            devicePixelRatio,
            viewport: { width, height }
        })
    }

    async #setEmulation(browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser, capabilities: WebdriverIO.Capabilities) {
        if (browser.isMultiremote) {
            const multiremoteBrowser = browser as WebdriverIO.MultiRemoteBrowser
            for (const browserInstance of Object.values(multiremoteBrowser)) {
                await this.#setEmulationForBrowser(browserInstance, browserInstance.capabilities)
            }
            return
        }

        await this.#setEmulationForBrowser(browser as WebdriverIO.Browser, capabilities)
    }
}
