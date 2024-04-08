import { execSync } from 'node:child_process'
import { createWorker, PSM } from 'tesseract.js'
import { parseString } from 'xml2js'
import type { GetOcrData, GetOcrDataOptions, Line, LineData, Rectangles, UnprocessedBlock, Words } from '../types.js'

export function isTesseractAvailable(tesseractName: string = ''): boolean {
    const binary = tesseractName || 'tesseract'
    const command = [binary, '--version'].join(' ')

    try {
        execSync(command)
    } catch (ign) {
        return false
    }

    return true
}

export function parseWordDataFromText(
    attributes: string[]
): { bbox: Rectangles; wc: number } {
    let bbox = {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    }
    let wc = 0

    attributes.forEach((attribute: string) => {
        if (attribute.includes('bbox')) {
            const bboxValues = attribute.replace('bbox ', '').split(' ')
            bbox = {
                left: Number(bboxValues[0]),
                top: Number(bboxValues[1]),
                right: Number(bboxValues[2]),
                bottom: Number(bboxValues[3]),
            }
        } else if (attribute.includes('x_wconf')) {
            const score = attribute.replace('x_wconf ', '')
            wc = Number(score) / 100
        }
    })

    return {
        ...{ bbox },
        wc,
    }
}

export async function getNodeOcrData(options: GetOcrDataOptions): Promise<GetOcrData|Error> {
    try {
        const { filePath, language, rectangle } = options
        const jsonSingleWords: Words[] = []
        const jsonWordStrings: Line[] = []
        let composedBlocks: UnprocessedBlock[] = []

        const worker = await createWorker(language)
        await worker.setParameters({
            tessedit_pageseg_mode: PSM.AUTO,
            tessjs_create_tsv: '0',
            tessjs_create_box: '0',
            tessjs_create_unlv: '0',
            tessjs_create_osd: '0',
        })
        const { data: { text, hocr } } = await worker.recognize(filePath, { rectangle })
        await worker.terminate()

        if (!hocr) {
            throw Error(`No hocr data was found for the OCR, please verify image at: ${filePath}.`)
        }

        parseString(hocr, (error: Error, data: any) => {
            if (error) {
                throw Error(`An error happened when parsing the getNodeOcrData, see: ${error}`)
            }

            composedBlocks = data.div.div
        })

        if (!composedBlocks || composedBlocks.length === 0){
            throw Error('No text was found for the OCR, please verify the stored image.')
        }

        composedBlocks.forEach((block) => {
            if (!block.p || !Array.isArray(block.p)) {
                return
            }

            block.p.forEach((paragraph) => {
                if (!paragraph.span || !Array.isArray(paragraph.span)) {
                    return
                }

                paragraph.span.forEach((line) => {
                    if (!line.span || !Array.isArray(line.span)) {
                        return
                    }

                    const lineData:LineData = {
                        text: '',
                        bbox: { bottom: 0, left: 0, right: 0, top: 0 },
                    }

                    line.span.forEach(word => {
                        if (!word._ || !word.$) {
                            return
                        }

                        const text = word._
                        const title = word.$.title
                        const attributeValue = `; ${title}`.split('; ')
                        const { bbox, wc } = parseWordDataFromText(attributeValue)

                        jsonSingleWords.push({
                            text,
                            bbox,
                            wc,
                        })

                        lineData.text = `${lineData.text} ${text}`.trim()
                        if (!lineData.bbox) {
                            lineData.bbox = bbox
                        }
                    })

                    if (lineData.text !== '') {
                        jsonWordStrings.push(lineData)
                    }
                })
            })
        })

        return {
            lines: jsonWordStrings,
            words: jsonSingleWords,
            text,
        }
    } catch (error) {
        throw Error(`An error happened when parsing the getNodeOcrData, see: ${error}`)
    }
}
