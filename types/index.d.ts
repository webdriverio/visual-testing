import {ScreenshotOutput} from "webdriver-image-comparison/build/helpers/afterScreenshot.interfaces";
import {ImageCompareResult} from "webdriver-image-comparison";
import {
    CheckScreenMethodOptions,
    SaveScreenMethodOptions
} from "webdriver-image-comparison/build/commands/screen.interfaces";
import {
    CheckElementMethodOptions,
    SaveElementMethodOptions,
} from "webdriver-image-comparison/build/commands/element.interfaces";
import {
    CheckFullPageMethodOptions,
    SaveFullPageMethodOptions
} from "webdriver-image-comparison/build/commands/fullPage.interfaces";

interface hideRemove {
    hideElements?: WebdriverIO.Element[];
    removeElements?: WebdriverIO.Element[];
}
// @ts-ignore
interface WdioCheckFullPageMethodOptions extends CheckFullPageMethodOptions, hideRemove {
    hideAfterFirstScroll?: WebdriverIO.Element[];
}
// @ts-ignore
interface WdioSaveFullPageMethodOptions extends SaveFullPageMethodOptions, hideRemove {
    hideAfterFirstScroll?: WebdriverIO.Element[];
}
// @ts-ignore
interface WdioSaveElementMethodOptions extends SaveElementMethodOptions, hideRemove{}
// @ts-ignore
interface WdioSaveScreenMethodOptions extends SaveScreenMethodOptions, hideRemove{}
// @ts-ignore
interface WdioCheckElementMethodOptions extends CheckElementMethodOptions, hideRemove{}
// @ts-ignore
interface WdioCheckScreenMethodOptions extends CheckScreenMethodOptions, hideRemove{}
// @ts-ignore

declare global {
    namespace WebdriverIO {
        interface Browser {
            /**
             * Saves an image of an element
             */
            saveElement(element: Element, tag: string, saveElementOptions?: WdioSaveElementMethodOptions): ScreenshotOutput;

            /**
             * Saves an image of a viewport
             */
            saveScreen(tag: string, saveScreenOptions?: WdioSaveScreenMethodOptions): ScreenshotOutput;

            /**
             * Saves an image of the complete screen
             */
            saveFullPageScreen(tag: string, saveFullPageScreenOptions?: WdioSaveFullPageMethodOptions): ScreenshotOutput;

            /**
             * Saves an image of the complete screen with the tabbable lines and dots
             */
            saveTabbablePage(tag: string, saveTabbableOptions?: WdioSaveFullPageMethodOptions): ScreenshotOutput;

            /**
             * Compare an image of an element
             */
            checkElement(element: Element, tag: string, checkElementOptions?: WdioCheckElementMethodOptions): (ImageCompareResult | number);

            /**
             * Compares an image of a viewport
             */
            checkScreen(tag: string, checkScreenOptions?: WdioCheckScreenMethodOptions): (ImageCompareResult | number);

            /**
             * Compares an image of the complete screen
             */
            checkFullPageScreen(tag: string, checkFullPageOptions?: WdioCheckFullPageMethodOptions): (ImageCompareResult | number);

            /**
             * Compares an image of the complete screen with the tabbable lines and dots
             */
            checkTabbablePage(tag: string, checkTabbableOptions?: WdioCheckFullPageMethodOptions): (ImageCompareResult | number);
        }
        interface Element {}
    }
}
