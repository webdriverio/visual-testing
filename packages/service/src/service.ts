import logger from '@wdio/logger'
import { expect } from '@wdio/globals'
import type { Capabilities, Options } from '@wdio/types'
import type { ClassOptions } from 'webdriver-image-comparison'
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
} from 'webdriver-image-comparison'

import { determineNativeContext, getFolders, getInstanceData } from './utils.js'
import {
    toMatchScreenSnapshot,
    toMatchFullPageSnapshot,
    toMatchElementSnapshot,
    toMatchTabbablePageSnapshot
} from './matcher.js'

const log = logger('@wdio/visual-service')

const elementCommands = { saveElement, checkElement }
const pageCommands = {
    saveScreen,
    saveFullPageScreen,
    saveTabbablePage,
    checkScreen,
    checkFullPageScreen,
    checkTabbablePage,
}

export default class WdioImageComparisonService extends BaseClass {
    private _browser?: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
    private _isNativeContext: boolean | undefined

    constructor(options: ClassOptions) {
        super(options)
        this._isNativeContext = undefined
    }
    async before(
        capabilities: WebdriverIO.Capabilities,
        _specs: string[],
        browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
    ) {
        this._browser = browser
        this._isNativeContext = determineNativeContext(this._browser)

        if (!this._browser.isMultiremote) {
            log.info('Adding commands to global browser')
            await this.#addCommandsToBrowser(capabilities, this._browser)
        } else {
            await this.#extendMultiremoteBrowser(capabilities as Capabilities.MultiRemoteCapabilities)
        }

        /**
         * add custom matcher for visual comparison
         */
        expect.extend({
            toMatchScreenSnapshot,
            toMatchFullPageSnapshot,
            toMatchElementSnapshot,
            toMatchTabbablePageSnapshot,
        })
    }

    afterCommand (commandName:string, _args:string[], result:number|string, error:any) {
        // This is for the cases where in the E2E tests we switch to a WEBVIEW or back to NATIVE_APP context
        if (commandName === 'getContext' && error === undefined && typeof result === 'string') {
            this._isNativeContext = result.includes('NATIVE')
        }
    }

    async #extendMultiremoteBrowser (capabilities: Capabilities.MultiRemoteCapabilities) {
        const browser = this._browser as WebdriverIO.MultiRemoteBrowser
        const browserNames = Object.keys(capabilities)
        log.info(`Adding commands to Multi Browser: ${browserNames.join(', ')}`)

        for (const browserName of browserNames) {
            const multiremoteBrowser = browser as WebdriverIO.MultiRemoteBrowser
            const browserInstance = multiremoteBrowser.getInstance(browserName)
            await this.#addCommandsToBrowser(
                (capabilities[browserName] as Options.MultiRemoteBrowserOptions).capabilities,
                browserInstance
            )
        }

        /**
         * Add all the commands to the global browser object that will execute
         * on each browser in the Multi Remote
         */
        for (const command of [
            ...Object.keys(elementCommands),
            ...Object.keys(pageCommands),
        ]) {
            browser.addCommand(command, function (...args: unknown[]) {
                const returnData: Record<string, any> = {}
                for (const browserName of browserNames) {
                    const multiremoteBrowser = browser as WebdriverIO.MultiRemoteBrowser
                    const browserInstance = multiremoteBrowser.getInstance(browserName)
                    /**
                     * casting command to `checkScreen` to simplify type handling here
                     */
                    returnData[browserName] = browserInstance[command as 'checkScreen'].call(
                        browserInstance,
                        ...args
                    )
                }
                return returnData
            })
        }
    }

    async #addCommandsToBrowser(
        capabilities: WebdriverIO.Capabilities,
        currentBrowser: WebdriverIO.Browser
    ) {
        const instanceData = await getInstanceData(capabilities, currentBrowser)
        const self = this

        for (const [commandName, command] of Object.entries(elementCommands)) {
            log.info(`Adding element command "${commandName}" to browser object`)
            currentBrowser.addCommand(
                commandName,
                function (
                    this: typeof currentBrowser,
                    element,
                    tag,
                    elementOptions = {},
                ) {
                    return command(
                        {
                            executor: <T>(script: string | ((...innerArgs: any[]) => unknown), ...varArgs: any[]): Promise<T> => {
                                return this.execute.bind(currentBrowser)(script, ...varArgs) as Promise<T>
                            },
                            getElementRect: this.getElementRect.bind(currentBrowser),
                            getSettings: this.getSettings.bind(currentBrowser),
                            screenShot: this.takeScreenshot.bind(currentBrowser),
                            updateSettings: this.updateSettings.bind(currentBrowser),
                        },
                        instanceData,
                        getFolders(elementOptions, self.folders),
                        element,
                        tag,
                        {
                            wic: self.defaultOptions,
                            method: elementOptions,
                        },
                        self._isNativeContext as boolean,
                    )
                }
            )
        }

        for (const [commandName, command] of Object.entries(pageCommands)) {
            log.info(`Adding element command "${commandName}" to browser object`)
            currentBrowser.addCommand(
                commandName,
                function (this: typeof currentBrowser, tag, pageOptions = {}) {
                    return command(
                        {
                            executor: <T>(script: string | ((...innerArgs: any[]) => unknown), ...varArgs: any[]): Promise<T> => {
                                return this.execute.bind(currentBrowser)(script, ...varArgs) as Promise<T>
                            },
                            getElementRect: this.getElementRect.bind(currentBrowser),
                            screenShot:
                                this.takeScreenshot.bind(currentBrowser),
                        },
                        instanceData,
                        getFolders(pageOptions, self.folders),
                        tag,
                        {
                            wic: self.defaultOptions,
                            method: pageOptions,
                        },
                        self._isNativeContext as boolean,
                    )
                }
            )
        }
    }
}
