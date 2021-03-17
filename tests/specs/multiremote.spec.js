import fileExists from '../helpers/fileExists';

describe('wdio-image-comparison-service check that multi remote is working', () => {
    const resolution = '1366x768';

    beforeEach(() => {
        chromeBrowserOne.url('');
        chromeBrowserOne.pause(500);

        chromeBrowserTwo.url('');
        chromeBrowserTwo.pause(500);
    });

    // Chrome remembers the last postion when the url is loaded again, this will reset it.
    afterEach(() => {
        chromeBrowserOne.execute('window.scrollTo(0, 0);', [])
        chromeBrowserTwo.execute('window.scrollTo(0, 0);', [])
    });

    it('take a screenshot of each browser', () => {
        const tag = 'homepage'
        const imageDataOne = chromeBrowserOne.saveScreen(tag)
        const imageDataTwo = chromeBrowserTwo.saveScreen(tag)

        const filePathOne = `${imageDataOne.path}/${tag}-chrome-latest-one-${resolution}.png`
        expect(fileExists(filePathOne)).toBe(true, `File : "${filePathOne}" could not be found`)

        const filePathTwo = `${imageDataTwo.path}/${tag}-chrome-latest-two-${resolution}.png`
        expect(fileExists(filePathTwo)).toBe(true, `File : "${filePathTwo}" could not be found`)
    });


});
