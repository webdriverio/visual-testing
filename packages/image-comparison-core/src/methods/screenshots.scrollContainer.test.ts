import { describe, it, expect, vi, afterEach } from 'vitest'
import { join } from 'node:path'
import { mock } from 'vitest-mock-extended'
import { getScrollContainerFullPageScreenshotsData } from './screenshots.js'
import type { ScrollContainerFullPageOptions } from './screenshots.interfaces.js'
import getScrollContainerData from '../clientSideScripts/getScrollContainerData.js'
import scrollContainerTo from '../clientSideScripts/scrollContainerTo.js'
import hideScrollContainerScrollbar from '../clientSideScripts/hideScrollContainerScrollbar.js'
import hideRemoveElements from '../clientSideScripts/hideRemoveElements.js'

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

interface ContainerState {
    top: number
    left: number
    width: number
    height: number
    scrollTop: number
    scrollHeight: number
    viewportWidth: number
    viewportHeight: number
    // The scroll height after each scroll, for lazy loading
    growTo?: number[]
}

/**
 * A scroll container: it keeps its scroll position and stops at the end of its content, like a browser
 */
function createContainer(state: ContainerState) {
    let scrolls = 0
    // `any`: the mock answers the different scripts of the element command `execute`
    const execute = vi.fn(async (script: unknown, ...args: unknown[]): Promise<any> => {
        if (script === getScrollContainerData) {
            const { growTo: _growTo, ...data } = state
            return data
        }
        if (script === scrollContainerTo) {
            const position = Number(args[0])
            state.scrollTop = Math.max(0, Math.min(position, state.scrollHeight - state.height))
            if (state.growTo?.[scrolls] !== undefined) {
                state.scrollHeight = state.growTo[scrolls]
            }
            scrolls++
            return state.scrollTop
        }
        if (script === hideScrollContainerScrollbar) {
            return undefined
        }
        throw new Error('Unknown script')
    })

    return { element: mock<WebdriverIO.Element>({ execute }), execute }
}

function createBrowser(screenshot = screenshotOfSize(1000, 800)) {
    return mock<WebdriverIO.Browser>({
        takeScreenshot: vi.fn().mockResolvedValue(screenshot),
        execute: vi.fn().mockResolvedValue(undefined),
    })
}

const baseOptions = (scrollContainer: WebdriverIO.Element): ScrollContainerFullPageOptions => ({
    devicePixelRatio: 1,
    fullPageScrollTimeout: 0,
    hideAfterFirstScroll: [],
    hideScrollBars: true,
    scrollContainer,
})

