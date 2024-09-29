import getData from './getData.js'
import { getDprPositions } from './index.js'
import type { Line, GetTextPositions, GetTextPositionsOptions } from '../types.js'

export default async function getTextPositions(browser: WebdriverIO.Browser, options: GetTextPositionsOptions): Promise<GetTextPositions[]> {
    const { dpr, filePath, words } = await getData(browser, options)

    return (
        words
            .map(({ text, bbox }:Line) => ({
                dprPosition: getDprPositions(JSON.parse(JSON.stringify(bbox)), dpr),
                filePath,
                originalPosition: bbox,
                text: text.replace(/(^\s+|\s+$)/g, ''),
            }))
            .filter((word) => word.text)
    )
}
