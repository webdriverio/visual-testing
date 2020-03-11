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

declare global {
    namespace WebdriverIO {
        interface Browser {
            /**
             * Saves an image of an element
             */
            saveElement(element: Element, tag: string, saveElementOptions?: SaveElementMethodOptions): ScreenshotOutput;

            /**
             * Saves an image of a viewport
             */
            saveScreen(tag: string, saveScreenOptions?: SaveScreenMethodOptions): ScreenshotOutput;

            /**
             * Saves an image of the complete screen
             */
            saveFullPageScreen(tag: string, saveFullPageScreenOptions?: SaveFullPageMethodOptions): ScreenshotOutput;

            /**
             * Saves an image of the complete screen with the tabbable lines and dots
             */
            saveTabbablePage(tag: string, saveTabbableOptions?: SaveFullPageMethodOptions): ScreenshotOutput;

            /**
             * Compare an image of an element
             */
            checkElement(element: Element, tag: string, checkElementOptions?: CheckElementMethodOptions): (ImageCompareResult | number);

            /**
             * Compares an image of a viewport
             */
            checkScreen(tag: string, checkScreenOptions?: CheckScreenMethodOptions): (ImageCompareResult | number);

            /**
             * Compares an image of the complete screen
             */
            checkFullPageScreen(tag: string, checkFullPageOptions?: CheckFullPageMethodOptions): (ImageCompareResult | number);

            /**
             * Compares an image of the complete screen with the tabbable lines and dots
             */
            checkTabbablePage(tag: string, checkTabbableOptions?: CheckFullPageMethodOptions): (ImageCompareResult | number);
        }
    }
}
