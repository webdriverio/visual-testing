import WdioImageComparisonService from './service.js'
import type {
    Output,
    Result,
    WdioCheckFullPageMethodOptions,
    WdioSaveFullPageMethodOptions,
    WdioSaveElementMethodOptions,
    WdioSaveScreenMethodOptions,
    WdioCheckElementMethodOptions,
    WdioCheckScreenMethodOptions
} from './types.js'

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

    namespace ExpectWebdriverIO {
        // see https://github.com/webdriverio/expect-webdriverio/issues/1408
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Matchers<R, T> {
            toMatchScreenSnapshot(
                options: WdioCheckScreenMethodOptions & { tag: string },
                expectedResult: Result
            ): R
            toMatchFullPageSnapshot(
                options: WdioCheckFullPageMethodOptions & { tag: string },
                expectedResult: Result
            ): R
            toMatchElementSnapshot(
                options: WdioCheckElementMethodOptions & { tag: string },
                expectedResult: Result
            ): R
            toMatchTabbablePageSnapshot(
                options: WdioCheckFullPageMethodOptions & { tag: string },
                expectedResult: Result
            ): R
        }
    }
}

export default WdioImageComparisonService
