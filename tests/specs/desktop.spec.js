describe('wdio-image-comparison-service desktop', () => {
    const browserName = `${driver.capabilities.browserName}-${driver.capabilities.browserVersion}`

    beforeEach(async () => {
        await browser.url('')
        await $('.uk-button:nth-child(1)').waitForDisplayed()
    })

    // Chrome remembers the last postion when the url is loaded again, this will reset it.
    afterEach(async () => await browser.execute('window.scrollTo(0, 0);', []))

    it(`should compare an element successful with a baseline for '${browserName}'`, async () => {
        await expect(
            await browser.checkElement(
                await $('.uk-button:nth-child(1)'),
                'firstButtonElement'
            )
        ).toEqual('0.00')
    })

    it(`should compare a full page screenshot successful with a baseline for '${browserName}'`, async () => {
        await expect(
            await browser.checkFullPageScreen('fullPage', {
                fullPageScrollTimeout: '1500',
            })
        ).toEqual('0.00')
    })

    it(`should compare a tabbable screenshot successful with a baseline for '${browserName}'`, async () => {
        await expect(await browser.checkTabbablePage('tabbable')).toEqual(
            '0.00'
        )
    })
})
