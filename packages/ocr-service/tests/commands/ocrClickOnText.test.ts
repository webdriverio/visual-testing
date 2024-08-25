
import { describe, it, expect, beforeEach, vi } from 'vitest'
import ocrClickOnText from '../../src/commands/ocrClickOnText.js'
import ocrGetElementPositionByText from '../../src/commands/ocrGetElementPositionByText.js'
import { determineClickPoint } from '../../src/utils/index.js'
import { drawTarget } from '../../src/utils/imageProcessing.js'

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
vi.mock('../../src/commands/ocrGetElementPositionByText.js', () => ({
    default: vi.fn(() => Promise.resolve({
        dprPosition: { x: 100, y: 150 },
        filePath: 'path/to/image.png'
    })),
}))
vi.mock('../../src/utils/index.js', () => ({
    determineClickPoint: vi.fn(() => ({ x: 100, y: 150 })),
}))
vi.mock('../../src/utils/imageProcessing.js', () => ({
    drawTarget: vi.fn(),
}))

describe('ocrClickOnText', () => {
    let mockBrowser

    beforeEach(async () => {
        vi.clearAllMocks()

        // Retrieve the mocked browser object
        const { browser } = vi.mocked(await import('@wdio/globals'))
        mockBrowser = browser
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
        expect(determineClickPoint).toHaveBeenCalledWith({ rectangles: { x: 100, y: 150 } })
        expect(drawTarget).toHaveBeenCalledWith({ filePath: 'path/to/image.png', targetX: 100, targetY: 150 })
        expect(mockBrowser.action).toHaveBeenCalledWith('pointer', {
            parameters: { pointerType: 'mouse' },
        })
        expect(mockBrowser.move).toHaveBeenCalledWith({ duration: 0, x: 100, y: 150 })
        expect(mockBrowser.down).toHaveBeenCalledWith({ button: 0 })
        expect(mockBrowser.pause).toHaveBeenCalledWith(500)
        expect(mockBrowser.up).toHaveBeenCalledWith({ button: 0 })
        expect(mockBrowser.perform).toHaveBeenCalled()
    })

    it('should perform the correct sequence of browser interactions for a mobile device', async () => {
        const options = {
            contrast: 0.5,
            isTesseractAvailable: false,
            language: 'ENG',
            ocrImagesPath: 'path/to/image.png',
            text: 'example',
        }
        mockBrowser.isMobile = true
        await ocrClickOnText(options)

        expect(mockBrowser.action).toHaveBeenCalledWith('pointer', {
            parameters: { pointerType: 'touch' },
        })
        expect(mockBrowser.move).toHaveBeenCalledWith({ duration: 0, x: 100, y: 150 })
        expect(mockBrowser.down).toHaveBeenCalledWith({ button: 0 })
        expect(mockBrowser.pause).toHaveBeenCalledWith(500)
        expect(mockBrowser.up).toHaveBeenCalledWith({ button: 0 })
        expect(mockBrowser.perform).toHaveBeenCalled()
    })

    it('should wait longer when a click duration is provided', async () => {
        const options = {
            contrast: 0.5,
            clickDuration: 10000,
            isTesseractAvailable: false,
            language: 'ENG',
            ocrImagesPath: 'path/to/image.png',
            text: 'example',
        }
        mockBrowser.isMobile = true
        await ocrClickOnText(options)

        expect(mockBrowser.action).toHaveBeenCalledWith('pointer', {
            parameters: { pointerType: 'touch' },
        })
        expect(mockBrowser.pause).toHaveBeenCalledWith(10000)
    })

    it('should click on the correct position when no properties in the relativePosition option are provided', async () => {
        const options = {
            contrast: 0.5,
            isTesseractAvailable: false,
            language: 'ENG',
            ocrImagesPath: 'path/to/image.png',
            relativePosition: {},
            text: 'example',
        }
        mockBrowser.isMobile = true
        await ocrClickOnText(options)

        expect(mockBrowser.action).toHaveBeenCalledWith('pointer', {
            parameters: { pointerType: 'touch' },
        })
        expect(mockBrowser.move).toHaveBeenCalledWith({ duration: 0, x: 100, y: 150 })
    })

    it('should click on the correct position when above and left from the relativePosition option are provided', async () => {
        const options = {
            contrast: 0.5,
            isTesseractAvailable: false,
            language: 'ENG',
            ocrImagesPath: 'path/to/image.png',
            relativePosition: { above: 125, left: 66 },
            text: 'example',
        }
        mockBrowser.isMobile = true
        await ocrClickOnText(options)

        expect(mockBrowser.action).toHaveBeenCalledWith('pointer', {
            parameters: { pointerType: 'touch' },
        })
        expect(mockBrowser.move).toHaveBeenCalledWith({ duration: 0, x: 34, y: 25 })
    })

    it('should click on the correct position when below and right from the relativePosition option are provided', async () => {
        const options = {
            contrast: 0.5,
            isTesseractAvailable: false,
            language: 'ENG',
            ocrImagesPath: 'path/to/image.png',
            relativePosition: { below: 125, right: 66 },
            text: 'example',
        }
        mockBrowser.isMobile = true
        await ocrClickOnText(options)

        expect(mockBrowser.action).toHaveBeenCalledWith('pointer', {
            parameters: { pointerType: 'touch' },
        })
        expect(mockBrowser.move).toHaveBeenCalledWith({ duration: 0, x: 166, y: 275 })
    })
})
