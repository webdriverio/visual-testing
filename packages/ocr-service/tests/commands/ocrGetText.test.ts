import { describe, it, expect, vi } from 'vitest'
import ocrGetText from '../../src/commands/ocrGetText.js'
import ocrGetData from '../../src/utils/ocrGetData.js'

vi.mock('../../src/utils/ocrGetData.js', () => ({
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
