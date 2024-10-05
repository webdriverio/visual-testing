import { join } from 'node:path'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import ocrGetElementPositionByText from '../../src/commands/ocrGetElementPositionByText.js'
import getTextPositions from '../../src/utils/getTextPositions.js'
import { fuzzyFind } from '../../src/utils/fuzzySearch.js'
import logger from '@wdio/logger'

vi.mock('../../src/utils/getTextPositions.js', () => ({
    default: vi.fn()
}))
vi.mock('../../src/utils/fuzzySearch.js', () => ({
    fuzzyFind: vi.fn()
}))

const log = logger('test')
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))

describe('ocrGetElementPositionByText', () => {
    let mockDriver

    beforeEach(async () => {
        vi.clearAllMocks()

        const { driver } = vi.mocked(await import('@wdio/globals'))
        mockDriver = driver
    })

    it('throws an error if no matches are found', async () => {
        const data = {
            contrast: 0.5,
            isTesseractAvailable: false,
            language: 'ENG',
            ocrImagesPath: 'path/to/image.png',
            text: 'example',
        }
        const logWarnMock = vi.spyOn(log, 'warn')
        vi.mocked(getTextPositions).mockResolvedValue([])
        vi.mocked(fuzzyFind).mockReturnValue([])

        await expect(ocrGetElementPositionByText.bind(mockDriver)(data))
            .rejects.toThrow(`Visual OCR has failed to find the word '${data.text}' in the image`)
        expect(logWarnMock.mock.calls[0][0]).toContain(`No matches were found based on the word "${data.text}"`)
    })

    it('handles multiple matches and selects the highest score', async () => {
        const logInfoMock = vi.spyOn(log, 'info')
        const data = {
            contrast: 0.5,
            isTesseractAvailable: false,
            language: 'ENG',
            ocrImagesPath: 'path/to/image.png',
            text: 'WebdriverIO?',
        }
        const mockTextPositions = [{
            dprPosition: { left: 529, top: 606, right: 643, bottom: 619 },
            filePath: 'path/example.png',
            originalPosition: { left: 529, top: 606, right: 643, bottom: 619 },
            text: 'WebdriverIO?'
        }]
        vi.mocked(getTextPositions).mockResolvedValue(mockTextPositions)
        vi.mocked(fuzzyFind).mockReturnValue([
            { item: { ...mockTextPositions[0], text: 'Webdriver' }, score: 0.6, refIndex: 52 },
            { item: { ...mockTextPositions[0], text: 'Webdriverlo?' }, score: 0.08333333333333333, refIndex: 5 },
            { item: mockTextPositions[0], score: 0.2, refIndex: 1  },
        ])

        const result = await ocrGetElementPositionByText.bind(mockDriver)(data)
        expect(result.matchedString).toEqual('Webdriverlo?')
        expect(logInfoMock.mock.calls[0][0]).toEqual(`Multiple matches were found based on the word "${mockTextPositions[0].text}". The match "Webdriverlo?" with score "91.67%" will be used.`)
    })

    it('correctly handles a single match', async () => {
        const logInfoMock = vi.spyOn(log, 'info')
        const data = {
            contrast: 0.5,
            isTesseractAvailable: false,
            language: 'ENG',
            ocrImagesPath: 'path/to/image.png',
            text: 'unique',
        }
        const mockTextPositions = [{
            dprPosition: { left: 529, top: 606, right: 643, bottom: 619 },
            filePath: 'path/example.png',
            originalPosition: { left: 529, top: 606, right: 643, bottom: 619 },
            text: 'unique'
        }]
        vi.mocked(getTextPositions).mockResolvedValue(mockTextPositions)
        vi.mocked(fuzzyFind).mockReturnValue([
            { item: mockTextPositions[0], score: 0, refIndex: 1  },
        ])

        const result = await ocrGetElementPositionByText.bind(mockDriver)(data)
        expect(result.matchedString).toEqual(data.text)
        expect(logInfoMock.mock.calls[0][0]).toEqual(`We searched for the word "${data.text}" and found one match "${data.text}" with score "100%"`)
    })
})
