import { describe, it, expect, vi } from 'vitest'
import { join } from 'node:path'
import { mock } from 'vitest-mock-extended'
import { getDesktopFullPageScreenshotsData } from './screenshots.js'
import getDocumentScrollHeight from '../clientSideScripts/getDocumentScrollHeight.js'

vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))
vi.mock('../helpers/utils.js', async () => ({
    ...await vi.importActual('../helpers/utils.js'),
    waitFor: vi.fn(),
}))

/**
 * A base64 PNG header with the size of a screenshot (getBase64ScreenshotSize reads only the IHDR size)
 */
function screenshotOfSize(width: number, height: number): string {
    const header = Buffer.alloc(24)
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(header, 0)
    header.write('IHDR', 12)
    header.writeUInt32BE(width, 16)
    header.writeUInt32BE(height, 20)
    return header.toString('base64')
}

/**
 * Safari desktop with a viewport of 1000x748 CSS pixels and a page of 6000 CSS pixels
 */
function createSafari(devicePixelRatio: number) {
    return mock<WebdriverIO.Browser>({
        capabilities: { browserName: 'Safari' },
        isMobile: false,
        takeScreenshot: vi.fn().mockResolvedValue(screenshotOfSize(1000 * devicePixelRatio, 748 * devicePixelRatio)),
        // The page height for getDocumentScrollHeight, nothing for the other scripts
        execute: vi.fn().mockImplementation(async (script: unknown) => script === getDocumentScrollHeight ? 6000 : undefined),
    })
}

describe('getDesktopFullPageScreenshotsData in Safari desktop', () => {
    it.each([1, 2])('should put each image right after the previous one on the canvas at DPR %i', async (devicePixelRatio) => {
        const result = await getDesktopFullPageScreenshotsData(createSafari(devicePixelRatio), {
            devicePixelRatio,
            fullPageScrollTimeout: 0,
            hideAfterFirstScroll: [],
            innerHeight: 748,
        })

        expect(result.fullPageHeight).toBe(6000 * devicePixelRatio)
        // Each image starts where the previous one ends, and the last one ends at the end of the page
        result.data.slice(1).forEach((image, index) => {
            const previous = result.data[index]
            expect(image.canvasYPosition).toBe(previous.canvasYPosition + previous.imageHeight)
        })
        const last = result.data.at(-1)
        expect(last && last.canvasYPosition + last.imageHeight).toBe(6000 * devicePixelRatio)
    })
})
