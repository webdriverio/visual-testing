import { describe, it, expect, vi, afterEach } from 'vitest'
import { join } from 'node:path'
import { mock } from 'vitest-mock-extended'
import { getScrollContainerFullPageScreenshotsData } from './screenshots.js'
import type { ScrollContainerFullPageOptions } from './screenshots.interfaces.js'
import getScrollContainerData from '../clientSideScripts/getScrollContainerData.js'
import scrollContainerTo from '../clientSideScripts/scrollContainerTo.js'
import prepareScrollContainer from '../clientSideScripts/prepareScrollContainer.js'
import hideRemoveElements from '../clientSideScripts/hideRemoveElements.js'
import getVisibleElementViewportRect from '../clientSideScripts/getVisibleElementViewportRect.js'

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
    // A change of the scroll position after each scroll, for content that loads above the visible rows
    driftAfterScroll?: number[]
    // The browser keeps the scroll position in device pixels
    pixelRatio?: number
    // Chrome reports the scroll position as a 32-bit float, for example 596.6666870117188 for 895 device pixels at DPR 1.5
    float32?: boolean
}

/**
 * A scroll container: it keeps its scroll position and stops at the end of its content, like a browser
 */
function createContainer(state: ContainerState) {
    const scrollPositions: number[] = []
    let scrolls = 0
    let drift = 0
    // `any`: the mock answers the different scripts of the element command `execute`
    const execute = vi.fn(async (script: unknown, ...args: unknown[]): Promise<any> => {
        if (script === getScrollContainerData) {
            // The position changes during the wait, after the scroll
            state.scrollTop += drift
            drift = 0
            const { growTo: _growTo, driftAfterScroll: _driftAfterScroll, pixelRatio: _pixelRatio, float32: _float32, ...data } = state
            return data
        }
        if (script === scrollContainerTo) {
            const position = Number(args[0])
            const pixelRatio = state.pixelRatio ?? 1
            state.scrollTop = Math.round(Math.max(0, Math.min(position, state.scrollHeight - state.height)) * pixelRatio) / pixelRatio
            if (state.float32) {
                state.scrollTop = Math.fround(state.scrollTop)
            }
            scrollPositions.push(state.scrollTop)
            if (state.growTo?.[scrolls] !== undefined) {
                state.scrollHeight = state.growTo[scrolls]
            }
            drift = state.driftAfterScroll?.[scrolls] ?? 0
            scrolls++
            return state.scrollTop
        }
        if (script === prepareScrollContainer) {
            return undefined
        }
        throw new Error('Unknown script')
    })

    return { element: mock<WebdriverIO.Element>({ execute }), execute, scrollPositions, state }
}

/**
 * An ignore element: its box in the viewport depends on the scroll position of the container
 */
