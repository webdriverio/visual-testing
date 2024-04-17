import ocrGetData from './ocrGetData.js'
import { getDprPositions } from './index.js'
import type { Line, OcrGetTextPositions, OcrGetTextPositionsOptions } from '../types.js'

export default async function ocrGetTextPositions(options: OcrGetTextPositionsOptions): Promise<OcrGetTextPositions[]> {
    const { dpr, filePath, lines } = await ocrGetData(options)

    return (
        lines
            .map(({ text, bbox }:Line) => ({
                dprPosition: getDprPositions(JSON.parse(JSON.stringify(bbox)), dpr),
                filePath,
                originalPosition: bbox,
                text: text.replace(/(^\s+|\s+$)/g, ''),
            }))
            .filter((element) => element.text)
    )
}
