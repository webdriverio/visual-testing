
import { describe, it, expect, beforeEach, vi } from 'vitest'
import ocrClickOnText from '../../src/ocr/commands/ocrClickOnText.js'
import ocrGetElementPositionByText from '../../src/ocr/commands/ocrGetElementPositionByText.js'
import { determineClickPoint } from '../../src/ocr/utils/index.js'
import { drawTarget } from '../../src/ocr/utils/imageProcessing.js'

vi.mock('../../src/ocr/commands/ocrGetElementPositionByText.js', () => ({
    default: vi.fn(() => Promise.resolve({
        dprPosition: { x: 100, y: 150 },
        filePath: 'path/to/image.png'
    }))
}))
vi.mock('../../src/ocr/utils/index.js', () => ({
    determineClickPoint: vi.fn(() => ({ x: 100, y: 150 }))
}))
vi.mock('../../src/ocr/utils/imageProcessing.js', () => ({
    drawTarget: vi.fn()
}))

// This mock doesn't really replicate the action API, but when I mock it like it should ths mocks are not registered
// and spies won't work, now it works
global.browser = {
    isMobile: false,
    action: vi.fn().mockReturnThis(),
    move: vi.fn().mockReturnThis(),
    down: vi.fn().mockReturnThis(),
    pause: vi.fn().mockReturnThis(),
    up: vi.fn().mockReturnThis(),
    perform: vi.fn().mockResolvedValue(null)
} as any as WebdriverIO.Browser

describe('ocrClickOnText', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should perform the correct sequence of browser interactions for a desktop browser', async () => {
        const options = {
            contrast: 0.5,
            isTesseractAvailable: false,
            language: 'ENG',
            ocrImagesPath: 'path/to/image.png',
            text: 'example',
        }
        await ocrClickOnText(options)

        expect(ocrGetElementPositionByText).toHaveBeenCalledWith(options)
        expect(determineClickPoint).toHaveBeenCalledWith({ rectangles:{ x: 100, y: 150 } })
        expect(drawTarget).toHaveBeenCalledWith({ filePath: 'path/to/image.png', targetX: 100, targetY: 150 })
        expect(global.browser.action).toHaveBeenCalledWith('pointer', {
            parameters: { pointerType: 'mouse' }
        })
        // @ts-ignore, see above
        expect(global.browser.move).toHaveBeenCalledWith({ duration: 0, x: 100, y: 150 })
        // @ts-ignore, see above
        expect(global.browser.down).toHaveBeenCalledWith({ button: 0 })
        expect(global.browser.pause).toHaveBeenCalledWith(500)
        // @ts-ignore, see above
        expect(global.browser.up).toHaveBeenCalledWith({ button: 0 })
        // @ts-ignore, see above
        expect(global.browser.perform).toHaveBeenCalled()
    })

    it('should perform the correct sequence of browser interactions for a mobile device', async () => {
        const options = {
            contrast: 0.5,
            isTesseractAvailable: false,
            language: 'ENG',
            ocrImagesPath: 'path/to/image.png',
            text: 'example',
        }
        global.browser.isMobile = true
        await ocrClickOnText(options)

        expect(global.browser.action).toHaveBeenCalledWith('pointer', {
            parameters: { pointerType: 'touch' }
        })
        // @ts-ignore, see above
        expect(global.browser.move).toHaveBeenCalledWith({ duration: 0, x: 100, y: 150 })
        // @ts-ignore, see above
        expect(global.browser.down).toHaveBeenCalledWith({ button: 0 })
        expect(global.browser.pause).toHaveBeenCalledWith(500)
        // @ts-ignore, see above
        expect(global.browser.up).toHaveBeenCalledWith({ button: 0 })
        // @ts-ignore, see above
        expect(global.browser.perform).toHaveBeenCalled()
    })
})
