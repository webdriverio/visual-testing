import ocrGetData from './ocrGetData.js'
import { getDprPositions } from './index.js'
import type { Line, OcrGetTextPositions, OcrGetTextPositionsOptions } from '../types.js'

export default async function ocrGetTextPositions(options: OcrGetTextPositionsOptions): Promise<OcrGetTextPositions[]> {
    const { dpr, lines } = await ocrGetData(options)

    return (
        lines
            .map(({ text, bbox }:Line) => ({
                text: text.replace(/(^\s+|\s+$)/g, ''),
                originalPosition: bbox,
                dprPosition: getDprPositions(JSON.parse(JSON.stringify(bbox)), dpr),
            }))
            .filter((element) => element.text)
    )
}
