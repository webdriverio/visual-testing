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

export type { ScreenshotOutput } from './helpers/afterScreenshot.interfaces'
export type {
    CheckScreenMethodOptions,
    SaveScreenMethodOptions,
} from './commands/screen.interfaces'
export type {
    CheckElementMethodOptions,
    SaveElementMethodOptions,
} from './commands/element.interfaces'
export type {
    CheckFullPageMethodOptions,
    SaveFullPageMethodOptions,
} from './commands/fullPage.interfaces'

export type { Folders } from './base.interface.js'
export type { InstanceData } from './methods/instanceData.interfaces.js'

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
