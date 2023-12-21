import BaseClass from './base.js'
import saveScreen from './commands/saveScreen.js'
import saveElement from './commands/saveElement.js'
import saveFullPageScreen from './commands/saveFullPageScreen.js'
import saveTabbablePage from './commands/saveTabbablePage.js'
import checkScreen from './commands/checkScreen.js'
import checkElement from './commands/checkElement.js'
import checkFullPageScreen from './commands/checkFullPageScreen.js'
import checkTabbablePage from './commands/checkTabbablePage.js'
import { ClassOptions } from './helpers/options.interface'
import { ImageCompareResult } from './methods/images.interfaces'

export {
    BaseClass,
    ClassOptions,
    ImageCompareResult,
    saveScreen,
    saveElement,
    saveFullPageScreen,
    saveTabbablePage,
    checkScreen,
    checkElement,
    checkFullPageScreen,
    checkTabbablePage,
}
