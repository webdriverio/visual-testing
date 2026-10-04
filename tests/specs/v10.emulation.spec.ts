import { browser, expect } from '@wdio/globals'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'

const fixture = (name: string) => pathToFileURL(join(process.cwd(), 'tests/fixtures/v10', name)).href

/**
 * WebdriverIO applies `mobileEmulation.deviceName` itself, but a BiDi screenshot only has the device pixel
 * ratio after the visual service sets the viewport. In WebdriverIO v10 the service failed its setup when
 * `emulate('device')` was not supported (`emulation.setTextLayoutModeOverride` in Chrome), and the visual
 * matchers were missing.
 */
describe('@wdio/visual-service with Chrome mobile emulation (WebdriverIO v10)', () => {
    it('keeps the emulation of the device', async () => {
        await browser.url(fixture('page-a.html'))
        const { isIPhone, devicePixelRatio } = await browser.execute(() => ({
            isIPhone: /iPhone/.test(navigator.userAgent),
            devicePixelRatio: window.devicePixelRatio,
        }))

        expect(isIPhone).toBe(true)
        expect(devicePixelRatio).toBe(3)
    })

    it('takes the screenshot with the device pixel ratio of the device', async () => {
        await browser.url(fixture('page-a.html'))
        const { fileName, path } = await browser.saveScreen('v10-emulation-dpr') as { fileName: string, path: string }
        // The width of a PNG is at byte 16 of the file
        const imageWidth = readFileSync(join(path, fileName)).readUInt32BE(16)

        expect(imageWidth).toBe(390 * 3)
    })

    it('compares the screen of the emulated device', async () => {
        await browser.url(fixture('page-a.html'))
        // The first check creates the baseline, the second check compares with it
        await expect(browser).toMatchScreenSnapshot('v10-emulation-device')
        await expect(browser).toMatchScreenSnapshot('v10-emulation-device')
    })
})
