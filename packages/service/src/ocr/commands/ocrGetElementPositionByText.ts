import logger from '@wdio/logger'
import type { FuzzyElement, OcrGetElementPositionByText, OcrGetElementPositionByTextOptions } from '../types.js'
import ocrGetTextPositions from '../utils/ocrGetTextPositions.js'
import { fuzzyFind } from '../utils/fuzzySearch.js'

const log = logger('@wdio/visual-service:ocrGetElementPositionByText')

export default async function ocrGetElementPositionByText(
    data: OcrGetElementPositionByTextOptions
): Promise<OcrGetElementPositionByText> {
    const {
        contrast,
        element,
        fuzzyFindOptions,
        isTesseractAvailable,
        language,
        ocrImagesPath,
        text,
    } = data
    const textPositions = await ocrGetTextPositions({
        contrast,
        element,
        isTesseractAvailable,
        language,
        ocrImagesPath,
    })
    const matches = fuzzyFind({
        pattern: text,
        searchOptions: fuzzyFindOptions,
        textArray: textPositions,
    })

    let matchedTextElements
    let score

    if (matches.length === 0) {
        log.warn(`No matches were found based on the word "${text}"`)

        throw new Error(
            `Invalid Text Selector Match. Visual OCR has failed to find the word '${text}' in the image`
        )
    } else if (matches.length > 1) {
        matches.sort((a, b) => ((a as FuzzyElement).score > (b as FuzzyElement).score ? 1 : -1))
        matchedTextElements = matches[0]
        score = Number(((1-matchedTextElements.score)*100).toFixed(2))
        const messageOne = `Multiple matches were found based on the word "${text}".`
        const messageTwo = `The match "${matchedTextElements.item.text}" with score "${score}%" will be used.`
        log.info(`${messageOne} ${messageTwo}`)
    } else {
        matchedTextElements = matches[0]
        score = Number(((1-matchedTextElements.score)*100).toFixed(2))
        log.info(
            `We searched for the word "${text}" and found one match "${matchedTextElements.item.text}" with score "${score}%"`
        )
    }

    return {
        dprPosition: matchedTextElements.item.dprPosition,
        filePath: matchedTextElements.item.filePath,
        matchedString: matchedTextElements.item.text,
        originalPosition: matchedTextElements.item.originalPosition,
        score,
        searchValue: text,
    }
}
