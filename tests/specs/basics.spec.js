import fileExists from '../helpers/fileExists';

describe('wdio-image-comparison-service basics', () => {
    const logName = browser.capabilities['sauce:options']
        ? browser.capabilities['sauce:options'].logName
        : browser.capabilities.logName;
    const resolution = '1366x768';

    beforeEach(() => {
        browser.url('');
        browser.pause(500);
    });

    // Chrome remembers the last postion when the url is loaded again, this will reset it.
    afterEach(() => browser.execute('window.scrollTo(0, 0);', []));

    describe('save methods', () => {
        it('should do a save screen', () => {
            const tag = 'examplePage';
            const imageData = browser.saveScreen('examplePage', {empty: null});
            const filePath = `${imageData.path}/${tag}-${logName}-${resolution}.png`;

            expect(fileExists(filePath)).toBe(true, `File : "${filePath}" could not be found`);
        });

        it('should do a save element', () => {
            const tag = 'firstButtonElement';
            const imageData = browser.saveElement($('.uk-button:nth-child(1)'), tag, {empty: null});
            const filePath = `${imageData.path}/${tag}-${logName}-${resolution}.png`;

            expect(fileExists(filePath)).toBe(true, `File : "${filePath}" could not be found`);
        });

        it('should save a fullpage screenshot', () => {
            const tag = 'fullPage';
            const imageData = browser.saveFullPageScreen(tag, {fullPageScrollTimeout: '1500'});
            const filePath = `${imageData.path}/${tag}-${logName}-${resolution}.png`;

            expect(fileExists(filePath)).toBe(true, `File : "${filePath}" could not be found`);
        });
    });

    describe('check methods', () => {
        it('should fail comparing with a baseline', () => {
            const tag = 'examplePageFail';

            browser.execute('arguments[0].innerHTML = "Test Demo Page";', $('h1.uk-heading-large'));
            expect(browser.checkScreen(tag)).toBeGreaterThan(0);
        });
    });
});
