import type { OcrWaitForTextDisplayedOptions } from '../types.js'
import ocrGetElementPositionByText from './ocrGetElementPositionByText.js'

export default async function ocrWaitForTextDisplayed(
    this: WebdriverIO.Browser,
    options: OcrWaitForTextDisplayedOptions
) {
    const { timeout, timeoutMsg } = options

    return this.waitUntil(
        async () =>  ocrGetElementPositionByText.bind(this)(options),
        {
            timeout: timeout || 180000,
            timeoutMsg: timeoutMsg || `Could not find the text "${options.text}" within the requested time.`,
        }
    )
}