function createIgnoreElement(boxFor: (scrollTop: number) => { x: number, y: number, width: number, height: number } | null, state: ContainerState) {
    // `any`: the mock answers the script of the element command `execute`
    const execute = vi.fn(async (script: unknown, ..._args: unknown[]): Promise<any> => {
        if (script === getVisibleElementViewportRect) {
            return boxFor(state.scrollTop)
        }
        throw new Error('Unknown script')
    })

    return mock<WebdriverIO.Element>({ execute })
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

    it('should not start again when the content gets longer after the container stopped at its end', async () => {
        // The second scroll stops at the end (400) before the target (800), then lazy loading makes the content longer
        const { element } = createContainer({ top: 0, left: 0, width: 1000, height: 800, scrollTop: 0, scrollHeight: 1200, viewportWidth: 1000, viewportHeight: 800, growTo: [1200, 2000] })
        const browser = createBrowser()

        const result = await getScrollContainerFullPageScreenshotsData(browser, baseOptions(element))

        expect(browser.takeScreenshot).toHaveBeenCalledTimes(3)
        expect(result.fullPageHeight).toBe(2000)
        expect(result.data.map(({ canvasYPosition, imageYPosition, imageHeight }) => ({ canvasYPosition, imageYPosition, imageHeight }))).toEqual([
            { canvasYPosition: 0, imageYPosition: 0, imageHeight: 800 },
            // Scrolled to 400: the content rows 800 to 1200 are new
            { canvasYPosition: 800, imageYPosition: 400, imageHeight: 400 },
            { canvasYPosition: 1200, imageYPosition: 0, imageHeight: 800 },
        ])
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

    it('should prepare the container before the first scroll, scroll it back to its start position and then put it back', async () => {
        const { element, execute } = createContainer({ top: 60, left: 0, width: 1000, height: 740, scrollTop: 300, scrollHeight: 2000, viewportWidth: 1000, viewportHeight: 800 })

        await getScrollContainerFullPageScreenshotsData(createBrowser(), baseOptions(element))

        const scripts = execute.mock.calls.map(([script]) => script)
        expect(scripts.indexOf(prepareScrollContainer)).toBeLessThan(scripts.indexOf(scrollContainerTo))
        // The scrollbar comes back first (it can change the layout), then the scroll back while scroll snap is still off,
        // so the container stops at its start position, then scroll snap comes back
        expect(execute.mock.calls.slice(-3)).toEqual([
            [prepareScrollContainer, false, { scrollbar: true, snap: false }],
            [scrollContainerTo, 300],
            [prepareScrollContainer, false, { scrollbar: false, snap: true }],
        ])
    })

    it('should not hide the scrollbar of the container when hideScrollBars is off', async () => {
        const { element, execute } = createContainer({ top: 0, left: 0, width: 1000, height: 800, scrollTop: 0, scrollHeight: 800, viewportWidth: 1000, viewportHeight: 800 })

        await getScrollContainerFullPageScreenshotsData(createBrowser(), { ...baseOptions(element), hideScrollBars: false })

        expect(execute.mock.calls.filter(([script]) => script === prepareScrollContainer)).toEqual([
            [prepareScrollContainer, true, { scrollbar: false, snap: true }],
            [prepareScrollContainer, false, { scrollbar: false, snap: true }],
        ])
    })

    it.each([1, 1.5, 2, 2.625])('should stitch the tiles without a gap when the container starts at a fractional position (DPR %s)', async (dpr) => {
        // A header of 60.5px: the browser keeps the scroll position in device pixels, so it can not stop at each
        // fractional row of the content
        const { element } = createContainer({ top: 60.5, left: 0, width: 1000, height: 739.5, scrollTop: 0, scrollHeight: 4500, viewportWidth: 1000, viewportHeight: 800, pixelRatio: dpr })

        const result = await getScrollContainerFullPageScreenshotsData(createBrowser(screenshotOfSize(Math.round(1000 * dpr), Math.round(800 * dpr))), { ...baseOptions(element), devicePixelRatio: dpr })

        expect(result.fullPageHeight).toBe(Math.round((60.5 + 4500) * dpr))
        result.data.forEach((tile, index) => {
            const next = result.data[index + 1]
            // Each tile ends where the next one starts, and the last one at the end of the image
            expect(tile.canvasYPosition + tile.imageHeight).toBe(next ? next.canvasYPosition : result.fullPageHeight)
            // The crop is in the screenshot, below the header for the tiles of the container
            expect(tile.imageYPosition + tile.imageHeight).toBeLessThanOrEqual(Math.round(800 * dpr))
            if (index > 0) {
                expect(tile.imageYPosition).toBeGreaterThanOrEqual(Math.floor(60.5 * dpr))
            }
        })
    })

    it.each([1.5, 2.625])('should crop each screenshot at the canvas row minus the scroll position in device pixels (DPR %s)', async (dpr) => {
        // A header of 60px and a viewport of 657px: the container shows 597px, so the rows of the next screenshot start at
        // half device pixels at DPR 1.5. The canvas row and the screenshot row of the same content differ by the scroll
        // position in device pixels, whatever the rounding of the other values
        const { element, scrollPositions } = createContainer({ top: 60, left: 0, width: 1000, height: 597, scrollTop: 0, scrollHeight: 4545, viewportWidth: 1000, viewportHeight: 657, pixelRatio: dpr, float32: true })

        const result = await getScrollContainerFullPageScreenshotsData(createBrowser(screenshotOfSize(Math.round(1000 * dpr), Math.round(657 * dpr))), { ...baseOptions(element), devicePixelRatio: dpr })

        const deviceScrollPositions = scrollPositions.map((position) => Math.round(position * dpr))
        expect(result.data[0].canvasYPosition - result.data[0].imageYPosition).toBe(0)
        for (const tile of result.data.slice(1)) {
            expect(deviceScrollPositions).toContain(tile.canvasYPosition - tile.imageYPosition)
        }
    })

    it('should crop only the rows that are fully in the container when its edges are at a fractional device pixel', async () => {
        // The content box of the container starts at 86px and ends at 621px: at DPR 2.625 that is 225.75 and 1630.125
        // device pixels, so the device rows 225 and 1630 are a blend of the container and what is around it
        const dpr = 2.625
        const { element, scrollPositions } = createContainer({ top: 86, left: 46, width: 908, height: 535, scrollTop: 0, scrollHeight: 3636, viewportWidth: 1000, viewportHeight: 657, pixelRatio: dpr, float32: true })

        const result = await getScrollContainerFullPageScreenshotsData(createBrowser(screenshotOfSize(Math.round(1000 * dpr), Math.round(657 * dpr))), { ...baseOptions(element), devicePixelRatio: dpr })

        const deviceScrollPositions = scrollPositions.map((position) => Math.round(position * dpr))
        const containerTiles = result.data.filter((tile) => tile.canvasXPosition !== undefined)
        expect(containerTiles.length).toBeGreaterThan(2)
        for (const tile of containerTiles) {
            expect(tile.imageYPosition).toBeGreaterThanOrEqual(226)
            expect(tile.imageYPosition + tile.imageHeight).toBeLessThanOrEqual(1630)
            expect(deviceScrollPositions).toContain(tile.canvasYPosition - tile.imageYPosition)
        }
        // The first tile ends at the last full row of the container, and the tiles touch
        expect(result.data[0].imageHeight).toBeLessThanOrEqual(1630)
        result.data.forEach((tile, index) => {
            const next = result.data[index + 1]
            expect(tile.canvasYPosition + tile.imageHeight).toBe(next ? next.canvasYPosition : result.fullPageHeight)
        })
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

    it('should measure the ignore elements at each screenshot and map them into the stitched image', async () => {
        // A header of 60px, then the container until the bottom of the 1000x800 viewport (tiles at the scroll positions 0, 740, 1260)
        const { element, state } = createContainer({ top: 60, left: 0, width: 1000, height: 740, scrollTop: 0, scrollHeight: 2000, viewportWidth: 1000, viewportHeight: 800 })
        const header = createIgnoreElement(() => ({ x: 0, y: 0, width: 1000, height: 60 }), state)
        // In the content at the rows 700 to 780, so across the first 2 tiles
        const inContent = createIgnoreElement((scrollTop) => ({ x: 10, y: 60 + 700 - scrollTop, width: 50, height: 80 }), state)
        // A sticky title at the top of the container: it is at the top of the container in each screenshot
        const sticky = createIgnoreElement(() => ({ x: 0, y: 60, width: 1000, height: 30 }), state)
        const hidden = createIgnoreElement(() => null, state)

        const result = await getScrollContainerFullPageScreenshotsData(createBrowser(), { ...baseOptions(element), ignoreElements: [header, inContent, sticky, hidden] })

        expect(result.elementRegions).toEqual([
            // The first screenshot: the rows 0 to 800 of the image
            { x: 0, y: 0, width: 1000, height: 60 },
            { x: 10, y: 760, width: 50, height: 40 },
            { x: 0, y: 60, width: 1000, height: 30 },
            // The second screenshot: the content rows 740 to 1480 at the image rows 800 to 1540
            { x: 10, y: 800, width: 50, height: 40 },
            { x: 0, y: 800, width: 1000, height: 30 },
        ])
    })

    it('should start again from the top when the scroll position changed during the wait', async () => {
        // During the wait after the second scroll, 30px of content loads above the visible rows: the browser keeps the
        // visible rows in place (scroll anchoring), so the rows of the first screenshot are not up to date any more
        const { element } = createContainer({ top: 0, left: 0, width: 1000, height: 800, scrollTop: 0, scrollHeight: 2400, viewportWidth: 1000, viewportHeight: 800, driftAfterScroll: [0, 30], growTo: [2400, 2430] })
        const browser = createBrowser()
        const sticky = mock<HTMLElement>()

        const result = await getScrollContainerFullPageScreenshotsData(browser, { ...baseOptions(element), hideAfterFirstScroll: [sticky] })

        // 2 screenshots before the change, then 4 from the top: the content is 2430px high now
        expect(browser.takeScreenshot).toHaveBeenCalledTimes(6)
        expect(result.fullPageHeight).toBe(2430)
        expect(result.data.map(({ screenshot: _screenshot, canvasYPosition, imageYPosition, imageHeight }) => ({ canvasYPosition, imageYPosition, imageHeight }))).toEqual([
            { canvasYPosition: 0, imageYPosition: 0, imageHeight: 800 },
            { canvasYPosition: 800, imageYPosition: 0, imageHeight: 800 },
            { canvasYPosition: 1600, imageYPosition: 0, imageHeight: 800 },
            { canvasYPosition: 2400, imageYPosition: 770, imageHeight: 30 },
        ])
        // The hideAfterFirstScroll elements are shown again for the new first screenshot
        expect(vi.mocked(browser.execute).mock.calls.map(([, , hide]) => hide)).toEqual([true, false, true, false])
    })

    it('should throw when the scroll position changes during each wait', async () => {
        const { element } = createContainer({ top: 0, left: 0, width: 1000, height: 800, scrollTop: 0, scrollHeight: 2400, viewportWidth: 1000, viewportHeight: 800, driftAfterScroll: [0, 30, 30, 30, 30, 30] })

        await expect(getScrollContainerFullPageScreenshotsData(createBrowser(), baseOptions(element)))
            .rejects.toThrow('The scroll position of the scroll container changed while the screenshots were taken')
    })

    it.each([
        ['below', { top: 60, height: 900 }, 'The bottom of the scroll container is below the viewport'],
        ['above', { top: -50, height: 700 }, 'The top of the scroll container is above the viewport'],
    ])('should throw when the container goes %s the viewport, because rows would be missing', async (_side, geometry, message) => {
        const { element } = createContainer({ ...geometry, left: 0, width: 1000, scrollTop: 0, scrollHeight: 2000, viewportWidth: 1000, viewportHeight: 800 })

        await expect(getScrollContainerFullPageScreenshotsData(createBrowser(), baseOptions(element))).rejects.toThrow(message)
    })

    it('should throw when the container is not in the viewport, and still scroll it back', async () => {
        const { element, execute } = createContainer({ top: 900, left: 0, width: 1000, height: 300, scrollTop: 50, scrollHeight: 1000, viewportWidth: 1000, viewportHeight: 800 })

        await expect(getScrollContainerFullPageScreenshotsData(createBrowser(), baseOptions(element)))
            .rejects.toThrow('The scroll container of the full page screenshot is not in the viewport')

        expect(execute.mock.calls.at(-2)).toEqual([scrollContainerTo, 50])
        expect(execute.mock.calls.at(-1)).toEqual([prepareScrollContainer, false, { scrollbar: false, snap: true }])
    })
})
