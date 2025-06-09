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
import { DEFAULT_TEST_CONTEXT, DEVICE_RECTANGLES, IOS_OFFSETS, FOLDERS, NOT_KNOWN } from './helpers/constants.js'
import { getMobileScreenSize, getMobileViewPortPosition } from './helpers/utils.js'
import { InternalCheckElementMethodOptions, InternalCheckFullPageMethodOptions, InternalCheckScreenMethodOptions, InternalCheckTabbablePageMethodOptions } from './commands/check.interfaces.js'
import { InternalSaveElementMethodOptions, InternalSaveFullPageMethodOptions, InternalSaveScreenMethodOptions, InternalSaveTabbablePageMethodOptions } from './commands/save.interfaces.js'

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
export type { TestContext } from './methods/compareReport.interfaces.js'
export type { Folders } from './base.interfaces.js'
export type { InstanceData } from './methods/instanceData.interfaces.js'
export type { DeviceRectangles } from './methods/rectangles.interfaces.js'
export type { ResultReport } from './methods/createCompareReport.js'

export {
    // Constants
    DEFAULT_TEST_CONTEXT,
    DEVICE_RECTANGLES,
    IOS_OFFSETS,
    FOLDERS,
    NOT_KNOWN,
    // Base class
    BaseClass,
    // Commands
    saveScreen,
    saveElement,
    saveFullPageScreen,
    saveTabbablePage,
    checkScreen,
    checkElement,
    checkFullPageScreen,
    checkTabbablePage,
    getMobileScreenSize,
    getMobileViewPortPosition,
    // Interfaces
    InternalSaveScreenMethodOptions,
    InternalSaveElementMethodOptions,
    InternalSaveFullPageMethodOptions,
    InternalSaveTabbablePageMethodOptions,
    InternalCheckScreenMethodOptions,
    InternalCheckElementMethodOptions,
    InternalCheckFullPageMethodOptions,
    InternalCheckTabbablePageMethodOptions,
    ImageCompareResult,
    ClassOptions,
}
