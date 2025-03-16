import BaseClass from './base.js'
import saveScreen from './commands/saveScreen.js'
import saveElement from './commands/saveElement.js'
import saveFullPageScreen from './commands/saveFullPageScreen.js'
import saveTabbablePage from './commands/saveTabbablePage.js'
import checkScreen from './commands/checkScreen.js'
import checkElement from './commands/checkElement.js'
import checkFullPageScreen from './commands/checkFullPageScreen.js'
import checkTabbablePage from './commands/checkTabbablePage.js'
import { ClassOptions } from './helpers/options.interfaces.js'
import { ImageCompareResult } from './methods/images.interfaces.js'
import { IOS_OFFSETS, FOLDERS, DEFAULT_TEST_CONTEXT } from './helpers/constants.js'

export type { ScreenshotOutput } from './helpers/afterScreenshot.interfaces.js'
export type {
    CheckScreenMethodOptions,
    SaveScreenMethodOptions,
} from './commands/screen.interfaces.js'
export type {
    WicElement,
    CheckElementMethodOptions,
    SaveElementMethodOptions,
} from './commands/element.interfaces.js'
export type {
    CheckFullPageMethodOptions,
    SaveFullPageMethodOptions,
} from './commands/fullPage.interfaces.js'
export type { TestContext } from './commands/check.interfaces.js'
export type { Folders } from './base.interfaces.js'
export type { InstanceData, MobileViewportRect } from './methods/instanceData.interfaces.js'
export type { ResultReport } from './methods/createCompareReport.js'

export {
    BaseClass,
    ClassOptions,
    ImageCompareResult,
    DEFAULT_TEST_CONTEXT,
    IOS_OFFSETS,
    FOLDERS,
    saveScreen,
    saveElement,
    saveFullPageScreen,
    saveTabbablePage,
    checkScreen,
    checkElement,
    checkFullPageScreen,
    checkTabbablePage,
}
