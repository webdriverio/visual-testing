import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ocrSetValue from '../../src/commands/ocrSetValue.js'
import ocrClickOnText from '../../src/commands/ocrClickOnText.js'
import sendKeys from '../../src/utils/sendKeys.js'

vi.mock('@wdio/globals', () => {
    return {
        driver: {
            isMobile: false,
            waitUntil: vi.fn(async (condition, { timeoutMsg }) => {
                const result = await condition()
                if (!result) {
                    throw new Error(timeoutMsg)
                }
            }),
            isKeyboardShown: vi.fn().mockResolvedValue(false),
            hideKeyboard: vi.fn().mockResolvedValue(null),
        },
    }
})
vi.mock('../../src/commands/ocrClickOnText.js', () => ({
    default: vi.fn(() => Promise.resolve())
}))
vi.mock('../../src/utils/sendKeys.js', () => ({
    default: vi.fn(() => Promise.resolve())
}))

const options = {
    contrast: 0.5,
    clickDuration: 1000,
    fuzzyFindOptions: {},
    haystack: { x: 1, y: 1, width: 1, height: 1 },
    isTesseractAvailable: false,
    language: 'ENG',
    ocrImagesPath: 'path/to/image.png',
    text: 'example',
    value: 'test input',
    submitValue: true,
}

describe('ocrSetValue', () => {
    let mockDriver

    beforeEach(async () => {
        vi.clearAllMocks()

        const { driver } = vi.mocked(await import('@wdio/globals'))
        mockDriver = driver
    })

    afterEach(() => {
        mockDriver.isMobile = false
    })

    it('calls ocrClickOnText and sendKeys with the right parameters', async () => {
        await ocrSetValue(options)
        const { submitValue, value, ...ocrClickOnTextOptions } = options

        expect(vi.mocked(ocrClickOnText)).toHaveBeenCalledWith(ocrClickOnTextOptions)
        expect(mockDriver.waitUntil).not.toBeCalled()
        expect(mockDriver.hideKeyboard).not.toBeCalled()
        expect(mockDriver.isKeyboardShown).not.toBeCalled()
        expect(vi.mocked(sendKeys)).toHaveBeenCalledWith('test input', true)
    })

    it('should handle mobile-specific logic', async () => {
        mockDriver.isMobile = true
        mockDriver.isKeyboardShown = vi.fn()
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(false)

        await ocrSetValue(options)

        expect(mockDriver.waitUntil).toHaveBeenCalledTimes(2)
        expect(mockDriver.hideKeyboard).toHaveBeenCalledTimes(1)
        expect(mockDriver.isKeyboardShown).toHaveBeenCalledTimes(2)
    })

    it('should handle the error inside the internal try/catch without breaking the ocrSetValue method', async () => {
        mockDriver.isMobile = true

        mockDriver.waitUntil.mockImplementation(async () => {
            throw new Error('foo')
        })

        try {
            await ocrSetValue(options)
            expect(true).toBe(true)
        } catch (_error) {
            throw new Error('The function should have handled the error internally and not throw an error')
        }
    })
})
