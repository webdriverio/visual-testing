import BaseClass from 'webdriver-image-comparison/build/base'
import saveScreen from 'webdriver-image-comparison/build/commands/saveScreen'
import checkScreen from 'webdriver-image-comparison/build/commands/checkScreen'
import saveElement from 'webdriver-image-comparison/build/commands/saveElement'
import checkElement from 'webdriver-image-comparison/build/commands/checkElement'
import saveFullPageScreen from 'webdriver-image-comparison/build/commands/saveFullPageScreen'
import checkFullPageScreen from 'webdriver-image-comparison/build/commands/checkFullPageScreen'
import saveTabbablePage from 'webdriver-image-comparison/build/commands/saveTabbablePage'
import checkTabbablePage from 'webdriver-image-comparison/build/commands/checkTabbablePage'
import logger from '@wdio/logger'
import {getFolders, getInstanceData} from './utils'

const log = logger('wdio-image-comparison-service')

const elementCommands = {saveElement, checkElement}
const pageCommands = {saveScreen, saveFullPageScreen, saveTabbablePage, checkScreen, checkFullPageScreen, checkTabbablePage}

export default class WdioImageComparisonService extends BaseClass {
    constructor(options) {
        super(options)
    }

    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`. It is the perfect place to define custom commands.
     *
     * @param {Array.<Object>} capabilities list of capabilities details
     */
    before(capabilities) {
        if(typeof capabilities['browserName'] !== 'undefined') {
            log.info('Adding commands to global browser')
            this.addCommandsToBrowser(capabilities, browser)
        } else {
            const browserNames = Object.keys(capabilities)
            log.info('Adding commands to Multi Browser: ', browserNames)
            for(const browserName of browserNames) {
                this.addCommandsToBrowser(capabilities[browserName].capabilities, global[browserName])
            }
            //Add all the commands to the global browser object that will execute on each browser in the Multi Remote
            for(const command of [...Object.keys(elementCommands), ...Object.keys(pageCommands)]) {
                browser.addCommand(command, function() {
                    const returnData = {}
                    for(const browserName of browserNames) {
                        returnData[browserName] = global[browserName][command].call(global[browserName],...arguments)
                    }
                    return returnData
                })
            }
        }
    }

    addCommandsToBrowser(capabilities, currentBrowser) {
        const instanceData = getInstanceData(capabilities, currentBrowser)

        const folders = this.folders
        const defaultOptions = this.defaultOptions

        for(const [commandName, command] of Object.entries(elementCommands)) {
            currentBrowser.addCommand(commandName, function(element, tag, elementOptions = {}) {
                return command({
                    executor: this.execute.bind(currentBrowser),
                    screenShot: this.takeScreenshot.bind(currentBrowser),
                },
                instanceData,
                getFolders(elementOptions, folders),
                element,
                tag,
                {
                    wic: defaultOptions,
                    method: elementOptions,
                },
                )
            })
        }

        for(const [commandName, command] of Object.entries(pageCommands)) {
            currentBrowser.addCommand(commandName, function(tag, pageOptions = {}) {
                return command({
                    executor: this.execute.bind(currentBrowser),
                    screenShot: this.takeScreenshot.bind(currentBrowser),
                },
                instanceData,
                getFolders(pageOptions, folders),
                tag,
                {
                    wic: defaultOptions,
                    method: pageOptions,
                },
                )
            })
        }
    }
}
