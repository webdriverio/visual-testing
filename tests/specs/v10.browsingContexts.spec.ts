import { pathToFileURL } from 'node:url'
import { join } from 'node:path'
import { browser, expect } from '@wdio/globals'

const fixture = (name: string) => pathToFileURL(join(process.cwd(), 'tests/fixtures/v10', name)).href

/**
 * WebdriverIO v10 behavior that unit tests cannot cover, see the v10 migration guide:
 * - `browser.newWindow()` returns a browsing context and no longer switches to it
 * - in a WebDriver BiDi session, frames are reached with `context.frame()`, `switchFrame` throws
 * - an element command finds a stale element again (with its index in a `$$` list), so an ignore element is
 *   found again after the DOM is rendered again
 *
 * The baselines are created in the same run, so no committed baseline is needed.
 */
describe('@wdio/visual-service WebdriverIO v10 browsing contexts', () => {
    it('captures the page that the browser commands act on after newWindow()', async () => {
        await browser.url(fixture('page-a.html'))
        // creates the baseline of page A; returnAllCompareData also returns the file name
        const baseline = await browser.checkScreen('v10-page-a', { returnAllCompareData: true })
        expect(baseline).toHaveProperty('fileName')

        // v10: the new tab is returned and the browser stays on page A
        const pageB = await browser.newWindow(fixture('page-b.html'), { type: 'tab' })

        try {
            expect(await browser.getUrl()).toContain('page-a.html')
            // Chrome brings the new tab to the front, so page A is now in a background tab. In a BiDi session the
            // service activates the browsing context of the browser (page A) before the check, as a WebDriver Classic
            // screenshot does. Page B is blue, so a screenshot of page B would not match the red page A
            const result = await browser.checkScreen('v10-page-a', { returnAllCompareData: true })
            expect(await browser.execute(() => document.visibilityState)).toBe('visible')
            // the same file name, folders and mismatch (0) as the baseline: a different file name would save a new
            // baseline and pass without comparing
            expect(result).toEqual(baseline)
        } finally {
            // Close the new tab. On Linux headless Chrome, page A is then in a background tab, and a screenshot
            // of it hangs (`browsingContext.captureScreenshot` timeout) when the page changes in a later test
            if ('closeWindow' in pageB) {
                await pageB.closeWindow()
            }
        }
    })

    it('ignores the element of a $$ list at its own index after the DOM is rendered again (stale element)', async () => {
        await browser.url(fixture('boxes.html'))
        // creates the baseline of the 3 boxes
        await browser.checkScreen('v10-stale-ignore')

        const second = (await $$('.box'))[1]
        // The same markup again gives new DOM nodes, so the reference of `second` is stale.
        // Only the second box changes, so only an ignore region on the second box hides the change.
        await browser.execute(() => {
            const markup = document.body.innerHTML
            document.body.innerHTML = markup
            document.querySelectorAll<HTMLElement>('.box')[1].style.background = '#d32f2f'
        })

        // control: without an ignore region, the change is found
        expect(await browser.checkScreen('v10-stale-ignore')).toBeGreaterThan(0)
        // WebdriverIO finds the stale element again at index 1, so the change of the second box is ignored
        expect(await browser.checkScreen('v10-stale-ignore', { ignore: [second] })).toBe(0)
    })

    it('takes an element screenshot with biDiOrigin viewport of an element that is scrolled into view', async () => {
        await browser.url(fixture('tall.html'))

        for (const id of ['near', 'far']) {
            // creates the baseline with the default `document` origin
            await browser.checkElement(await $(`#${id}`), `v10-viewport-origin-${id}`)
            // The `viewport` origin must clip the same element: the clip uses the position of the element in the
            // viewport, not its position on the page (`getElementRect`), which is different after the scroll
            expect(await browser.checkElement(await $(`#${id}`), `v10-viewport-origin-${id}`, { biDiOrigin: 'viewport' })).toBe(0)
        }
    })

    it('draws the tab order through an open shadow root (#515)', async () => {
        // creates the baseline with the 4 buttons in the light DOM
        await browser.url(fixture('tabbable-light.html'))
        await browser.checkTabbablePage('v10-tabbable-shadow')

        // The same page with 2 of the buttons in a shadow root must give the same tab order (circles and lines)
        await browser.url(fixture('tabbable-shadow.html'))
        expect(await browser.checkTabbablePage('v10-tabbable-shadow')).toBe(0)
    })

    it('draws the tab stops of radio groups, SVG elements and details elements as the browser has them', async () => {
        // The reference page has an element with tabindex="0" at the place of each expected tab stop
        await browser.url(fixture('tabbable-cases-reference.html'))
        await browser.checkTabbablePage('v10-tabbable-cases')

        await browser.url(fixture('tabbable-cases.html'))
        expect(await browser.checkTabbablePage('v10-tabbable-cases')).toBe(0)
    })

    it('takes a full page screenshot of a page where a container scrolls, with scrollContainer (#125)', async () => {
        // creates the baseline: the same page with the container expanded, so the page itself scrolls
        await browser.url(`${fixture('app-shell.html')}?expanded`)
        await browser.checkFullPageScreen('v10-scroll-container')

        // The header, the full content of the container and the footer, as in the expanded page
        await browser.url(fixture('app-shell.html'))
        const scrollContainer = await $('#scroller')
        expect(await browser.checkFullPageScreen('v10-scroll-container', { scrollContainer })).toBe(0)
        // The container is scrolled back to its start position
        expect(await browser.execute((el) => el.scrollTop, scrollContainer)).toBe(0)
    })

    it('ignores a sticky element of a scroll container in each screenshot of the container (#125)', async () => {
        // The sticky title is at the top of the container in each screenshot, so it is in the image more than once
        await browser.url(`${fixture('app-shell.html')}?sticky`)
        const scrollContainer = await $('#scroller')
        const title = await $('#title')
        await browser.checkFullPageScreen('v10-scroll-container-sticky', { scrollContainer, ignore: [title] })

        // The title has another color: each place of the title in the image must be ignored
        await browser.execute(() => {
            const element = document.getElementById('title')
            if (element) {
                element.style.background = '#2e7d32'
            }
        })
        expect(await browser.checkFullPageScreen('v10-scroll-container-sticky', { scrollContainer, ignore: [title] })).toBe(0)
    })

    // Known gap, not supported yet: the element rect comes from WebDriver Classic `getElementRect`, which cannot
    // find an element in a frame (`no such element`), and `browsingContext.captureScreenshot` only accepts a
    // top-level context. A fix must add the offset of the iframe to the rect of the element in the frame.
    // Remove `.skip` when this is supported.
    it.skip('takes an element screenshot of an element in a frame found with context.frame()', async () => {
        await browser.url(fixture('box.html'))
        // creates the baseline of the box outside a frame
        await browser.checkElement(await $('#target'), 'v10-box')

        const page = await browser.url(fixture('frame.html'))
        const frame = await page.frame('iframe')
        const box = await frame.$('#target')

        // the same box inside the frame must give the same image
        expect(await browser.checkElement(box, 'v10-box')).toBe(0)
    })
})
