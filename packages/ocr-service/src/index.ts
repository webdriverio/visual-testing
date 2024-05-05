import WdioOcrService from './service.js'
import type {
    ClickOnTextOptions,
    GetElementPositionByTextOptions,
    GetTextOptions,
    OcrGetElementPositionByText,
    SetValueOptions,
    WaitForTextDisplayedOptions,
} from './types.js'
import { SUPPORTED_LANGUAGES } from './utils/constants.js'

declare global {
    namespace WebdriverIO {
        interface Browser {
            /**
             * Get the text of an image base on OCR
             */
            ocrGetText(
                options?: GetTextOptions
            ): Promise<string>;

            /**
             * Get the text of an image base on OCR
             */
            ocrGetElementPositionByText(
                options: GetElementPositionByTextOptions
            ): Promise<OcrGetElementPositionByText>;

            /**
             * Click on an element based on text
             */
            ocrClickOnText(
                options: ClickOnTextOptions
            ): Promise<void>;

            /**
             * Set value on an element based on text
             */
            ocrSetValue(
                options: SetValueOptions
            ): Promise<void>;

            /**
             * Wait for the text to be displayed based on OCR
             */
            ocrWaitForTextDisplayed(
                options: WaitForTextDisplayedOptions
            ): Promise<void>;
        }
        interface Element { }
    }
}

export default WdioOcrService
export const SUPPORTED_OCR_LANGUAGES = SUPPORTED_LANGUAGES
