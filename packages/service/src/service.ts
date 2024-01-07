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

import { getFolders, getInstanceData } from './utils.js'
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

    constructor(options: ClassOptions) {
        super(options)
    }
    before(
        capabilities: WebdriverIO.Capabilities,
        _specs: string[],
        browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
    ) {
        this._browser = browser

        if (!this._browser.isMultiremote) {
            log.info('Adding commands to global browser')
            this.#addCommandsToBrowser(capabilities, this._browser)
        } else {
            this.#extendMultiremoteBrowser(capabilities as Capabilities.MultiRemoteCapabilities)
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

    #extendMultiremoteBrowser (capabilities: Capabilities.MultiRemoteCapabilities) {
        const browser = this._browser as WebdriverIO.MultiRemoteBrowser
        const browserNames = Object.keys(capabilities)
        log.info(`Adding commands to Multi Browser: ${browserNames.join(', ')}`)

        for (const browserName of browserNames) {
            const multiremoteBrowser = browser as WebdriverIO.MultiRemoteBrowser
            const browserInstance = multiremoteBrowser.getInstance(browserName)
            this.#addCommandsToBrowser(
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

    #addCommandsToBrowser(
        capabilities: WebdriverIO.Capabilities,
        currentBrowser: WebdriverIO.Browser
    ) {
        const instanceData = getInstanceData(capabilities, currentBrowser)

        const folders = this.folders
        const defaultOptions = this.defaultOptions

        for (const [commandName, command] of Object.entries(elementCommands)) {
            currentBrowser.addCommand(
                commandName,
                function (
                    this: typeof currentBrowser,
                    element,
                    tag,
                    elementOptions = {}
                ) {
                    return command(
                        {
                            executor: this.execute.bind(currentBrowser),
                            screenShot:
                                this.takeScreenshot.bind(currentBrowser),
                        },
                        instanceData,
                        getFolders(elementOptions, folders),
                        element,
                        tag,
                        {
                            wic: defaultOptions,
                            method: elementOptions,
                        }
                    )
                }
            )
        }

        for (const [commandName, command] of Object.entries(pageCommands)) {
            currentBrowser.addCommand(
                commandName,
                function (this: typeof currentBrowser, tag, pageOptions = {}) {
                    return command(
                        {
                            executor: this.execute.bind(currentBrowser),
                            screenShot:
                                this.takeScreenshot.bind(currentBrowser),
                        },
                        instanceData,
                        getFolders(pageOptions, folders),
                        tag,
                        {
                            wic: defaultOptions,
                            method: pageOptions,
                        }
                    )
                }
            )
        }
    }
}
