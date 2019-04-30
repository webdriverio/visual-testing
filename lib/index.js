import BaseClass from 'webdriver-image-comparison/build/base'
import saveScreen from 'webdriver-image-comparison/build/commands/saveScreen'
import checkScreen from 'webdriver-image-comparison/build/commands/checkScreen'
import saveElement from 'webdriver-image-comparison/build/commands/saveElement'
import checkElement from 'webdriver-image-comparison/build/commands/checkElement'
import saveFullPageScreen from 'webdriver-image-comparison/build/commands/saveFullPageScreen'
import checkFullPageScreen from 'webdriver-image-comparison/build/commands/checkFullPageScreen'

export default class WdioImageComparisonService extends BaseClass {
    constructor(options) {
        super(options);
    }

    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`. It is the perfect place to define custom commands.
     *
     * @param {Array.<Object>} capabilities list of capabilities details
     */
    before(capabilities) {
        const instanceData = getInstanceData(capabilities);
        const folders = this.folders
        const defaultOptions = this.defaultOptions

        /**
         * Saves an image of an element
         */
        browser.addCommand('saveElement', function (element, tag, saveElementOptions = {}) {
            return saveElement({
                    executor: this.execute.bind(browser),
                    screenShot: this.takeScreenshot.bind(browser),
                },
                instanceData,
                folders,
                element,
                tag,
                {
                    wic: defaultOptions,
                    method: saveElementOptions,
                },
            );
        });

        /**
         * Saves an image of a viewport
         */
        browser.addCommand('saveScreen', function (tag, saveScreenOptions = {}) {
            return saveScreen({
                    executor: this.execute.bind(browser),
                    screenShot: this.takeScreenshot.bind(browser),
                },
                instanceData,
                folders,
                tag,
                {
                    wic: defaultOptions,
                    method: saveScreenOptions,
                },
            );
        });

        /**
         * Saves an image of the complete screen
         */
        browser.addCommand('saveFullPageScreen', function (tag, saveFullPageScreenOptions = {}) {
            return saveFullPageScreen({
                    executor: this.execute.bind(browser),
                    screenShot: this.takeScreenshot.bind(browser),
                },
                instanceData,
                folders,
                tag,
                {
                    wic: defaultOptions,
                    method: saveFullPageScreenOptions,
                },
            );
        });

        /**
         * Compare an image of an element
         */
        browser.addCommand('checkElement', function (element, tag, checkElementOptions = {}) {
            return checkElement({
                    executor: this.execute.bind(browser),
                    screenShot: this.takeScreenshot.bind(browser),
                },
                instanceData,
                folders,
                element,
                tag,
                {
                    wic: defaultOptions,
                    method: checkElementOptions,
                },
            );
        });

        /**
         * Compares an image of a viewport
         */
        browser.addCommand('checkScreen', function (tag, checkScreenOptions = {}) {
            return checkScreen({
                    executor: this.execute.bind(browser),
                    screenShot: this.takeScreenshot.bind(browser),
                },
                instanceData,
                folders,
                tag,
                {
                    wic: defaultOptions,
                    method: checkScreenOptions,
                },
            );
        });

        /**
         * Compares an image of the complete screen
         */
        browser.addCommand('checkFullPageScreen', function (tag, checkFullPageOptions = {}) {
            return checkFullPageScreen({
                    executor: this.execute.bind(browser),
                    screenShot: this.takeScreenshot.bind(browser),
                },
                instanceData,
                folders,
                tag,
                {
                    wic: defaultOptions,
                    method: checkFullPageOptions,
                },
            );
        });
    }
}


/**
 * Get the instance data
 *
 * @returns {{
 *    browserName: string,
 *    deviceName: string,
 *    logName: string,
 *    name: string,
 *    nativeWebScreenshot: boolean,
 *    platformName: string
 *  }}
 */
function getInstanceData(capabilities) {

    // Substract the needed data from the running instance
    const browserName = (capabilities.browserName || '').toLowerCase();
    const logName = capabilities.logName
        || (capabilities[ 'sauce:options' ] ? capabilities[ 'sauce:options' ].logName : null)
        || (capabilities[ 'appium:options' ] ? capabilities[ 'appium:options' ].logName : null)
        || '';
    const name = capabilities.name || '';

    // For mobile
    const platformName = (capabilities.platformName || '').toLowerCase();
    const deviceName = (capabilities.deviceName || '').toLowerCase();
    const nativeWebScreenshot = !!capabilities.nativeWebScreenshot;

    return {
        browserName,
        deviceName,
        logName,
        name,
        nativeWebScreenshot,
        platformName,
    };
}
