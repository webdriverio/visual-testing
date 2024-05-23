import { describe, it, expect, vi } from 'vitest'
import ocrGetText from '../../src/commands/ocrGetText.js'
import getData from '../../src/utils/getData.js'

vi.mock('../../src/utils/getData.js', () => ({
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
        expect(getData).toHaveBeenCalledWith(options)
    })
})
