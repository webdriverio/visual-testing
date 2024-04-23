import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ocrSetValue from '../../../src/ocr/commands/ocrSetValue.js'
import ocrClickOnText from '../../../src/ocr/commands/ocrClickOnText.js'
import ocrKeys from '../../../src/ocr/utils/ocrKeys.js'

vi.mock('../../../src/ocr/commands/ocrClickOnText.js', () => ({
    default: vi.fn(() => Promise.resolve())
}))
vi.mock('../../../src/ocr/utils/ocrKeys.js', () => ({
    default: vi.fn(() => Promise.resolve())
}))

global.driver = {
    isMobile: false,
    waitUntil: vi.fn(async (condition, { timeoutMsg }) => {
        const result = await condition()
        if (!result) {
            throw new Error(timeoutMsg)
        }
    }),
    isKeyboardShown: vi.fn().mockResolvedValue(false),
    hideKeyboard: vi.fn().mockResolvedValue(null),
} as any as WebdriverIO.Browser

const options = {
    contrast: 0.5,
    clickDuration: 1000,
    fuzzyFindOptions: {},
    haystack: { x: 1, y: 1, width: 1, height: 1, },
    isTesseractAvailable: false,
    language: 'ENG',
    ocrImagesPath: 'path/to/image.png',
    text: 'example',
    value: 'test input',
    submitValue: true
}

describe('ocrSetValue', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })
    afterEach(() => {
        global.driver.isMobile = false
    })

    it('calls ocrClickOnText and ocrKeys with the right parameters', async () => {
        await ocrSetValue(options)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { submitValue, value, ...ocrClickOnTextOptions } = options

        expect(vi.mocked(ocrClickOnText)).toHaveBeenCalledWith(ocrClickOnTextOptions)
        expect(global.driver.waitUntil).not.toBeCalled()
        expect(global.driver.hideKeyboard).not.toBeCalled()
        expect(global.driver.isKeyboardShown).not.toBeCalled()
        expect(vi.mocked(ocrKeys)).toHaveBeenCalledWith('test input', true)
    })

    it('should handle mobile-specific logic', async () => {
        global.driver.isMobile = true
        global.driver.isKeyboardShown = vi.fn()
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(false)

        await ocrSetValue(options)

        expect(global.driver.waitUntil).toHaveBeenCalledTimes(2)
        expect(global.driver.hideKeyboard).toHaveBeenCalledTimes(1)
        expect(global.driver.isKeyboardShown).toHaveBeenCalledTimes(2)
    })

    it('should handle the error inside the internal try/catch without breaking the ocrSetValue method', async () => {
        global.driver.isMobile = true
        // @ts-ignore
        global.driver.waitUntil.mockImplementation(async () => {
            throw new Error('foo')
        })

        try {
            await ocrSetValue(options)
            expect(true).toBe(true)
        } catch (error) {
            throw new Error('The function should have handled the error internally and not throw an error')
        }
    })
})
