const path = require('path');

describe('wdio-image-comparison-service save methods folder options', () => {
    const testOptions = {
        returnAllCompareData: true,
        actualFolder: path.join(process.cwd(), './.tmp/saveActual'),
        testFolder: './.tmp'
    };

    beforeEach(() => {
        browser.url('');
        browser.pause(500);
    });

    // Chrome remembers the last postion when the url is loaded again, this will reset it.
    afterEach(() => browser.execute('window.scrollTo(0, 0);', []));

    describe('saveFullPageScreen method with folder options', () => {
        it('should set folders using method options', () => {
            const results = browser.saveFullPageScreen('saveFullPageFolderOptions', testOptions);
            expect(results.path).toMatch(testOptions.actualFolder.replace('./', ''));
        });

        it('should set folders using default options', () => {
            const results = browser.saveFullPageScreen('saveFullPageDefaultOptions', {});
            expect(results.path).toMatch('.tmp');
        });
    });

    describe('saveScreen method with folder options', () => {
        it('should set folders using method options', () => {
            const results = browser.saveScreen('saveScreenFolderOptions', testOptions);
            expect(results.path).toMatch(testOptions.actualFolder.replace('./', ''));
        });

        it('should set folders using default options', () => {
            const results = browser.saveScreen('saveScreenDefaultOptions', {});
            expect(results.path).toMatch('.tmp');
        });
    });

    describe('saveElement method with folder options', () => {
        it('should set folders using method options', () => {
            const results = browser.saveElement($('.uk-button:nth-child(1)'), 'saveElementFolderOptions', testOptions);
            expect(results.path).toMatch(testOptions.actualFolder.replace('./', ''));
        });

        it('should set folders using default options', () => {
            const results = browser.saveElement($('.uk-button:nth-child(1)'), 'saveElementDefaultOptions', {});
            expect(results.path).toMatch('.tmp');
        });
    });
});
