import { describe, it, expect, vi, beforeEach } from 'vitest'
import ocrWaitForTextDisplayed from '../../src/commands/ocrWaitForTextDisplayed.js'
import ocrGetElementPositionByText from '../../src/commands/ocrGetElementPositionByText.js'

vi.mock('@wdio/globals', () => {
    return {
        driver: {
            waitUntil: vi.fn(async (condition, { timeoutMsg }) => {
                if (await condition()) {return}
                throw new Error(timeoutMsg)
            }),
        },
    }
})
vi.mock('../../src/commands/ocrGetElementPositionByText.js', () => ({
    default: vi.fn(),
}))

describe('ocrWaitForTextDisplayed', () => {
    let mockDriver

    beforeEach(async () => {
        vi.clearAllMocks()

        const { driver } = vi.mocked(await import('@wdio/globals'))
        mockDriver = driver
    })

    it('successfully finds text before timeout', async () => {
        const options = {
            contrast: 0.5,
            isTesseractAvailable: false,
            language: 'ENG',
            ocrImagesPath: 'path/to/image.png',
            text: 'example',
            timeout: 10000,
            timeoutMsg: 'Custom timeout message',
        }
        const { timeout, timeoutMsg, ...ocrWaitForTextDisplayedOptions } = options
        const ocrGetElementPositionByTextMock = {
            dprPosition: { left: 1, right: 1, top: 1, bottom: 1 },
            filePath: options.ocrImagesPath,
            matchedString: options.text,
            originalPosition: { left: 1, right: 1, top: 1, bottom: 1 },
            searchValue: options.text,
            score: 0,
        }

        vi.mocked(ocrGetElementPositionByText).mockResolvedValue(ocrGetElementPositionByTextMock)

        await expect(ocrWaitForTextDisplayed.bind(mockDriver)(ocrWaitForTextDisplayedOptions)).resolves.not.toThrow()

        const { driver } = await import('@wdio/globals')
        expect(driver.waitUntil).toHaveBeenCalled()
        expect(ocrGetElementPositionByText).toHaveBeenCalledWith(ocrWaitForTextDisplayedOptions)
    })
})
