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
import type {
    ClickOnTextOptions,
    GetElementPositionByTextOptions,
    GetTextOptions,
    SetValueOptions,
    WaitForTextDisplayedOptions,
} from './ocr/types.js'
import { isSystemTesseractAvailable } from './ocr/utils/tesseract.js'
import { SUPPORTED_LANGUAGES } from './ocr/utils/constants.js'
import type { VisualServiceOptions } from './types.js'
import { createOcrDir } from './ocr/utils/index.js'

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
    #config: WebdriverIO.Config
    #currentFile?: string
    #currentFilePath?: string
    private _browser?: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
    private _isNativeContext: boolean | undefined
    private _options: VisualServiceOptions
    private _ocrDir: string
    private _ocrLanguage: string

    constructor(options: VisualServiceOptions, _: WebdriverIO.Capabilities, config: WebdriverIO.Config) {
        super(options)
        this.#config = config
        this._isNativeContext = undefined
        this._options = options
        this._ocrDir = createOcrDir(options, this.folders)
        this._ocrLanguage = options.ocr?.language || SUPPORTED_LANGUAGES.ENGLISH
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
        this.#currentFile = test.file
        this.#currentFilePath = resolve(dirname(test.file), FOLDERS.DEFAULT.BASE)
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
        log.info(`Adding commands to Multi Browser: ${browserNames.join(', ')}`)

        for (const browserName of browserNames) {
            const multiremoteBrowser = browser as WebdriverIO.MultiRemoteBrowser
            const browserInstance = multiremoteBrowser.getInstance(browserName)
            await this.#addCommandsToBrowser(browserInstance)
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

    async #addCommandsToBrowser(currentBrowser: WebdriverIO.Browser) {
        const instanceData = await getInstanceData(currentBrowser)
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

        for (const [commandName, command] of Object.entries(pageCommands)) {
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

        const isTesseractAvailable = isSystemTesseractAvailable()

        log.info('Adding browser command "ocrGetText" to browser object')
        currentBrowser.addCommand('ocrGetText', function (options: GetTextOptions) {
            const { element, language } = options
            return ocrGetText({
                element,
                isTesseractAvailable,
                language: language || self._ocrLanguage,
                ocrImagesPath: self._ocrDir,
            })
        })

        log.info('Adding browser command "ocrGetElementPositionByText" to browser object')
        currentBrowser.addCommand('ocrGetElementPositionByText', function (options: GetElementPositionByTextOptions) {
            const { element, fuzzyFindOptions, language, text } = options
            return ocrGetElementPositionByText({
                element,
                isTesseractAvailable,
                fuzzyFindOptions,
                language: language || self._ocrLanguage,
                ocrImagesPath: self._ocrDir,
                text,
            })
        })

        log.info('Adding browser command "ocrWaitForTextDisplayed" to browser object')
        currentBrowser.addCommand('ocrWaitForTextDisplayed', function (options: WaitForTextDisplayedOptions) {
            const { element, fuzzyFindOptions, language, text } = options
            return ocrWaitForTextDisplayed({
                element,
                isTesseractAvailable,
                fuzzyFindOptions,
                language: language || self._ocrLanguage,
                ocrImagesPath: self._ocrDir,
                text,
            })
        })

        log.info('Adding browser command "ocrClickOnText" to browser object')
        currentBrowser.addCommand('ocrClickOnText', function (options: ClickOnTextOptions) {
            const { element, fuzzyFindOptions, language, text } = options
            return ocrClickOnText({
                element,
                isTesseractAvailable,
                fuzzyFindOptions,
                language: language || self._ocrLanguage,
                ocrImagesPath: self._ocrDir,
                text,
            })
        })

        log.info('Adding browser command "ocrSetValue" to browser object')
        currentBrowser.addCommand('ocrSetValue', function (options: SetValueOptions) {
            const { element, fuzzyFindOptions, language, submitValue, text, value } = options
            return ocrSetValue({
                element,
                isTesseractAvailable,
                fuzzyFindOptions,
                language: language || self._ocrLanguage,
                ocrImagesPath: self._ocrDir,
                submitValue,
                text,
                value,
            })
        })
    }
}
