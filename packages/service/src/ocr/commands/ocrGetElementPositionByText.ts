import logger from '@wdio/logger'
import type { FuzzyElement, OcrGetElementPositionByText, OcrGetElementPositionByTextOptions } from '../types.js'
import ocrGetTextPositions from '../utils/ocrGetTextPositions.js'
import { fuzzyFind } from '../utils/fuzzySearch.js'

const log = logger('@wdio/visual-service:ocrGetElementPositionByText')

export default async function ocrGetElementPositionByText(
    data: OcrGetElementPositionByTextOptions
): Promise<OcrGetElementPositionByText> {
    console.log('data', data)
    const {
        element,
        isTesseractAvailable,
        language,
        ocrImagesPath,
        reuseOcr,
        screenSize,
        text,
    } = data
    const textPositions = await ocrGetTextPositions({
        element,
        isTesseractAvailable,
        language,
        ocrImagesPath,
        reuseOcr,
        screenSize,
    })
    const matches = fuzzyFind({
        textArray: textPositions,
        pattern: text,
    })
    let matchedTextElements
    let score

    if (matches.length === 0) {
        log.warn(`No matches were found based on the word "${text}"`)

        throw new Error(
            `InvalidSelectorMatch. Strategy 'ocr' has failed to find word '${text}' in the image`
        )
    } else if (matches.length > 1) {
        // @ts-ignore
        matches.sort((a, b) => (a.score > b.score ? 1 : -1))
        matchedTextElements = matches[0] as FuzzyElement
        score = Number(((1-matchedTextElements.score)*100).toFixed(2))
        const messageOne = `Multiple matches were found based on the word "${text}".`
        // @ts-ignore
        const messageTwo = `The match "${matchedTextElements.item.text}" with score "${score}%" will be used.`
        log.info(`${messageOne} ${messageTwo}`)
    } else {
        matchedTextElements = matches[0] as FuzzyElement
        score = Number(((1-matchedTextElements.score)*100).toFixed(2))
        log.info(
            `We searched for the word "${text}" and found one match "${matchedTextElements.item.text}" with score "${score}%"`
        )
    }

    return {
        searchValue: text,
        matchedString: matchedTextElements.item.text,
        originalPosition: matchedTextElements.item.originalPosition,
        dprPosition: matchedTextElements.item.dprPosition,
        score,
    }
}
