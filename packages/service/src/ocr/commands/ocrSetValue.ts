import type { OcrSetValueOptions } from '../types.js'
import ocrKeys from '../utils/ocrKeys.js'
import ocrClickOnText from './ocrClickOnText.js'

export default async function ocrSetValue(options: OcrSetValueOptions): Promise<void> {
    const {
        element,
        isTesseractAvailable,
        language,
        reuseOcr,
        ocrImagesPath,
        screenSize,
        text,
        value,
        clickDuration
    } = options

    await ocrClickOnText({
        element,
        isTesseractAvailable,
        language,
        ocrImagesPath,
        reuseOcr,
        screenSize,
        text,
        clickDuration
    })
    if (driver.isMobile) {
        await driver.waitUntil(
            async () => driver.isKeyboardShown(),
            {
                timeout: 15000,
                timeoutMsg: 'Keyboard was not hidden',
            })
    }
    await ocrKeys(value)
    if (driver.isMobile) {
        await driver.hideKeyboard()
        await driver.waitUntil(
            async () => !(await driver.isKeyboardShown()),
            {
                timeout: 15000,
                timeoutMsg: 'Keyboard is still shown',
            })
    }
}
