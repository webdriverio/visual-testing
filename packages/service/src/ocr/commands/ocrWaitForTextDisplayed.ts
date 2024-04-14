import type { OcrWaitForTextDisplayedOptions } from '../types.js'
import ocrGetText from './ocrGetText.js'

export default async function ocrWaitForTextDisplayed(
    options: OcrWaitForTextDisplayedOptions
) {
    const { timeout, timeoutMsg } = options

    return driver.waitUntil(
        async () => {
            const { element, isTesseractAvailable, language, ocrImagesPath, text } = options

            // @TODO: This should also be based on on the fuzzyFindOptions
            return (
                await ocrGetText({
                    element,
                    isTesseractAvailable,
                    language,
                    ocrImagesPath,
                })
            ).includes(text)
        },
        {
            timeout: timeout || 180000,
            timeoutMsg: timeoutMsg || `Could not find the text "${options.text}" within the requested time.`,
        }
    )
}
