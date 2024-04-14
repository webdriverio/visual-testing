import { ocrGetElementPositionByText } from '../index.js'
import type { OcrWaitForTextDisplayedOptions } from '../types.js'

export default async function ocrWaitForTextDisplayed(
    options: OcrWaitForTextDisplayedOptions
) {
    const { timeout, timeoutMsg } = options

    return driver.waitUntil(
        async () => {
            const { element, fuzzyFindOptions, isTesseractAvailable, language, ocrImagesPath, text } = options

            return (
                await ocrGetElementPositionByText({
                    element,
                    fuzzyFindOptions,
                    isTesseractAvailable,
                    language,
                    ocrImagesPath,
                    text,
                })
            )
        },
        {
            timeout: timeout || 180000,
            timeoutMsg: timeoutMsg || `Could not find the text "${options.text}" within the requested time.`,
        }
    )
}
