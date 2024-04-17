import ocrGetData from './ocrGetData.js'
import { getDprPositions } from './index.js'
import type { Line, OcrGetTextPositions, OcrGetTextPositionsOptions } from '../types.js'

export default async function ocrGetTextPositions(options: OcrGetTextPositionsOptions): Promise<OcrGetTextPositions[]> {
    const { dpr, filePath, words } = await ocrGetData(options)

    return (
        words
            .map(({ text, bbox }:Line) => ({
                dprPosition: getDprPositions(JSON.parse(JSON.stringify(bbox)), dpr),
                filePath,
                originalPosition: bbox,
                text: text.replace(/(^\s+|\s+$)/g, ''),
            }))
            .filter((element) => element.text)
    )
}
