import { beforeEach, describe, it, expect, vi } from 'vitest'
import { join } from 'node:path'
import logger from '@wdio/logger'
import WdioOcrService from '../src/service.js'
import { createOcrDir } from '../src/utils/index.js'
import { CONTRAST, SUPPORTED_LANGUAGES } from '../src/utils/constants.js'
import ocrGetText from '../src/commands/ocrGetText.js'

vi.mock('../src/utils/index.js', () => ({
    createOcrDir: vi.fn(),
    isSystemTesseractAvailable: vi.fn(),
}))
const mockedGetText = 'Detected text'
vi.mock('../src/commands/ocrGetText.js', () => ({
    default: vi.fn(() => Promise.resolve(mockedGetText))
}))
vi.mock('../src/commands/ocrGetElementPositionByText.js', () => ({
    default: vi.fn(() => Promise.resolve({ x: 100, y: 100 }))
}))
vi.mock('../src/commands/ocrWaitForTextDisplayed.js', () => ({
    default: vi.fn(() => Promise.resolve(true))
}))
vi.mock('../src/commands/ocrClickOnText.js', () => ({
    default: vi.fn(() => Promise.resolve('Clicked'))
}))
vi.mock('../src/commands/ocrSetValue.js', () => ({
    default: vi.fn(() => Promise.resolve('Value Set'))
}))

let browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser

const log = logger('test')
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))

type CommandFunction = (name: string, fn: (...args: any[]) => any) => void;
interface BrowserInstance {
    commands: Record<string, (...args: any[]) => any>;
    addCommand: CommandFunction;
    sessionId: string;
    capabilities: { browserName: string };
    [key: string]: any;  // Adding index signature
}

interface Browser {
    commands: Record<string, (...args: any[]) => any>;
    addCommand: CommandFunction;
    capabilities: Record<string, any>;
    requestedCapabilities: Record<string, any>;
    instances: Record<string, BrowserInstance>;
    isMultiremote: boolean;
    getInstance: (name: string) => BrowserInstance;
    getInstances: () => string[];
    [key: string]: any;  // Adding index signature
}

function createBrowser(isMultiRemote = false): WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser {
    const browser: Browser = {
        commands: {},
        addCommand: vi.fn((name, fn) => {
            browser[name] = fn

            if (isMultiRemote) {
                Object.keys(browser.instances).forEach(key => {
                    browser.instances[key][name] = fn
                })
            }
        }),
        capabilities: {},
        requestedCapabilities: {},
        instances: {},
        isMultiremote:isMultiRemote,
        getInstance: vi.fn(name => {
            return browser.instances[name]
        }),
        getInstances: vi.fn(() => Object.keys(browser.instances)),
    }

    if (isMultiRemote) {
        const instanceNames = ['myChromeBrowser', 'myFirefoxBrowser']
        browser.instances = instanceNames.reduce<Record<string, BrowserInstance>>((acc, name) => {
            acc[name] = {
                commands: {},
                addCommand: vi.fn((commandName, commandFn) => {
                    acc[name].commands[commandName] = commandFn  // Ensuring proper indexing
                }),
                sessionId: 'session' + name,
                capabilities: { browserName: name.includes('Chrome') ? 'chrome' : 'firefox' },
            }
            return acc
        }, {})
    }

    return browser as unknown as WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
}

