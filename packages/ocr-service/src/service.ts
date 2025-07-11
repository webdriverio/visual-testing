import logger from '@wdio/logger'
import { isSystemTesseractAvailable } from './utils/tesseract.js'
import { CONTRAST, DEFAULT_IMAGES_FOLDER, SUPPORTED_LANGUAGES } from './utils/constants.js'
import { createOcrDir } from './utils/index.js'
import type { OcrOptions } from './types.js'
import ocrGetText from './commands/ocrGetText.js'
import ocrGetElementPositionByText from './commands/ocrGetElementPositionByText.js'
import ocrWaitForTextDisplayed from './commands/ocrWaitForTextDisplayed.js'
import ocrClickOnText from './commands/ocrClickOnText.js'
import ocrSetValue from './commands/ocrSetValue.js'

const ocrCommands: {
    [key: string]: (options: any) => Promise<any>
} = {
    'ocrGetText': ocrGetText,
    'ocrGetElementPositionByText': ocrGetElementPositionByText,
    'ocrWaitForTextDisplayed': ocrWaitForTextDisplayed,
    'ocrClickOnText': ocrClickOnText,
    'ocrSetValue': ocrSetValue,
}

const log = logger('@wdio/ocr-service')

export default class WdioOcrService {
    private _ocrDir: string
    private _ocrLanguage: string
    private _ocrContrast: number
    private _isTesseractAvailable: boolean

    constructor(options: OcrOptions) {
        this._ocrDir = createOcrDir(options?.imagesFolder || DEFAULT_IMAGES_FOLDER)
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
        const self = this
        const browserNames = Object.keys(capabilities)
        /**
         * Add all OCR commands to the browser object and instances
         */
        for (const commandName of Object.keys(ocrCommands)) {
            log.info(`Adding browser command "${commandName}" to browser object`)
            browser.addCommand(commandName, async function (
                this: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
                ...args: unknown[]
            ) {
                if (typeof args[0] === 'object' && args[0] !== null) {
                    const options = args[0] as Record<string, any>
                    options.ocrImagesPath = options?.imagesFolder || self._ocrDir
                    options.contrast = options?.contrast || self._ocrContrast
                    options.language = options?.language || self._ocrLanguage
                    options.isTesseractAvailable = self._isTesseractAvailable
                    args[0] = options
                }

                const instancesToLoop: { 'browserName': string; 'browserInstance': WebdriverIO.Browser & Record<string, any> }[] = this.isMultiremote
                    ? Object.values(browserNames).map(browserName => ({
                        'browserName': browserName,
                        'browserInstance': this.getInstance(browserName),
                    }))
                    : [
                        {
                            'browserName': this.capabilities.browserName || 'browser',
                            'browserInstance': this as WebdriverIO.Browser & Record<string, any>,
                        },
                    ]

                const returnData: Record<string, any> = {}
                for (const { browserName, browserInstance } of instancesToLoop) {
                    if (typeof browserInstance[commandName] === 'function') {
                        returnData[browserName] = await ocrCommands[commandName].call(browserInstance, args[0])
                    } else {
                        throw new Error(`Command ${commandName} is not a function on the browser instance ${browserName}`)
                    }
                }
                if (this.isMultiremote) {
                    return returnData
                }
                return Object.values(returnData)[0]
            })
        }
    }
}
