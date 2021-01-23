const path = require('path');

describe('wdio-image-comparison-service check methods folder options', () => {

    const baselineFolder = browser.config.services.includes('sauce') ? 'tests/sauceLabsBaseline' : 'localBaseline';

    beforeEach(() => {
        browser.url('');
        browser.pause(500);
    });

    // Chrome remembers the last postion when the url is loaded again, this will reset it.
    afterEach(() => browser.execute('window.scrollTo(0, 0);', []));

    describe('checkFullPageScreen method with folder options', () => {
        it('should set all folders using method options', () => {
            const testOptions = {
                actualFolder: path.join(process.cwd(), './.tmp/checkActual'),
                baselineFolder: path.join(process.cwd(), `./${ baselineFolder }/checkBaseline`),
                diffFolder: path.join(process.cwd(), './.tmp/testDiff'),
                returnAllCompareData: true
            };
            const results = browser.checkFullPageScreen('fullPageCheckFolders', testOptions);

            expect(results.folders.actual).toMatch(testOptions.actualFolder.replace('./', ''));
            expect(results.folders.baseline).toMatch(testOptions.baselineFolder.replace('./', ''));
            // expect(results.folders.diff).toMatch(testOptions.diffFolder.replace('./', ''));
        });
    });

    describe('checkScreen method with folder options', () => {
        it('should set all folders using method options', () => {
            const testOptions = {
                actualFolder: path.join(process.cwd(), './.tmp/checkActual'),
                baselineFolder: path.join(process.cwd(), `./${ baselineFolder }/checkBaseline`),
                diffFolder: path.join(process.cwd(), './.tmp/testDiff'),
                returnAllCompareData: true
            };
            const results = browser.checkScreen('screenCheckFolders', testOptions);

            expect(results.folders.actual).toMatch(testOptions.actualFolder.replace('./', ''));
            expect(results.folders.baseline).toMatch(testOptions.baselineFolder.replace('./', ''));
            // expect(results.folders.diff).toMatch(testOptions.diffFolder.replace('./', ''));
        });
    });

    describe('checkElement method with folder options', () => {
        it('should set all folders using method options', () => {
            const testOptions = {
                actualFolder: path.join(process.cwd(), './.tmp/checkActual'),
                baselineFolder: path.join(process.cwd(), `./${ baselineFolder }/checkBaseline`),
                diffFolder: path.join(process.cwd(), './.tmp/testDiff'),
                returnAllCompareData: true
            };
            const results = browser.checkElement($('.uk-button:nth-child(1)'), 'elementCheckFolders', testOptions);

            expect(results.folders.actual).toMatch(testOptions.actualFolder.replace('./', ''));
            expect(results.folders.baseline).toMatch(testOptions.baselineFolder.replace('./', ''));
            //expect(results.folders.diff).toMatch(testOptions.diffFolder.replace('./', ''));
        });
    });
});
