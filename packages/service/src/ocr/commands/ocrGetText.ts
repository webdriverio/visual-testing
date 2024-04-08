import ocrGetData from '../utils/ocrGetData.js'
import type { OcrGetDataOptions } from '../types.js'

export default async function ocrGetText(options: OcrGetDataOptions): Promise<string> {
    const { text } = await ocrGetData(options)

    return text.replace(/\n\s*\n/g, '\n')
}
