import { describe, it, expect, vi } from 'vitest'
import ocrGetText from '../../src/commands/ocrGetText.js'
import getData from '../../src/utils/getData.js'

vi.mock('@wdio/globals', () => {
    return {
        browser: {
            isMobile: false,
            action: vi.fn().mockReturnThis(),
            move: vi.fn().mockReturnThis(),
            down: vi.fn().mockReturnThis(),
            pause: vi.fn().mockReturnThis(),
            up: vi.fn().mockReturnThis(),
            perform: vi.fn().mockResolvedValue(null),
        },
    }
})
vi.mock('../../src/utils/getData.js', () => ({
    default: vi.fn(() => Promise.resolve({
        text: `

        Next-gen browser and mobile automation

        test framework for Node.js
         `
    }))
}))

describe('ocrGetText', async () => {
    const { browser } = vi.mocked(await import('@wdio/globals'))
    const mockBrowser = browser

    it('should return text', async () => {
        const options = {
            contrast: 0.5,
            isTesseractAvailable: false,
            language: 'ENG',
            ocrImagesPath: 'path/to/image.png',
            text: 'example',
        }
        expect(await ocrGetText.bind(mockBrowser)(options)).toMatchSnapshot()
        expect(getData).toHaveBeenCalledWith(mockBrowser, options)
    })
})
