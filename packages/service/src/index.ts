import type { WicElement } from 'webdriver-image-comparison/dist/commands/element.interfaces.js'
import WdioImageComparisonService from './service.js'
import VisualLauncher from './launcher.js'
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
                element: WicElement,
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
                element: WicElement,
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
            /**
             * Checks that if current screen matches with snapshot of baseline.
             * @param tag snapshot name
             * @param expectedResult either a number representing a mismatch percentage (defaults to 0) or an asymmetric matcher
             * @param options options to pass into the `checkScreen` method
             */
            toMatchScreenSnapshot(
                tag: string,
                expectedResult?: number | ExpectWebdriverIO.PartialMatcher,
                options?: WdioCheckScreenMethodOptions
            ): R
            toMatchScreenSnapshot(
                tag: string,
                options?: WdioCheckScreenMethodOptions
            ): R
            /**
             * Checks that if the full page screenshot matches with snapshot of baseline.
             * @param tag snapshot name
             * @param expectedResult either a number representing a mismatch percentage (defaults to 0) or an asymmetric matcher
             * @param options options to pass into the `checkFullPageScreen` method
             */
            toMatchFullPageSnapshot(
                tag: string,
                expectedResult?: number | ExpectWebdriverIO.PartialMatcher,
                options?: WdioCheckFullPageMethodOptions
            ): R
            toMatchFullPageSnapshot(
                tag: string,
                options?: WdioCheckFullPageMethodOptions
            ): R
            /**
             * Checks that if given element matches with snapshot of baseline.
             * @param tag snapshot name
             * @param expectedResult either a number representing a mismatch percentage (defaults to 0) or an asymmetric matcher
             * @param options options to pass into the `checkElement` method
             */
            toMatchElementSnapshot(
                tag: string,
                expectedResult?: number | ExpectWebdriverIO.PartialMatcher,
                options?: WdioCheckElementMethodOptions
            ): R
            toMatchElementSnapshot(
                tag: string,
                options?: WdioCheckElementMethodOptions
            ): R
            /**
             * Checks that if the full page screenshot including tab marks matches with snapshot of baseline.
             * @param tag snapshot name
             * @param expectedResult either a number representing a mismatch percentage (defaults to 0) or an asymmetric matcher
             * @param options options to pass into the `checkTabbablePage` method
             */
            toMatchTabbablePageSnapshot(
                tag: string,
                expectedResult?: number | ExpectWebdriverIO.PartialMatcher,
                options?: WdioCheckFullPageMethodOptions
            ): R
            toMatchTabbablePageSnapshot(
                tag: string,
                options?: WdioCheckFullPageMethodOptions
            ): R
        }
    }
}

export default WdioImageComparisonService
export const launcher = VisualLauncher
