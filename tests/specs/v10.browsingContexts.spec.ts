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
        // creates the baseline of page A
        await browser.checkScreen('v10-page-a')

        // v10: the new tab is returned and the browser stays on page A
        await browser.newWindow(fixture('page-b.html'), { type: 'tab' })

        expect(await browser.getUrl()).toContain('page-a.html')
        expect(await browser.checkScreen('v10-page-a')).toBe(0)
    })

    it('ignores the element of a $$ list at its own index after the DOM is rendered again (stale element)', async () => {
        await browser.url(fixture('boxes.html'))
        // creates the baseline of the 3 boxes
        await browser.checkScreen('v10-stale-ignore')

        const second = (await $$('.box'))[1]
        // The same markup again gives new DOM nodes, so the reference of `second` is stale.
        // Only the second box changes, so only an ignore region on the second box hides the change.
        await browser.execute(() => {
            document.body.innerHTML = document.body.innerHTML
            document.querySelectorAll<HTMLElement>('.box')[1].style.background = '#d32f2f'
        })

        // control: without an ignore region, the change is found
        expect(await browser.checkScreen('v10-stale-ignore')).toBeGreaterThan(0)
        // WebdriverIO finds the stale element again at index 1, so the change of the second box is ignored
        expect(await browser.checkScreen('v10-stale-ignore', { ignore: [second] })).toBe(0)
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
