describe('wdio-image-comparison-service desktop', () => {
    beforeEach(() => {
        browser.url('');
        $('.uk-button:nth-child(1)')
    });

    // Chrome remembers the last postion when the url is loaded again, this will reset it.
    afterEach(() => browser.execute('window.scrollTo(0, 0);', []));

    // // Disabled because it doesn't add value
    // describe('compare screen', () => {
    //     it('should compare successful with a baseline', () => {
    //         expect(browser.checkScreen('examplePage')).toEqual(0);
    //     });
    // });

    describe('compare element', () => {
        it('should compare successful with a baseline', () => {
            expect(browser.checkElement($('.uk-button:nth-child(1)'), 'firstButtonElement')).toEqual(0);
        });
    });

    describe('compare fullpage', () => {
        it('should compare successful with a baseline', () => {
            expect(browser.checkFullPageScreen('fullPage', { fullPageScrollTimeout: '1500' })).toEqual(0);
        });
    });

    describe('compare tabbable', () => {
        it('should compare successful with a baseline', () => {
            expect(browser.checkTabbable('tabbable')).toEqual(0);
        });
    });
});