describe('WdioOcrService', () => {
    it('should initialize with default values if no options provided', () => {
        const expectedFolder = '.tmp/ocr'
        vi.mocked(createOcrDir).mockReturnValue(expectedFolder)
        const service = new WdioOcrService({})

        expect(service).toHaveProperty('_ocrDir', expectedFolder)
        expect(service).toHaveProperty('_ocrLanguage', SUPPORTED_LANGUAGES.ENGLISH)
        expect(service).toHaveProperty('_ocrContrast', CONTRAST)
    })

    it('should use provided options to initialize properties', () => {
        const options = {
            imagesFolder: 'custom-folder',
            language: SUPPORTED_LANGUAGES.SPANISH,
            contrast: 0.1,
        }
        vi.mocked(createOcrDir).mockReturnValue(options.imagesFolder)
        const service = new WdioOcrService(options)

        expect(service).toHaveProperty('_ocrDir', options.imagesFolder)
        expect(service).toHaveProperty('_ocrLanguage', SUPPORTED_LANGUAGES.SPANISH)
        expect(service).toHaveProperty('_ocrContrast', options.contrast)
    })

    it('should setup OCR commands in standalone mode', async () => {
        const expectedFolder = '.tmp/ocr'
        vi.mocked(createOcrDir).mockReturnValue(expectedFolder)
        const service = new WdioOcrService({})
        const browser = { addCommand: vi.fn(), capabilities: {}, requestedCapabilities: {} } as any as WebdriverIO.Browser
        const spy = vi.spyOn(service, 'before')

        await service.remoteSetup(browser as any)

        expect(spy).toHaveBeenCalledWith(browser.capabilities, [], browser)

        spy.mockRestore()
    })

    describe('before', () => {
        let service: WdioOcrService

        beforeEach(() => {
            vi.clearAllMocks()
            service = new WdioOcrService({})
        })

        it('should add OCR commands to a browser', async () => {
            const logSpy = vi.spyOn(log, 'info')
            browser = createBrowser()
            await service.before(browser.capabilities as any, [], browser)

            expect(logSpy).toHaveBeenCalledWith('Adding commands to global browser')
            expect(logSpy).toHaveBeenCalledWith('Adding browser command "ocrGetText" to browser object')
            expect(browser.addCommand).toHaveBeenCalledWith('ocrGetText', expect.any(Function))
            expect(logSpy).toHaveBeenCalledWith('Adding browser command "ocrGetElementPositionByText" to browser object')
            expect(browser.addCommand).toHaveBeenCalledWith('ocrGetElementPositionByText', expect.any(Function))
            expect(logSpy).toHaveBeenCalledWith('Adding browser command "ocrWaitForTextDisplayed" to browser object')
            expect(browser.addCommand).toHaveBeenCalledWith('ocrWaitForTextDisplayed', expect.any(Function))
            expect(logSpy).toHaveBeenCalledWith('Adding browser command "ocrClickOnText" to browser object')
            expect(browser.addCommand).toHaveBeenCalledWith('ocrClickOnText', expect.any(Function))
            expect(logSpy).toHaveBeenCalledWith('Adding browser command "ocrSetValue" to browser object')
            expect(browser.addCommand).toHaveBeenCalledWith('ocrSetValue', expect.any(Function))
        })

        // We're not going to check all methods that are added to the browser here, as they are all added in the same way
        it('added methods on the browser should be able to be called', async () => {
            const imagePath = 'path/to/image.png'
            vi.mocked(ocrGetText).mockResolvedValueOnce(mockedGetText)

            browser = createBrowser()
            await service.before(browser.capabilities as any, [], browser)
            // @ts-ignore
            const result = await browser.ocrGetText({ imagePath })

            expect(result).toBe(mockedGetText)
            expect(ocrGetText).toHaveBeenCalledWith({
                contrast: CONTRAST,
                isTesseractAvailable: true,
                language: SUPPORTED_LANGUAGES.ENGLISH,
                imagePath,
                ocrImagesPath: '.tmp/ocr'
            })
        })

        it('should add OCR commands to multiremote browsers correctly', async () => {
            const logSpy = vi.spyOn(log, 'info')
            browser = createBrowser(true)
            browser.isMultiremote = true
            browser.capabilities = {
                myChromeBrowser: {
                    capabilities: { browserName: 'chrome' }
                },
                myFirefoxBrowser: {
                    capabilities: { browserName: 'firefox' }
                }
            }
            await service.before(browser.capabilities as any, [], browser)
            expect(logSpy).toHaveBeenCalledWith('Adding commands to Multi Browser: myChromeBrowser, myFirefoxBrowser')
            expect(logSpy).toHaveBeenCalledWith('Adding browser command "ocrGetText" to browser object')
            expect(logSpy).toHaveBeenCalledWith('Adding browser command "ocrGetElementPositionByText" to browser object')
            expect(logSpy).toHaveBeenCalledWith('Adding browser command "ocrWaitForTextDisplayed" to browser object')
            expect(logSpy).toHaveBeenCalledWith('Adding browser command "ocrClickOnText" to browser object')
            expect(logSpy).toHaveBeenCalledWith('Adding browser command "ocrSetValue" to browser object')
            // @ts-ignore
            expect(browser.getInstance).toHaveBeenCalledTimes(2)

            // @ts-ignore
            const chromeInstance = browser.getInstance('myChromeBrowser')
            // @ts-ignore
            const firefoxInstance = browser.getInstance('myFirefoxBrowser')
            expect(chromeInstance.addCommand).toHaveBeenCalled()
            expect(firefoxInstance.addCommand).toHaveBeenCalled()
        })

        // We're not going to check all methods that are added to the multie remote browser here, just check how complex it
        // already is to mock the browser instances. So we're stopping here.
    })
})
