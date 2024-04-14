import type { OcrSetValueOptions } from '../types.js'
import ocrKeys from '../utils/ocrKeys.js'
import ocrClickOnText from './ocrClickOnText.js'

export default async function ocrSetValue(options: OcrSetValueOptions): Promise<void> {
    const {
        contrast,
        clickDuration,
        element,
        fuzzyFindOptions,
        isTesseractAvailable,
        language,
        ocrImagesPath,
        submitValue = false,
        text,
        value,
    } = options

    // 1. First click on the element to make sure it is intractable
    await ocrClickOnText({
        contrast,
        clickDuration,
        element,
        fuzzyFindOptions,
        isTesseractAvailable,
        language,
        ocrImagesPath,
        text,
    })

    // 2. If Mobile then a keyboard might be shown
    if (driver.isMobile) {
        try {
            // Wait for 3 seconds for the keyboard to be shown
            await driver.waitUntil(
                async () => driver.isKeyboardShown(),
                {
                    timeout: 3 * 1000,
                    timeoutMsg: 'Keyboard was not hidden',
                })
        } catch (ign) {
            // Keyboard is not shown
        }
    }
    // 3. Send the value to the element
    await ocrKeys(value, submitValue)

    // 4. If Mobile then hide the keyboard
    if (driver.isMobile) {
        try {
            await driver.hideKeyboard()
            await driver.waitUntil(
                async () => !(await driver.isKeyboardShown()),
                {
                    timeout: 3 * 1000,
                    timeoutMsg: 'Keyboard is still shown',
                })
        } catch (ign) {
            // Keyboard is not present or not hidden
        }
    }
}
