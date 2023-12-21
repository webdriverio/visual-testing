import logger from '@wdio/logger'
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

const log = logger('wdio-image-comparison-service')

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
            this._addCommandsToBrowser(capabilities, this._browser)
        } else {
            const browserNames = Object.keys(capabilities)
            log.info('Adding commands to Multi Browser: ', browserNames)

            for (const browserName of browserNames) {
                this._addCommandsToBrowser(
                    (
                        (capabilities as Capabilities.MultiRemoteCapabilities)[
                            browserName
                        ] as Options.MultiRemoteBrowserOptions
                    ).capabilities,
                    // Need to make this better
                    (global as any)[browserName]
                )
            }
            //Add all the commands to the global browser object that will execute on each browser in the Multi Remote
            for (const command of [
                ...Object.keys(elementCommands),
                ...Object.keys(pageCommands),
            ]) {
                browser.addCommand(command, function () {
                    const returnData = {}
                    for (const browserName of browserNames) {
                        (returnData as any)[browserName] = (global as any)[
                            browserName
                        ][command].call(
                            (global as any)[browserName],
                            ...arguments
                        )
                    }
                    return returnData
                })
            }
        }
    }

    _addCommandsToBrowser(
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
