import { readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'

declare global {
    interface Window {
        // tests/fixtures/v10/delayed-change.html
        setBox: (done: boolean, delay?: number, replace?: boolean) => void
    }
}

const fixture = (name: string) => pathToFileURL(join(process.cwd(), 'tests/fixtures/v10', name)).href
const baselineFolder = join(process.cwd(), '.tmp/v10-e2e/baseline')
const hasBaseline = (tag: string) => readdirSync(baselineFolder, { recursive: true })
    .some((file) => String(file).includes(`${tag}-`))

/**
 * WebdriverIO v10 uses Jasmine 6: Jasmine's own matchers are sync again, and the global `expect`
 * sends the WebdriverIO matchers to `expectAsync`. The visual matchers are added with `expect.extend`,
 * so check that they are still awaited and really compare.
 */
describe('@wdio/visual-service with Jasmine (WebdriverIO v10)', () => {
    it('awaits the visual matchers', async () => {
        await browser.url(fixture('page-a.html'))
        // creates the baseline
        await expect(browser).toMatchScreenSnapshot('v10-jasmine-page')

        // sync Jasmine matcher: the baseline only exists here when the visual matcher was awaited
        expect(hasBaseline('v10-jasmine-page')).toBe(true)
    })

    it('fails the visual matcher when the page is different', async () => {
        await browser.url(fixture('page-b.html'))

        await expect(browser).not.toMatchScreenSnapshot('v10-jasmine-page')
    })

    it('waits with the `wait` option (#690)', async () => {
        // creates the baseline of the box in its final color
        await browser.url(fixture('delayed-change.html'))
        await browser.execute(() => window.setBox(true))
        await $('#box.done').waitForExist()
        await expect($('#box')).toMatchElementSnapshot('v10-jasmine-delayed-change')

        // The box does not match yet, then it gets its final color in 1.5 s
        await browser.url(fixture('delayed-change.html'))
        await expect($('#box')).not.toMatchElementSnapshot('v10-jasmine-delayed-change')
        await browser.execute(() => window.setBox(true, 1500))
        await expect($('#box')).toMatchElementSnapshot('v10-jasmine-delayed-change', { wait: 5000, interval: 250 })
    })

    it('waits with the `wait` option for `.not` until the element does not match (#690)', async () => {
        // The box matches the baseline of the test above, then it loses its final color in 1.5 s
        await browser.url(fixture('delayed-change.html'))
        await browser.execute(() => window.setBox(true))
        await $('#box.done').waitForExist()
        await expect($('#box')).toMatchElementSnapshot('v10-jasmine-delayed-change')
        await browser.execute(() => window.setBox(false, 1500))
        await expect($('#box')).not.toMatchElementSnapshot('v10-jasmine-delayed-change', { wait: 5000, interval: 250 })
    })

    it('compares an element', async () => {
        await browser.url(fixture('box.html'))

        await expect($('#target')).toMatchElementSnapshot('v10-jasmine-box')
        await expect($('#target')).toMatchElementSnapshot('v10-jasmine-box', 0)
    })
})
