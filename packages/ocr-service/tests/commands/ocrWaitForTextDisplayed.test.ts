import { describe, it, expect, vi, beforeEach } from 'vitest'
import ocrWaitForTextDisplayed from '../../src/commands/ocrWaitForTextDisplayed.js'
import ocrGetElementPositionByText from '../../src/commands/ocrGetElementPositionByText.js'

vi.mock('../../src/commands/ocrGetElementPositionByText.js', () => ({
    default: vi.fn()
}))
global.driver = {
    waitUntil: vi.fn(async (condition, { timeoutMsg }) => {
        if (await condition()) {return}
        throw new Error(timeoutMsg)
    }),
} as any as WebdriverIO.Browser

describe('ocrWaitForTextDisplayed', () => {
    beforeEach(() => {
        vi.clearAllMocks()
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
            score: 0
        }

        vi.mocked(ocrGetElementPositionByText).mockResolvedValue(ocrGetElementPositionByTextMock)
        await expect(ocrWaitForTextDisplayed(ocrWaitForTextDisplayedOptions)).resolves.not.toThrow()

        expect(global.driver.waitUntil).toHaveBeenCalled()
        expect(vi.mocked(ocrGetElementPositionByText)).toHaveBeenCalledWith(ocrWaitForTextDisplayedOptions)
    })
})
