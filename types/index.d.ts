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

// @ts-ignore
interface WdioCheckFullPageMethodOptions extends CheckFullPageMethodOptions {
    hideElements?: WebdriverIO.Element[];
    removeElements?: WebdriverIO.Element[];
    hideAfterFirstScroll?: WebdriverIO.Element[];
}
// @ts-ignore
interface WdioSaveFullPageMethodOptions extends SaveFullPageMethodOptions {
    hideElements?: WebdriverIO.Element[];
    removeElements?: WebdriverIO.Element[];
    hideAfterFirstScroll?: WebdriverIO.Element[];
}
// @ts-ignore
interface WdioSaveElementMethodOptions extends SaveElementMethodOptions{
    hideElements?: WebdriverIO.Element[];
    removeElements?: WebdriverIO.Element[];}
// @ts-ignore
interface WdioSaveScreenMethodOptions extends SaveScreenMethodOptions{
    hideElements?: WebdriverIO.Element[];
    removeElements?: WebdriverIO.Element[];}
// @ts-ignore
interface WdioCheckElementMethodOptions extends CheckElementMethodOptions{
    hideElements?: WebdriverIO.Element[];
    removeElements?: WebdriverIO.Element[];}
// @ts-ignore
interface WdioCheckScreenMethodOptions extends CheckScreenMethodOptions{
    hideElements?: WebdriverIO.Element[];
    removeElements?: WebdriverIO.Element[];}
// @ts-ignore

type MultiOutput = {
    [browserName: string] : ScreenshotOutput
}

type Output = MultiOutput | ScreenshotOutput

type MultiResult = {
    [browserName: string] : (ImageCompareResult | number)
}

type Result = MultiResult | (ImageCompareResult | number)

declare global {
    namespace WebdriverIO {
        interface Browser {
            /**
             * Saves an image of an element
             */
            saveElement(element: Element, tag: string, saveElementOptions?: WdioSaveElementMethodOptions): Output;

            /**
             * Saves an image of a viewport
             */
            saveScreen(tag: string, saveScreenOptions?: WdioSaveScreenMethodOptions): Output;

            /**
             * Saves an image of the complete screen
             */
            saveFullPageScreen(tag: string, saveFullPageScreenOptions?: WdioSaveFullPageMethodOptions): Output;

            /**
             * Saves an image of the complete screen with the tabbable lines and dots
             */
            saveTabbablePage(tag: string, saveTabbableOptions?: WdioSaveFullPageMethodOptions): Output;

            /**
             * Compare an image of an element
             */
            checkElement(element: Element, tag: string, checkElementOptions?: WdioCheckElementMethodOptions): Result;

            /**
             * Compares an image of a viewport
             */
            checkScreen(tag: string, checkScreenOptions?: WdioCheckScreenMethodOptions): Result;

            /**
             * Compares an image of the complete screen
             */
            checkFullPageScreen(tag: string, checkFullPageOptions?: WdioCheckFullPageMethodOptions): Result;

            /**
             * Compares an image of the complete screen with the tabbable lines and dots
             */
            checkTabbablePage(tag: string, checkTabbableOptions?: WdioCheckFullPageMethodOptions): Result;
        }
        interface Element {}
    }
}
