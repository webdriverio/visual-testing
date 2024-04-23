import { describe, it, expect, vi } from 'vitest'
import ocrGetText from '../../../src/ocr/commands/ocrGetText.js'
import ocrGetData from '../../../src/ocr/utils/ocrGetData.js'

vi.mock('../../../src/ocr/utils/ocrGetData.js', () => ({
    default: vi.fn(() => Promise.resolve({
        text: `

        Next-gen browser and mobile automation

        test framework for Node.js
         `
    }))
}))

describe('ocrGetText', () => {
    it('should return text', async () => {
        const options = {
            contrast: 0.5,
            isTesseractAvailable: false,
            language: 'ENG',
            ocrImagesPath: 'path/to/image.png',
            text: 'example',
        }
        expect(await ocrGetText(options)).toMatchSnapshot()
        expect(ocrGetData).toHaveBeenCalledWith(options)
    })
})
