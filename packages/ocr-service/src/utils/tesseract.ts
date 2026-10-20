import { execFile, execFileSync } from 'node:child_process'
import { promisify } from 'node:util'
import { createWorker, PSM } from 'tesseract.js'
import { parseString } from 'xml2js'
import type { GetOcrData, Line, ParseWordData, Rectangles, TessaractDataOptions, UnprocessedNodejsBlock, UnprocessedSystemBlock, Words } from '../types.js'

const execFileAsync = promisify(execFile)
// Tesseract writes the ALTO XML of a full-screen capture to stdout. 1 MB (the Node
// default) is too small for a busy screen, so give it room.
const TESSERACT_MAX_STDOUT_BYTES = 10 * 1024 * 1024

export function isSystemTesseractAvailable(tesseractName: string = ''): boolean {
    const binary = tesseractName || 'tesseract'

    try {
        // execFileSync with an argument array never starts a shell, so the binary
        // name is passed through as-is.
        execFileSync(binary, ['--version'], { stdio: 'ignore' })
    } catch (_ign) {
        return false
    }

    return true
}

type SystemTesseractOptions = {
    lang: string;
    oem: number;
    psm: number;
    presets: string[];
}

/**
 * Run the system Tesseract binary and return what it writes to stdout.
 *
 * The file path and every option go to the binary as an argument array, so no
 * shell ever sees them. This replaces `node-tesseract-ocr`, which built one shell
 * command string from the file path (GHSA-8j44-735h-w4w2) and has no patched
 * release.
 */
export async function runSystemTesseract(filePath: string, { lang, oem, psm, presets }: SystemTesseractOptions): Promise<string> {
    // `-l` and `--psm` must come before any config file name such as `alto`, see
    // https://github.com/tesseract-ocr/tesseract/blob/master/doc/tesseract.1.asc
    const args = [filePath, 'stdout', '-l', lang, '--oem', String(oem), '--psm', String(psm), ...presets]
    const { stdout } = await execFileAsync('tesseract', args, { maxBuffer: TESSERACT_MAX_STDOUT_BYTES })

    return stdout
}

export function parseWordDataFromText(attributes: string[]): ParseWordData {
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

export function extractTextFromAlto(altoContent: string): string {
    const regex = /<String[^>]*CONTENT="([^"]+)"[^>]*>/g
    let match
    const textArray: string[] = []

    while ((match = regex.exec(altoContent)) !== null) {
        textArray.push(match[1])
    }

    return textArray.join(' ')
}

/**
 * Handle the OCR with Tesseract with pure JS
 */
export async function getNodeOcrData(options: TessaractDataOptions): Promise<GetOcrData> {
    let worker
    try {
        const { filePath, language } = options
        const jsonSingleWords: Words[] = []
        const jsonWordStrings: Line[] = []
        let composedBlocks: UnprocessedNodejsBlock[] = []

        worker = await createWorker(language)
        await worker.setParameters({
            tessedit_pageseg_mode: PSM.AUTO,
        })
        // Since tesseract.js 6 only `text` is on by default; the words and their positions come from `hocr`
        const { data: { text, hocr } } = await worker.recognize(filePath, {}, { text: true, hocr: true })
        const formatedText = text.replace(/[\r\n]{2,}/g, ' ').replace(/\s{2,}/g, ' ').trim()
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

                    const lineData: Line = {
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
                        lineData.bbox = bbox
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
            text: formatedText,
        }
    } catch (error) {
        if (worker) {
            await worker.terminate()
        }
        throw Error(`An error happened when parsing the getNodeOcrData, see: ${error}`)
    }
}

/**
 * Handle the OCR with Tesseract with the system installed version
 */
export async function getSystemOcrData(options: TessaractDataOptions): Promise<GetOcrData> {
    try {
        const { filePath, language } = options
        const jsonSingleWords: Words[] = []
        const jsonWordStrings: Line[] = []
        let composedBlocks: UnprocessedSystemBlock[] = []
        const result = await runSystemTesseract(filePath, {
            lang: language,
            oem: 1,
            psm: 3,
            presets: ['alto'],
        })

        parseString(result, (error: Error, data) => {
            if (error) {
                throw Error(`An error happened when parsing the getSystemOcrData, see: ${error}`)
            }

            composedBlocks = data.alto.Layout[0].Page[0].PrintSpace[0].ComposedBlock
        })

        const text = extractTextFromAlto(result)

        if (!composedBlocks || composedBlocks.length === 0){
            throw Error('No text was found for the OCR, please verify the stored image.')
        }

        composedBlocks.forEach(composedBlock => {
            composedBlock.TextBlock?.forEach(textBlock => {
                textBlock.TextLine?.forEach(textLine => {
                    let lineText = ''
                    let lineBbox: Rectangles | null = null

                    if (textLine.$) {
                        lineBbox = {
                            left: Number(textLine.$.HPOS),
                            top: Number(textLine.$.VPOS),
                            right: Number(textLine.$.HPOS) + Number(textLine.$.WIDTH),
                            bottom: Number(textLine.$.VPOS) + Number(textLine.$.HEIGHT),
                        }
                    }

                    textLine.String?.forEach(string => {
                        const { CONTENT, HPOS, VPOS, WIDTH, HEIGHT, WC } = string.$
                        if (!CONTENT || !HPOS || !VPOS || !WIDTH || !HEIGHT || !WC) {return}

                        const word = {
                            text: CONTENT,
                            bbox: {
                                left: Number(HPOS),
                                top: Number(VPOS),
                                right: Number(HPOS) + Number(WIDTH),
                                bottom: Number(VPOS) + Number(HEIGHT),
                            },
                            wc: Number(WC),
                        }

                        jsonSingleWords.push(word)
                        lineText += `${CONTENT} `
                    })

                    lineText = lineText.trim()
                    if (lineText !== '' && lineBbox) {
                        jsonWordStrings.push({ text: lineText, bbox: lineBbox })
                    }
                })
            })
        })

        return {
            lines: jsonWordStrings,
            words: jsonSingleWords,
            text: text,
        }
    } catch (error) {
        throw Error(`An error happened when parsing the getSystemOcrData, see: ${error}`)
    }
}
