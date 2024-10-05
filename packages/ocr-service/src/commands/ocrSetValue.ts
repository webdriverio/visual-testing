import type { OcrSetValueOptions } from '../types.js'
import sendKeys from '../utils/sendKeys.js'
import ocrClickOnText from './ocrClickOnText.js'

export default async function ocrSetValue(this: WebdriverIO.Browser, options: OcrSetValueOptions): Promise<void> {
    const {
        contrast,
        clickDuration,
        haystack,
        fuzzyFindOptions,
        isTesseractAvailable,
        language,
        ocrImagesPath,
        submitValue = false,
        text,
        value,
    } = options

    // 1. First click on the position of the text to make sure it is intractable
    await ocrClickOnText.bind(this)({
        contrast,
        clickDuration,
        haystack,
        fuzzyFindOptions,
        isTesseractAvailable,
        language,
        ocrImagesPath,
        text,
    })

    // 2. If Mobile then a keyboard might be shown
    if (this.isMobile) {
        try {
            // Wait for 3 seconds for the keyboard to be shown
            await this.waitUntil(
                async () => this.isKeyboardShown(),
                { timeout: 3 * 1000 })
        } catch (_ign) {
            // Keyboard is not shown
        }
    }
    // 3. Send the value to the active element
    await sendKeys(this, value, submitValue)

    // 4. If Mobile then hide the keyboard
    if (this.isMobile) {
        try {
            await this.hideKeyboard()
            await this.waitUntil(
                async () => !(await this.isKeyboardShown()),
                { timeout: 3 * 1000 })
        } catch (_ign) {
            // Keyboard is not present or not hidden
        }
    }
}
