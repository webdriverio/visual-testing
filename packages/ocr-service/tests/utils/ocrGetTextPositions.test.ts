import { describe, it, expect, vi, beforeEach } from 'vitest'
import getTextPositions from '../../src/utils/getTextPositions.js'
import getData from '../../src/utils/getData.js'
import { getDprPositions } from '../../src/utils/index.js'

vi.mock('../../src/utils/getData.js', () => ({
    default: vi.fn()
}))
vi.mock('../../src/utils/index.js', () => ({
    getDprPositions: vi.fn().mockImplementation((bbox, dpr) => ({
        left: bbox.left / dpr,
        top: bbox.top / dpr,
        right: bbox.right / dpr,
        bottom: bbox.bottom / dpr
    }))
}))
const options = {
    contrast: 0.25,
    isTesseractAvailable: false,
    language: 'eng',
    ocrImagesPath: 'sample/path/to/',
}

describe('getTextPositions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns empty array when no words are present', async () => {
        vi.mocked(getData).mockResolvedValue({
            dpr: 2,
            filePath: 'sample/path/to/image.png',
            text: 'example ',
            lines: [],
            words: []
        })
        const result = await getTextPositions(options)

        expect(result).toEqual([])
        expect(getData).toHaveBeenCalled()
    })

    it('processes words and adjusts their positions based on DPR', async () => {
        vi.mocked(getData).mockResolvedValue({
            dpr: 2,
            filePath: 'sample/path/to/image.png',
            text: 'example ',
            lines: [{ text: 'Sample OCR text', bbox: { left: 1, right: 1, top: 1, bottom: 1 } }],
            words: [
                { text: 'Sample', bbox: { left: 1, right: 1, top: 1, bottom: 1 }, wc: 1 },
                { text: 'OCR t', bbox: { left: 2, right: 2, top: 2, bottom: 2 }, wc: 2 },
                { text: ' ext', bbox: { left: 3, right: 3, top: 3, bottom: 3 }, wc: 3 },
            ]
        })

        const result = await getTextPositions(options)

        expect(getDprPositions).toHaveBeenCalledTimes(3)
        expect(result.length).toBe(3)
        expect(result).toMatchSnapshot()
    })
})
