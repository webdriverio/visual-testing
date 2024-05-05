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
} from 'webdriver-image-comparison'
import {
    ocrGetText,
    ocrGetElementPositionByText,
    ocrClickOnText,
    ocrSetValue,
    ocrWaitForTextDisplayed,
} from './ocr/index.js'
import { determineNativeContext, getFolders, getInstanceData } from './utils.js'
import {
    toMatchScreenSnapshot,
    toMatchFullPageSnapshot,
    toMatchElementSnapshot,
    toMatchTabbablePageSnapshot
} from './matcher.js'
import { isSystemTesseractAvailable } from './ocr/utils/tesseract.js'
import { CONTRAST, SUPPORTED_LANGUAGES } from './ocr/utils/constants.js'
import type { VisualServiceOptions } from './types.js'
import { createOcrDir } from './ocr/utils/index.js'

const log = logger('@wdio/visual-service')
const visualElementCommands = { saveElement, checkElement }
const visualPageCommands = {
    saveScreen,
    saveFullPageScreen,
    saveTabbablePage,
    checkScreen,
    checkFullPageScreen,
    checkTabbablePage,
}
const ocrCommands = {
    ocrGetText,
    ocrGetElementPositionByText,
    ocrWaitForTextDisplayed,
    ocrClickOnText,
    ocrSetValue,
}

export default class WdioImageComparisonService extends BaseClass {
    #config: WebdriverIO.Config
    #currentFile?: string
    #currentFilePath?: string
    private _browser?: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
    private _isNativeContext: boolean | undefined
    private _ocrDir: string
    private _ocrLanguage: string
    private _ocrContrast: number

    constructor(options: VisualServiceOptions, _: WebdriverIO.Capabilities, config: WebdriverIO.Config) {
        super(options)
        this.#config = config
        this._isNativeContext = undefined
        this._ocrDir = createOcrDir(options, this.folders)
        this._ocrLanguage = options.ocr?.language || SUPPORTED_LANGUAGES.ENGLISH
        this._ocrContrast = options.ocr?.contrast || CONTRAST
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
        this._browser = browser
        this._isNativeContext = determineNativeContext(this._browser)

        if (!this._browser.isMultiremote) {
            log.info('Adding commands to global browser')
            await this.#addCommandsToBrowser(this._browser)
        } else {
            await this.#extendMultiremoteBrowser(capabilities as Capabilities.MultiRemoteCapabilities)
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
        } catch (err) {
            log.warn('Expect package not found. This means that the custom matchers `toMatchScreenSnapshot|toMatchFullPageSnapshot|toMatchElementSnapshot|toMatchTabbablePageSnapshot` are not added and can not be used. Please make sure to add it to your `package.json` if you want to use the Visual custom matchers.')
        }
    }

    beforeTest(test: Frameworks.Test) {
        this.#currentFile = (test.file || (test as Frameworks.Test & { filename?: string }).filename) as string

        this.#currentFilePath = resolve(dirname(this.#currentFile), FOLDERS.DEFAULT.BASE)
    }

    afterCommand (commandName:string, _args:string[], result:number|string, error:any) {
        // This is for the cases where in the E2E tests we switch to a WEBVIEW or back to NATIVE_APP context
        if (commandName === 'getContext' && error === undefined && typeof result === 'string') {
            this._isNativeContext = result.includes('NATIVE')
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

    async #extendMultiremoteBrowser (capabilities: Capabilities.MultiRemoteCapabilities) {
        const browser = this._browser as WebdriverIO.MultiRemoteBrowser
        const browserNames = Object.keys(capabilities)
        const self = this
        log.info(`Adding commands to Multi Browser: ${browserNames.join(', ')}`)

        for (const browserName of browserNames) {
            const multiremoteBrowser = browser as WebdriverIO.MultiRemoteBrowser
            const browserInstance = multiremoteBrowser.getInstance(browserName)
            await this.#addCommandsToBrowser(browserInstance)
        }

        /**
         * Add all visual and OCR commands to the global browser object that will execute
         * on each browser in the Multi Remote. This involves mapping through both the visualElementCommands,
         * visualPageCommands, and ocrCommands.
         */
        const allCommands = {
            ...visualElementCommands,
            ...visualPageCommands,
            ...ocrCommands
        }
        for (const command of Object.keys(allCommands)) {
            browser.addCommand(command, async function (...args: unknown[]) {
                const returnData: Record<string, any> = {}

                // Prepare to handle OCR command specifics.
                if (command.startsWith('ocr')) {
                    if (typeof args[0] === 'object' && args[0] !== null) {
                        const options = args[0] as Record<string, any>
                        options.contrast = options.contrast || self._ocrContrast
                        args[0] = options
                    }
                }

                for (const browserName of browserNames) {
                    const multiremoteBrowser = browser as WebdriverIO.MultiRemoteBrowser
                    const browserInstance = multiremoteBrowser.getInstance(browserName) as WebdriverIO.Browser & Record<string, any>

                    if (typeof browserInstance[command] === 'function') {
                        returnData[browserName] = await browserInstance[command].apply(browserInstance, args)
                    } else {
                        throw new Error(`Command ${command} is not a function on the browser instance ${browserName}`)
                    }
                }

                return returnData
            })
        }
    }

    async #addCommandsToBrowser(currentBrowser: WebdriverIO.Browser) {
        const instanceData = await getInstanceData(currentBrowser)
        const isTesseractAvailable = isSystemTesseractAvailable()
        const self = this

        for (const [commandName, command] of Object.entries(visualElementCommands)) {
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
                            screenShot: this.takeScreenshot.bind(currentBrowser),
                            takeElementScreenshot: this.takeElementScreenshot.bind(currentBrowser),
                        },
                        instanceData,
                        getFolders(elementOptions, self.folders, self.#getBaselineFolder()),
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

        for (const [commandName, command] of Object.entries(visualPageCommands)) {
            log.info(`Adding browser command "${commandName}" to browser object`)
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
                        getFolders(pageOptions, self.folders, self.#getBaselineFolder()),
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

        for (const [commandName, command] of Object.entries(ocrCommands)) {
            log.info(`Adding browser command "${commandName}" to browser object`)
            currentBrowser.addCommand(
                commandName,
                function (this: typeof currentBrowser, options) {
                    return command({
                        ...options,
                        contrast: options.contrast || self._ocrContrast,
                        isTesseractAvailable,
                        language: options.language || self._ocrLanguage,
                        ocrImagesPath: self._ocrDir,
                    })
                }
            )
        }
    }
}
