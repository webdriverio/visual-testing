import BaseClass from 'webdriver-image-comparison/build/base'
import saveScreen from 'webdriver-image-comparison/build/commands/saveScreen'
import checkScreen from 'webdriver-image-comparison/build/commands/checkScreen'
import saveElement from 'webdriver-image-comparison/build/commands/saveElement'
import checkElement from 'webdriver-image-comparison/build/commands/checkElement'
import saveFullPageScreen from 'webdriver-image-comparison/build/commands/saveFullPageScreen'
import checkFullPageScreen from 'webdriver-image-comparison/build/commands/checkFullPageScreen'
import saveTabbablePage from 'webdriver-image-comparison/build/commands/saveTabbablePage'
import checkTabbablePage from 'webdriver-image-comparison/build/commands/checkTabbablePage'
import {getFolders, getInstanceData} from './utils'

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
            console.log('Adding to global browser')
            this.addCommandsToBrowser(capabilities, browser)
        } else {
            const browserNames = Object.keys(capabilities)
            console.log('Adding to multibrowser: ', browserNames)
            for(const browserName of browserNames) {
                this.addCommandsToBrowser(capabilities[browserName].capabilities, global[browserName])
            }
            //Add all the commands to the global browser object that will execute on each browser in the Multi Remote
            browser.addCommand('saveElement', function(element, tag, saveElementOptions = {}) {
                const returnData = {}
                for(const browserName of browserNames) {
                    returnData[browserName] = global[browserName].saveElement(element, tag, saveElementOptions)
                }
                return returnData
            })
            browser.addCommand('saveScreen', function (tag, saveScreenOptions = {}) {
                const returnData = {}
                for(const browserName of browserNames) {
                    returnData[browserName] = global[browserName].saveScreen(tag, saveScreenOptions)
                }
                return returnData
            })
            browser.addCommand('saveFullPageScreen', function (tag, saveFullPageScreenOptions = {}) {
                const returnData = {}
                for(const browserName of browserNames) {
                    returnData[browserName] = global[browserName].saveFullPageScreen(tag, saveFullPageScreenOptions)
                }
                return returnData
            })
            browser.addCommand('saveTabbablePage', function (tag, saveTabbableOptions = {}) {
                const returnData = {}
                for(const browserName of browserNames) {
                    returnData[browserName] = global[browserName].saveTabbablePage(tag, saveTabbableOptions)
                }
                return returnData
            })
            browser.addCommand('checkElement', function (element, tag, checkElementOptions = {}) {
                const returnData = {}
                for(const browserName of browserNames) {
                    returnData[browserName] = global[browserName].checkElement(element, tag, checkElementOptions)
                }
                return returnData
            })
            browser.addCommand('checkScreen', function (tag, checkScreenOptions = {}) {
                const returnData = {}
                for(const browserName of browserNames) {
                    returnData[browserName] = global[browserName].checkScreen(tag, checkScreenOptions)
                }
                return returnData
            })
            browser.addCommand('checkFullPageScreen', function (tag, checkFullPageOptions = {}) {
                const returnData = {}
                for(const browserName of browserNames) {
                    returnData[browserName] = global[browserName].checkFullPageScreen(tag, checkFullPageOptions)
                }
                return returnData
            })
            browser.addCommand('checkTabbablePage', function (tag, checkTabbableOptions = {}) {
                const returnData = {}
                for(const browserName of browserNames) {
                    returnData[browserName] = global[browserName].checkTabbablePage(tag, checkTabbableOptions)
                }
                return returnData
            })
        }
    }

    addCommandsToBrowser(capabilities, currentBrowser) {
        const instanceData = getInstanceData(capabilities, currentBrowser)

        const folders = this.folders
        const defaultOptions = this.defaultOptions

        /**
         * Saves an image of an element
         */
        currentBrowser.addCommand('saveElement', function (element, tag, saveElementOptions = {}) {
            return saveElement({
                executor: this.execute.bind(currentBrowser),
                screenShot: this.takeScreenshot.bind(currentBrowser),
            },
            instanceData,
            getFolders(saveElementOptions, folders),
            element,
            tag,
            {
                wic: defaultOptions,
                method: saveElementOptions,
            },
            )
        })

        /**
         * Saves an image of a viewport
         */
        currentBrowser.addCommand('saveScreen', function (tag, saveScreenOptions = {}) {
            return saveScreen({
                executor: this.execute.bind(currentBrowser),
                screenShot: this.takeScreenshot.bind(currentBrowser),
            },
            instanceData,
            getFolders(saveScreenOptions, folders),
            tag,
            {
                wic: defaultOptions,
                method: saveScreenOptions,
            },
            )
        })

        /**
         * Saves an image of the complete screen
         */
        currentBrowser.addCommand('saveFullPageScreen', function (tag, saveFullPageScreenOptions = {}) {
            return saveFullPageScreen({
                executor: this.execute.bind(currentBrowser),
                screenShot: this.takeScreenshot.bind(currentBrowser),
            },
            instanceData,
            getFolders(saveFullPageScreenOptions, folders),
            tag,
            {
                wic: defaultOptions,
                method: saveFullPageScreenOptions,
            },
            )
        })

        /**
         * Saves an image of the complete screen with the tabbable lines and dots
         */
        currentBrowser.addCommand('saveTabbablePage', function (tag, saveTabbableOptions = {}) {
            return saveTabbablePage({
                executor: this.execute.bind(currentBrowser),
                screenShot: this.takeScreenshot.bind(currentBrowser),
            },
            instanceData,
            getFolders(saveTabbableOptions, folders),
            tag,
            {
                wic: defaultOptions,
                method: saveTabbableOptions,
            },
            )
        })

        /**
         * Compare an image of an element
         */
        currentBrowser.addCommand('checkElement', function (element, tag, checkElementOptions = {}) {
            return checkElement({
                executor: this.execute.bind(currentBrowser),
                screenShot: this.takeScreenshot.bind(currentBrowser),
            },
            instanceData,
            getFolders(checkElementOptions, folders),
            element,
            tag,
            {
                wic: defaultOptions,
                method: checkElementOptions,
            },
            )
        })

        /**
         * Compares an image of a viewport
         */
        currentBrowser.addCommand('checkScreen', function (tag, checkScreenOptions = {}) {
            return checkScreen({
                executor: this.execute.bind(currentBrowser),
                screenShot: this.takeScreenshot.bind(currentBrowser),
            },
            instanceData,
            getFolders(checkScreenOptions, folders),
            tag,
            {
                wic: defaultOptions,
                method: checkScreenOptions,
            },
            )
        })

        /**
         * Compares an image of the complete screen
         */
        currentBrowser.addCommand('checkFullPageScreen', function (tag, checkFullPageOptions = {}) {
            return checkFullPageScreen({
                executor: this.execute.bind(currentBrowser),
                screenShot: this.takeScreenshot.bind(currentBrowser),
            },
            instanceData,
            getFolders(checkFullPageOptions, folders),
            tag,
            {
                wic: defaultOptions,
                method: checkFullPageOptions,
            },
            )
        })

        /**
         * Compares an image of the complete screen with the tabbable lines and dots
         */
        currentBrowser.addCommand('checkTabbablePage', function (tag, checkTabbableOptions = {}) {
            return checkTabbablePage({
                executor: this.execute.bind(currentBrowser),
                screenShot: this.takeScreenshot.bind(currentBrowser),
            },
            instanceData,
            getFolders(checkTabbableOptions, folders),
            tag,
            {
                wic: defaultOptions,
                method: checkTabbableOptions,
            },
            )
        })
    }
}
