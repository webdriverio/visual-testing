import logger from '@wdio/logger'
import type { Capabilities } from '@wdio/types'
import { isSystemTesseractAvailable } from './utils/tesseract.js'
import { CONTRAST, DEFAULT_IMAGES_FOLDER, SUPPORTED_LANGUAGES } from './utils/constants.js'
import { createOcrDir } from './utils/index.js'
import type { OcrOptions } from './types.js'
import ocrGetText from './commands/ocrGetText.js'
import ocrGetElementPositionByText from './commands/ocrGetElementPositionByText.js'
import ocrWaitForTextDisplayed from './commands/ocrWaitForTextDisplayed.js'
import ocrClickOnText from './commands/ocrClickOnText.js'
import ocrSetValue from './commands/ocrSetValue.js'

const log = logger('@wdio/ocr-service')
const ocrCommands = {
    ocrGetText,
    ocrGetElementPositionByText,
    ocrWaitForTextDisplayed,
    ocrClickOnText,
    ocrSetValue,
}

export default class WdioOcrService {
    private _browser?: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
    private _ocrDir: string
    private _ocrLanguage: string
    private _ocrContrast: number
    private _isTesseractAvailable: boolean

    constructor(options: OcrOptions) {
        this._ocrDir = createOcrDir(options?.imagesFolder || DEFAULT_IMAGES_FOLDER)
        this._ocrLanguage = options?.language || SUPPORTED_LANGUAGES.ENGLISH
        this._ocrContrast = options?.contrast || CONTRAST
        this._ocrLanguage = options?.language || SUPPORTED_LANGUAGES.ENGLISH
        this._isTesseractAvailable = isSystemTesseractAvailable()
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

        if (!this._browser.isMultiremote) {
            log.info('Adding commands to global browser')
            await this.#addCommandsToBrowser(this._browser)
        } else {
            await this.#extendMultiremoteBrowser(capabilities as Capabilities.RequestedMultiremoteCapabilities)
        }
    }

    async #extendMultiremoteBrowser (capabilities: Capabilities.RequestedMultiremoteCapabilities) {
        const browser = this._browser as WebdriverIO.MultiRemoteBrowser
        const browserNames = Object.keys(capabilities)
        const self = this
        log.info(`Adding commands to Multi Browser: ${browserNames.join(', ')}`)
        /**
         * Add all commands to the global browser object that will execute on each browser in the Multi Remote.
         */
        for (const commandName of Object.keys(ocrCommands)) {
            browser.addCommand(commandName, async function (...args: unknown[]) {
                const returnData: Record<string, any> = {}

                if (typeof args[0] === 'object' && args[0] !== null) {
                    const options = args[0] as Record<string, any>
                    options.ocrImagesPath = options?.imagesFolder || self._ocrDir
                    options.contrast = options?.contrast || self._ocrContrast
                    options.language = options?.language || self._ocrLanguage
                    options.isTesseractAvailable = self._isTesseractAvailable
                    args[0] = options
                }

                for (const browserName of browserNames) {
                    const multiremoteBrowser = browser as WebdriverIO.MultiRemoteBrowser
                    const browserInstance = multiremoteBrowser.getInstance(browserName) as WebdriverIO.Browser & Record<string, any>

                    if (typeof browserInstance[commandName] === 'function') {
                        returnData[browserName] = await browserInstance[commandName].apply(browserInstance, args)
                    } else {
                        throw new Error(`Command ${commandName} is not a function on the browser instance ${browserName}`)
                    }
                }

                return returnData
            })
        }
        /**
         * Add all commands to each instance (but Single Remote version)
         */
        for (const browserName of browserNames) {
            const multiremoteBrowser = browser as WebdriverIO.MultiRemoteBrowser
            const browserInstance = multiremoteBrowser.getInstance(browserName)
            await this.#addCommandsToBrowser(browserInstance)
        }
    }

    async #addCommandsToBrowser(currentBrowser: WebdriverIO.Browser) {
        const self = this

        for (const [commandName, command] of Object.entries(ocrCommands)) {
            log.info(`Adding browser command "${commandName}" to browser object`)
            currentBrowser.addCommand(
                commandName,
                function (this: typeof currentBrowser, options) {
                    return command.bind(this)({
                        ...options,
                        ocrImagesPath: self._ocrDir,
                        contrast: options?.contrast || self._ocrContrast,
                        language: options?.language || self._ocrLanguage,
                        isTesseractAvailable: self._isTesseractAvailable
                    })
                }
            )
        }
    }
}