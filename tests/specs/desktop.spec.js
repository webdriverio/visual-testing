describe('wdio-image-comparison-service desktop', () => {
    beforeEach(async() => {
        await browser.url('');
        await $('.uk-button:nth-child(1)').waitForDisplayed();
    });

    // Chrome remembers the last postion when the url is loaded again, this will reset it.
    afterEach(async() => await browser.execute('window.scrollTo(0, 0);', []));

    describe('compare element', () => {
        it('should compare successful with a baseline', async() => {
           await expect(await browser.checkElement(await $('.uk-button:nth-child(1)'), 'firstButtonElement')).toEqual(0);
        });
    });

    describe('compare fullpage', () => {
        it('should compare successful with a baseline', async() => {
            await expect(await browser.checkFullPageScreen('fullPage', { fullPageScrollTimeout: '1500' })).toEqual(0);
        });
    });

    describe('compare tabbable', () => {
        it('should compare successful with a baseline', async() => {
            await expect(await browser.checkTabbablePage('tabbable')).toEqual(0);
        });
    });
});