describe('getScrollContainerFullPageScreenshotsData (#125)', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should stitch the rows above the container and the content of the container', async () => {
        // A header of 60px, then the container until the bottom of the 1000x800 viewport
        const { element } = createContainer({ top: 60, left: 0, width: 1000, height: 740, scrollTop: 0, scrollHeight: 2000, viewportWidth: 1000, viewportHeight: 800 })

        const result = await getScrollContainerFullPageScreenshotsData(createBrowser(), baseOptions(element))

        expect(result.fullPageHeight).toBe(2060)
        expect(result.fullPageWidth).toBe(1000)
        expect(result.data.map(({ screenshot: _screenshot, ...tile }) => tile)).toEqual([
            // The header and the first 740px of the content, with all columns
            { canvasWidth: 1000, canvasYPosition: 0, imageHeight: 800, imageWidth: 1000, imageXPosition: 0, imageYPosition: 0 },
            // Scrolled to 740: the content rows 740 to 1480
            { canvasWidth: 1000, canvasXPosition: 0, canvasYPosition: 800, imageHeight: 740, imageWidth: 1000, imageXPosition: 0, imageYPosition: 60 },
            // The container stops at 1260 (2000 - 740): only the content rows 1480 to 2000 are new
            { canvasWidth: 1000, canvasXPosition: 0, canvasYPosition: 1540, imageHeight: 520, imageWidth: 1000, imageXPosition: 0, imageYPosition: 280 },
        ])
    })

    it('should only stitch the columns of the container and add the rows below it from the last screenshot', async () => {
        // A sidebar of 200px on the left, a footer of 60px under the container
        const { element } = createContainer({ top: 60, left: 200, width: 800, height: 680, scrollTop: 0, scrollHeight: 1000, viewportWidth: 1000, viewportHeight: 800 })
        const browser = createBrowser()

        const result = await getScrollContainerFullPageScreenshotsData(browser, baseOptions(element))

        expect(result.fullPageHeight).toBe(60 + 1000 + 60)
        expect(result.data[1]).toMatchObject({ canvasXPosition: 200, canvasYPosition: 740, imageXPosition: 200, imageWidth: 800, imageHeight: 320, imageYPosition: 60 + 680 - 320 })
        // The footer: the rows from 740 to 800 of the last screenshot, below the content
        expect(result.data[2]).toEqual(expect.objectContaining({ canvasYPosition: 1060, imageHeight: 60, imageYPosition: 740, imageXPosition: 0 }))
        expect(result.data[2]).not.toHaveProperty('canvasXPosition')
    })

    it('should not use more than the viewport of the page when the screenshot is higher (Android ChromeDriver)', async () => {
        // The screenshot is 876px high, the viewport of the page is 820px
        const { element } = createContainer({ top: 60, left: 0, width: 427, height: 760, scrollTop: 0, scrollHeight: 760, viewportWidth: 427, viewportHeight: 820 })

        const result = await getScrollContainerFullPageScreenshotsData(createBrowser(screenshotOfSize(427, 876)), baseOptions(element))

        expect(result.fullPageHeight).toBe(820)
        expect(result.data).toHaveLength(1)
    })

    it('should use device pixels for the image data', async () => {
        const { element } = createContainer({ top: 60, left: 0, width: 1000, height: 740, scrollTop: 0, scrollHeight: 740, viewportWidth: 1000, viewportHeight: 800 })

        const result = await getScrollContainerFullPageScreenshotsData(createBrowser(screenshotOfSize(2000, 1600)), { ...baseOptions(element), devicePixelRatio: 2 })

        expect(result).toMatchObject({ fullPageHeight: 1600, fullPageWidth: 2000 })
        expect(result.data[0]).toMatchObject({ imageHeight: 1600, imageWidth: 2000 })
    })

    it('should continue when lazy loading makes the content longer', async () => {
        const { element } = createContainer({ top: 0, left: 0, width: 1000, height: 800, scrollTop: 0, scrollHeight: 1600, viewportWidth: 1000, viewportHeight: 800, growTo: [1600, 2400] })

        const result = await getScrollContainerFullPageScreenshotsData(createBrowser(), baseOptions(element))

        expect(result.fullPageHeight).toBe(2400)
        expect(result.data).toHaveLength(3)
    })

    it('should use the viewport of a mobile screenshot of the screen', async () => {
        const { element } = createContainer({ top: 0, left: 0, width: 400, height: 700, scrollTop: 0, scrollHeight: 700, viewportWidth: 400, viewportHeight: 700 })

        const result = await getScrollContainerFullPageScreenshotsData(createBrowser(screenshotOfSize(400, 900)), {
            ...baseOptions(element),
            viewport: { x: 0, y: 100, width: 400, height: 700 },
        })

        expect(result.data[0]).toMatchObject({ imageYPosition: 100, imageHeight: 700 })
        expect(result.fullPageHeight).toBe(700)
    })

    it('should hide and show the scrollbar of the container and scroll it back to its start position', async () => {
        const { element, execute } = createContainer({ top: 60, left: 0, width: 1000, height: 740, scrollTop: 300, scrollHeight: 2000, viewportWidth: 1000, viewportHeight: 800 })

        await getScrollContainerFullPageScreenshotsData(createBrowser(), baseOptions(element))

        const calls = execute.mock.calls
        expect(calls).toContainEqual([hideScrollContainerScrollbar, true])
        expect(calls.at(-2)).toEqual([hideScrollContainerScrollbar, false])
        expect(calls.at(-1)).toEqual([scrollContainerTo, 300])
    })

    it('should not touch the scrollbar of the container when hideScrollBars is off', async () => {
        const { element, execute } = createContainer({ top: 0, left: 0, width: 1000, height: 800, scrollTop: 0, scrollHeight: 800, viewportWidth: 1000, viewportHeight: 800 })

        await getScrollContainerFullPageScreenshotsData(createBrowser(), { ...baseOptions(element), hideScrollBars: false })

        expect(execute.mock.calls.some(([script]) => script === hideScrollContainerScrollbar)).toBe(false)
    })

    it('should hide the hideAfterFirstScroll elements after the first screenshot and show them again', async () => {
        const { element } = createContainer({ top: 0, left: 0, width: 1000, height: 800, scrollTop: 0, scrollHeight: 1600, viewportWidth: 1000, viewportHeight: 800 })
        const browser = createBrowser()
        const sticky = mock<HTMLElement>()

        await getScrollContainerFullPageScreenshotsData(browser, { ...baseOptions(element), hideAfterFirstScroll: [sticky] })

        expect(vi.mocked(browser.execute).mock.calls).toEqual([
            [hideRemoveElements, { hide: [sticky], remove: [] }, true],
            [hideRemoveElements, { hide: [sticky], remove: [] }, false],
        ])
        // Hidden after the first screenshot, before the second one
        const hideOrder = vi.mocked(browser.execute).mock.invocationCallOrder[0]
        const screenshotOrder = vi.mocked(browser.takeScreenshot).mock.invocationCallOrder
        expect(hideOrder).toBeGreaterThan(screenshotOrder[0])
        expect(hideOrder).toBeLessThan(screenshotOrder[1])
    })

    it('should throw when the container is not in the viewport, and still scroll it back', async () => {
        const { element, execute } = createContainer({ top: 900, left: 0, width: 1000, height: 300, scrollTop: 50, scrollHeight: 1000, viewportWidth: 1000, viewportHeight: 800 })

        await expect(getScrollContainerFullPageScreenshotsData(createBrowser(), baseOptions(element)))
            .rejects.toThrow('The scroll container of the full page screenshot is not in the viewport')

        expect(execute.mock.calls.at(-1)).toEqual([scrollContainerTo, 50])
    })
})
