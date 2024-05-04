import ocrGetData from '../utils/ocrGetData.js'
import type { OcrGetTextOptions } from '../types.js'

export default async function ocrGetText(options: OcrGetTextOptions): Promise<string> {
    const { text } = await ocrGetData(options)

    return text.replace(/\n\s*\n/g, '\n')
}
