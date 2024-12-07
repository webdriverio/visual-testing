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
} from 'webdriver-image-comparison'
import type { TestContext } from 'webdriver-image-comparison'
import { SevereServiceError } from 'webdriverio'
import { determineNativeContext, enrichTestContext, getFolders, getInstanceData, getNativeContext } from './utils.js'
import {
    toMatchScreenSnapshot,
    toMatchFullPageSnapshot,
    toMatchElementSnapshot,
    toMatchTabbablePageSnapshot
} from './matcher.js'
import { waitForStorybookComponentToBeLoaded } from './storybook/utils.js'
import type { WaitForStorybookComponentToBeLoaded } from './storybook/Types.js'
import type { MultiremoteCommandResult, NativeContextType, VisualServiceOptions } from './types.js'
import { PAGE_OPTIONS_MAP } from './constants.js'

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
    private _isNativeContext: NativeContextType | undefined

    constructor(options: VisualServiceOptions, _: WebdriverIO.Capabilities, config: WebdriverIO.Config) {
        super(options)
        this.#config = config
        this._isNativeContext = undefined
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
        this._isNativeContext = determineNativeContext(this.#browser)

        if (!this.#browser.isMultiremote) {
            log.info('Adding commands to global browser')
            await this.#addCommandsToBrowser(this.#browser)
        } else {
            await this.#extendMultiremoteBrowser(capabilities as Capabilities.RequestedMultiremoteCapabilities)
        }

        if (browser.isMultiremote) {
            this.#setupMultiremoteContextListener()
        }

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

    afterCommand(commandName: string, _args: string[], result: number | string, error: any) {
        // This is for the cases where in the E2E tests we switch to a WEBVIEW or back to NATIVE_APP context
        if (commandName === 'getContext' && error === undefined && typeof result === 'string') {
            // Multiremote logic is handled in the `before` method during an event listener
            this._isNativeContext = this.#browser?.isMultiremote ? this._isNativeContext : result.includes('NATIVE')
        }
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
         * Add all the commands to each browser in the Multi Remote
         */
        for (const browserName of browserNames) {
            log.info(`Adding commands to Multi Browser: ${browserName}`)
            const browserInstance = browser.getInstance(browserName)
            await this.#addCommandsToBrowser(browserInstance)
        }

        /**
         * Add all the commands to the global browser object that will execute
         * on each browser in the Multi Remote
         * Start with the page commands
         */
        for (const [commandName, command] of Object.entries(pageCommands)) {
            this.#addMultiremoteCommand(browser, browserNames, commandName, command)
        }

        /**
         * Add all the element commands to the global browser object that will execute
         * on each browser in the Multi Remote
         */
        for (const [commandName, command] of Object.entries(elementCommands)) {
            this.#addMultiremoteElementCommand(browser, browserNames, commandName, command)
        }
    }

    /**
     * Add commands to the "normal" browser object
     */
    async #addCommandsToBrowser(currentBrowser: WebdriverIO.Browser) {
        const instanceData = await getInstanceData(currentBrowser)
        const isNativeContext = getNativeContext(
            this.#browser as WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
            currentBrowser,
            this._isNativeContext as NativeContextType
        )

        for (const [commandName, command] of Object.entries(elementCommands)) {
            this.#addElementCommand(currentBrowser, commandName, command, instanceData, isNativeContext)
        }

        for (const [commandName, command] of Object.entries(pageCommands)) {
            this.#addPageCommand(currentBrowser, commandName, command, instanceData, isNativeContext)
        }
    }

    /**
     * Add new element commands to the browser object
     */
    #addElementCommand(browser: WebdriverIO.Browser, commandName: string, command: any, instanceData: any, isNativeContext: boolean) {
        log.info(`Adding element command "${commandName}" to browser object`)

        const self = this
        browser.addCommand(
            commandName,
            function (
                this: typeof browser,
                element,
                tag,
                elementOptions = {},
            ) {
                const elementOptionsKey = commandName === 'saveElement' ? 'saveElementOptions' : 'checkElementOptions'

                return command(
                    {
                        methods:{
                            executor: <T>(script: string | ((...innerArgs: any[]) => unknown), ...varArgs: any[]): Promise<T> => {
                                return this.execute.bind(browser)(script, ...varArgs) as Promise<T>
                            },
                            getElementRect: this.getElementRect.bind(browser),
                            screenShot: this.takeScreenshot.bind(browser),
                            takeElementScreenshot: this.takeElementScreenshot.bind(browser),
                        },
                        instanceData,
                        folders: getFolders(elementOptions, self.folders, self.#getBaselineFolder()),
                        element,
                        tag,
                        [elementOptionsKey]: {
                            wic: self.defaultOptions,
                            method: elementOptions,
                        },
                        isNativeContext,
                        testContext: enrichTestContext({
                            commandName,
                            currentTestContext: self.#testContext,
                            instanceData,
                            tag,
                        })
                    }
                )
            })
    }

    /**
     * Add new page commands to the browser object
     */
    #addPageCommand(browser: WebdriverIO.Browser, commandName: string, command: any, instanceData: any, isNativeContext: boolean) {
        log.info(`Adding browser command "${commandName}" to browser object`)

        const self = this
        const pageOptionsKey = PAGE_OPTIONS_MAP[commandName]

        if (commandName === 'waitForStorybookComponentToBeLoaded') {
            browser.addCommand(commandName, (options: WaitForStorybookComponentToBeLoaded) => waitForStorybookComponentToBeLoaded(options))
        } else {
            browser.addCommand(
                commandName,
                function (
                    this: typeof browser,
                    tag,
                    pageOptions = {}
                ) {
                    return command(
                        {
                            methods: {
                                executor: <T>(script: string | ((...innerArgs: any[]) => unknown), ...varArgs: any[]): Promise<T> => {
                                    return this.execute.bind(browser)(script, ...varArgs) as Promise<T>
                                },
                                getElementRect: this.getElementRect.bind(browser),
                                screenShot: this.takeScreenshot.bind(browser),
                            },
                            instanceData,
                            folders: getFolders(pageOptions, self.folders, self.#getBaselineFolder()),
                            tag,
                            [pageOptionsKey]:{
                                wic: self.defaultOptions,
                                method: pageOptions,
                            },
                            isNativeContext,
                            testContext: enrichTestContext({
                                commandName,
                                currentTestContext: self.#testContext,
                                instanceData,
                                tag,
                            })
                        }
                    )
                })
        }
    }

    #addMultiremoteElementCommand(browser: WebdriverIO.MultiRemoteBrowser, browserNames: string[], commandName: string, command: any) {
        log.info(`Adding element command "${commandName}" to Multi browser object`)
        const self = this

        browser.addCommand(
            commandName,
            async function (
                this: WebdriverIO.MultiRemoteBrowser,
                element,
                tag,
                pageOptions = {}
            ) {
                const returnData: Record<string, any> = {}
                const elementOptionsKey = commandName === 'saveElement' ? 'saveElementOptions' : 'checkElementOptions'

                for (const browserName of browserNames) {
                    const browserInstance = browser.getInstance(browserName)
                    const isNativeContext = getNativeContext(
                        self.#browser as WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
                        browserInstance,
                        self._isNativeContext as NativeContextType
                    )
                    const instanceData = await getInstanceData(browserInstance)

                    returnData[browserName] = await command(
                        {
                            methods:{
                                executor: <T>(script: string | ((...innerArgs: any[]) => unknown), ...varArgs: any[]): Promise<T> => {
                                    return browserInstance.execute.bind(browserInstance)(script, ...varArgs) as Promise<T>
                                },
                                getElementRect: browserInstance.getElementRect.bind(browserInstance),
                                screenShot: browserInstance.takeScreenshot.bind(browserInstance),
                                takeElementScreenshot: browserInstance.takeElementScreenshot.bind(browserInstance),
                            },
                            instanceData,
                            folders:getFolders(pageOptions, self.folders, self.#getBaselineFolder()),
                            tag,
                            element,
                            [elementOptionsKey]:{
                                wic: self.defaultOptions,
                                method: pageOptions,
                            },
                            isNativeContext,
                            testContext: enrichTestContext({
                                commandName,
                                currentTestContext: self.#testContext,
                                instanceData,
                                tag,
                            })
                        }
                    )
                }
                return returnData
            })
    }

    #addMultiremoteCommand(browser: WebdriverIO.MultiRemoteBrowser, browserNames: string[], commandName: string, command: any) {
        log.info(`Adding browser command "${commandName}" to Multi browser object`)
        const self = this

        if (commandName === 'waitForStorybookComponentToBeLoaded') {
            browser.addCommand(commandName, waitForStorybookComponentToBeLoaded)
        } else {
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
                        const isNativeContext = getNativeContext(
                        self.#browser as WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
                        browserInstance,
                        self._isNativeContext as NativeContextType
                        )
                        const instanceData = await getInstanceData(browserInstance)

                        returnData[browserName] = await command(
                            {
                                methods: {
                                    executor: <T>(script: string | ((...innerArgs: any[]) => unknown), ...varArgs: any[]): Promise<T> => {
                                        return browserInstance.execute.bind(browserInstance)(script, ...varArgs) as Promise<T>
                                    },
                                    getElementRect: browserInstance.getElementRect.bind(browserInstance),
                                    screenShot: browserInstance.takeScreenshot.bind(browserInstance),
                                },
                                instanceData,
                                folders:getFolders(pageOptions, self.folders, self.#getBaselineFolder()),
                                tag,
                                [pageOptionsKey]:{
                                    wic: self.defaultOptions,
                                    method: pageOptions,
                                },
                                isNativeContext,
                                testContext: enrichTestContext({
                                    commandName,
                                    currentTestContext: self.#testContext,
                                    instanceData,
                                    tag,
                                })
                            })
                    }
                    return returnData
                })
        }
    }

    #setupMultiremoteContextListener() {
        const multiremoteBrowser = this.#browser as WebdriverIO.MultiRemoteBrowser
        const browserInstances = multiremoteBrowser.instances

        for (const instanceName of browserInstances) {
            const instance = (multiremoteBrowser as any)[instanceName]
            instance.on('result', (result:MultiremoteCommandResult) => {
                if (result.command === 'getContext') {
                    const value = result.result.value
                    const sessionId = instance.sessionId
                    if (typeof this._isNativeContext !== 'object' || this._isNativeContext === null) {
                        this._isNativeContext = {}
                    }
                    this._isNativeContext[sessionId] = value.includes('NATIVE')
                }
            })
        }
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
}
