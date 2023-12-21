import { ScreenshotOutput } from "webdriver-image-comparison/build/helpers/afterScreenshot.interfaces";
import { ImageCompareResult } from "webdriver-image-comparison";
import {
    CheckScreenMethodOptions,
    SaveScreenMethodOptions,
} from "webdriver-image-comparison/build/commands/screen.interfaces";
import {
    CheckElementMethodOptions,
    SaveElementMethodOptions,
} from "webdriver-image-comparison/build/commands/element.interfaces";
import {
    CheckFullPageMethodOptions,
    SaveFullPageMethodOptions,
} from "webdriver-image-comparison/build/commands/fullPage.interfaces";

interface WdioIcsCommonOptions {
    hideElements?: WebdriverIO.Element[];
    removeElements?: WebdriverIO.Element[];
}
interface WdioIcsScrollOptions extends WdioCommonOptions {
    hideAfterFirstScroll?: WebdriverIO.Element[];
}

interface WdioCheckFullPageMethodOptions
    extends CheckFullPageMethodOptions,
        WdioIcsScrollOptions {}
interface WdioSaveFullPageMethodOptions
    extends SaveFullPageMethodOptions,
        WdioIcsScrollOptions {}
interface WdioSaveElementMethodOptions
    extends SaveElementMethodOptions,
        WdioIcsCommonOptions {}
interface WdioSaveScreenMethodOptions
    extends SaveScreenMethodOptions,
        WdioIcsCommonOptions {}
interface WdioCheckElementMethodOptions
    extends CheckElementMethodOptions,
        WdioIcsCommonOptions {}
interface WdioCheckScreenMethodOptions
    extends CheckScreenMethodOptions,
        WdioIcsCommonOptions {}

type MultiOutput = {
    [browserName: string]: ScreenshotOutput;
};
type Output = MultiOutput | ScreenshotOutput;
type MultiResult = {
    [browserName: string]: ImageCompareResult | number;
};
type Result = MultiResult | (ImageCompareResult | number);

declare global {
    namespace WebdriverIO {
        interface Browser {
            /**
             * Saves an image of an element
             */
            saveElement(
                element: Element,
                tag: string,
                saveElementOptions?: WdioSaveElementMethodOptions
            ): Promise<Output>;

            /**
             * Saves an image of a viewport
             */
            saveScreen(
                tag: string,
                saveScreenOptions?: WdioSaveScreenMethodOptions
            ): Promise<Output>;

            /**
             * Saves an image of the complete screen
             */
            saveFullPageScreen(
                tag: string,
                saveFullPageScreenOptions?: WdioSaveFullPageMethodOptions
            ): Promise<Output>;

            /**
             * Saves an image of the complete screen with the tabbable lines and dots
             */
            saveTabbablePage(
                tag: string,
                saveTabbableOptions?: WdioSaveFullPageMethodOptions
            ): Promise<Output>;

            /**
             * Compare an image of an element
             */
            checkElement(
                element: Element,
                tag: string,
                checkElementOptions?: WdioCheckElementMethodOptions
            ): Promise<Result>;

            /**
             * Compares an image of a viewport
             */
            checkScreen(
                tag: string,
                checkScreenOptions?: WdioCheckScreenMethodOptions
            ): Promise<Result>;

            /**
             * Compares an image of the complete screen
             */
            checkFullPageScreen(
                tag: string,
                checkFullPageOptions?: WdioCheckFullPageMethodOptions
            ): Promise<Result>;

            /**
             * Compares an image of the complete screen with the tabbable lines and dots
             */
            checkTabbablePage(
                tag: string,
                checkTabbableOptions?: WdioCheckFullPageMethodOptions
            ): Promise<Result>;
        }
        interface Element {}
        interface Capabilities {
            "wdio-ics:options"?:{
                logName?: string;
            }
        }
    }
}
