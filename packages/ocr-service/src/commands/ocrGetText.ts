import getData from '../utils/getData.js'
import type { OcrGetTextOptions } from '../types.js'

export default async function ocrGetText(this: WebdriverIO.Browser, options: OcrGetTextOptions): Promise<string> {
    const { text } = await getData(this, options)

    return text.replace(/\n\s*\n/g, '\n')
}
