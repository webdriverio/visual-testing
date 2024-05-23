import getData from '../utils/getData.js'
import type { OcrGetTextOptions } from '../types.js'

export default async function ocrGetText(options: OcrGetTextOptions): Promise<string> {
    const { text } = await getData(options)

    return text.replace(/\n\s*\n/g, '\n')
}
