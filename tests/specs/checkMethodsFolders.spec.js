import fileExists from '../helpers/fileExists';
const path = require('path');

describe('wdio-image-comparison-service check methods folder options', () => {
    const logName = browser.logName;
    const resolution = '1366x768';

    beforeEach(() => {
        browser.url('');
        browser.pause(500);
    });

    // Chrome remembers the last postion when the url is loaded again, this will reset it.
    afterEach(() => browser.execute('window.scrollTo(0, 0);', []));

    describe('checkFullPageScreen method with folder options', () => {
        it('should set all folders using method options', () => {
            const testOptions = {
                actualFolder: path.join(process.cwd(), './testActual'),
                baselineFolder: path.join(process.cwd(), './testBaseline'),
                diffFolder: path.join(process.cwd(), './testDiff'),
                returnAllCompareData: true
            };
            const results = browser.checkFullPageScreen('fullPageAllOptions', testOptions);
            expect(results.folders.actual).toMatch(testOptions.actualFolder.replace('./',''));
            expect(results.folders.baseline).toMatch(testOptions.baselineFolder.replace('./',''));
            expect(results.folders.diff).toMatch(testOptions.diffFolder.replace('./',''));
            expect(results.misMatchPercentage).toEqual(0);
        });

        it('should set one folder using method options', () => {
            const testOptions = {
                actualFolder: path.join(process.cwd(), './testActual'),
                returnAllCompareData: true
            };
            const results = browser.checkFullPageScreen('fullPageOneOption', testOptions);
            expect(results.folders.actual).toMatch(testOptions.actualFolder.replace('./',''));
            expect(results.folders.baseline).toMatch('localBaseline');
            expect(results.folders.diff).toMatch('.tmp');
            expect(results.misMatchPercentage).toEqual(0);
        });

        it('should set two folders using method options', () => {
            const testOptions = {
                actualFolder: path.join(process.cwd(), './testActual'),
                diffFolder: path.join(process.cwd(), './testDiff'),
                returnAllCompareData: true
            };
            const results = browser.checkScreen('fullPageTwoOptions', testOptions);
            expect(results.folders.actual).toMatch(testOptions.actualFolder.replace('./',''));
            expect(results.folders.baseline).toMatch('localBaseline');
            expect(results.folders.diff).toMatch(testOptions.diffFolder.replace('./',''));
            expect(results.misMatchPercentage).toEqual(0);
        });
    });

    describe('checkScreen method with folder options', () => {
        it('should set all folders using method options', () => {
            const testOptions = {
                actualFolder: path.join(process.cwd(), './testActual'),
                baselineFolder: path.join(process.cwd(), './testBaseline'),
                diffFolder: path.join(process.cwd(), './testDiff'),
                returnAllCompareData: true
            };
            const results = browser.checkScreen('screenOptions', testOptions);
            expect(results.folders.actual).toMatch(testOptions.actualFolder.replace('./',''));
            expect(results.folders.baseline).toMatch(testOptions.baselineFolder.replace('./',''));
            expect(results.folders.diff).toMatch(testOptions.diffFolder.replace('./',''));
            expect(results.misMatchPercentage).toEqual(0);
        });

        it('should set one folder using method options', () => {
            const testOptions = {
                actualFolder: path.join(process.cwd(), './testActual'),
                returnAllCompareData: true
            };
            const results = browser.checkFullPageScreen('screenOneOption', testOptions);
            expect(results.folders.actual).toMatch(testOptions.actualFolder.replace('./',''));
            expect(results.folders.baseline).toMatch('localBaseline');
            expect(results.folders.diff).toMatch('.tmp');
            expect(results.misMatchPercentage).toEqual(0);
        });

        it('should set two folders using method options', () => {
            const testOptions = {
                actualFolder: path.join(process.cwd(), './testActual'),
                diffFolder: path.join(process.cwd(), './testDiff'),
                returnAllCompareData: true
            };
            const results = browser.checkScreen('screenTwoOptions', testOptions);
            expect(results.folders.actual).toMatch(testOptions.actualFolder.replace('./',''));
            expect(results.folders.baseline).toMatch('localBaseline');
            expect(results.folders.diff).toMatch(testOptions.diffFolder.replace('./',''));
            expect(results.misMatchPercentage).toEqual(0);
        });
    });

    describe('checkElement method with folder options', () => {
        it('should set all folders using method options', () => {
            const testOptions = {
                actualFolder: path.join(process.cwd(), './testActual'),
                baselineFolder: path.join(process.cwd(), './testBaseline'),
                diffFolder: path.join(process.cwd(), './testDiff'),
                returnAllCompareData: true
            };
            const results = browser.checkScreen('elementAllOptions', testOptions);
            expect(results.folders.actual).toMatch(testOptions.actualFolder.replace('./',''));
            expect(results.folders.baseline).toMatch(testOptions.baselineFolder.replace('./',''));
            expect(results.folders.diff).toMatch(testOptions.diffFolder.replace('./',''));
            expect(results.misMatchPercentage).toEqual(0);
        });

        it('should set one folder using method options', () => {
            const testOptions = {
                actualFolder: path.join(process.cwd(), './testActual'),
                returnAllCompareData: true
            };
            const results = browser.checkScreen('elementOneOption', testOptions);
            expect(results.folders.actual).toMatch(testOptions.actualFolder.replace('./',''));
            expect(results.folders.baseline).toMatch('localBaseline');
            expect(results.folders.diff).toMatch('.tmp');
            expect(results.misMatchPercentage).toEqual(0);
        });

        it('should set two folders using method options', () => {
            const testOptions = {
                actualFolder: path.join(process.cwd(), './testActual'),
                diffFolder: path.join(process.cwd(), './testDiff'),
                returnAllCompareData: true
            };
            const results = browser.checkScreen('elementTwoOptions', testOptions);
            expect(results.folders.actual).toMatch(testOptions.actualFolder.replace('./',''));
            expect(results.folders.baseline).toMatch('localBaseline');
            expect(results.folders.diff).toMatch(testOptions.diffFolder.replace('./',''));
            expect(results.misMatchPercentage).toEqual(0);
        });
    });
});
