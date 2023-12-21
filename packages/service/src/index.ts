import WdioImageComparisonService from './service.js'

import type {
    ScreenshotOutput,
    ImageCompareResult,
    CheckScreenMethodOptions,
    SaveScreenMethodOptions,
    CheckElementMethodOptions,
    SaveElementMethodOptions,
    CheckFullPageMethodOptions,
    SaveFullPageMethodOptions,
} from 'webdriver-image-comparison'

interface WdioIcsCommonOptions {
    hideElements?: WebdriverIO.Element[];
    removeElements?: WebdriverIO.Element[];
}
interface WdioIcsScrollOptions extends WdioIcsCommonOptions {
    hideAfterFirstScroll?: WebdriverIO.Element[];
}

interface WdioCheckFullPageMethodOptions
    extends Omit<CheckFullPageMethodOptions, keyof WdioIcsScrollOptions>,
        WdioIcsScrollOptions {}
interface WdioSaveFullPageMethodOptions
    extends Omit<SaveFullPageMethodOptions, keyof WdioIcsScrollOptions>,
        WdioIcsScrollOptions {}
interface WdioSaveElementMethodOptions
    extends Omit<SaveElementMethodOptions, keyof WdioIcsCommonOptions>,
        WdioIcsCommonOptions {}
interface WdioSaveScreenMethodOptions
    extends Omit<SaveScreenMethodOptions, keyof WdioIcsCommonOptions>,
        WdioIcsCommonOptions {}
interface WdioCheckElementMethodOptions
    extends Omit<CheckElementMethodOptions, keyof WdioIcsCommonOptions>,
        WdioIcsCommonOptions {}
interface WdioCheckScreenMethodOptions
    extends Omit<CheckScreenMethodOptions, keyof WdioIcsCommonOptions>,
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
            'wdio-ics:options'?:{
                logName?: string;
            }
        }
    }
}

export default WdioImageComparisonService
