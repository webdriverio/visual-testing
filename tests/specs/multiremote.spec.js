import fileExists from '../helpers/fileExists';

describe('wdio-image-comparison-service check that multi remote is working', () => {
    const resolution = '1366x768';

    beforeEach(async () => {
        await chromeBrowserOne.url('');
        await chromeBrowserOne.pause(500);

        await chromeBrowserTwo.url('');
        await chromeBrowserTwo.pause(500);
    });

    // Chrome remembers the last postion when the url is loaded again, this will reset it.
    afterEach(async () => {
        await chromeBrowserOne.execute('window.scrollTo(0, 0);', [])
        await chromeBrowserTwo.execute('window.scrollTo(0, 0);', [])
    });

    it('take a screenshot of each browser', async () => {
        const tag = 'homepage'
        const imageDataOne = await chromeBrowserOne.saveScreen(tag)
        const imageDataTwo = await chromeBrowserTwo.saveScreen(tag)

        const logNameOne = chromeBrowserOne.logName
        const filePathOne = `${imageDataOne.path}/${tag}-${logNameOne}-${resolution}.png`
        expect(fileExists(filePathOne)).toBe(true, `File : "${filePathOne}" could not be found`)

        const logNameTwo = chromeBrowserTwo.logName
        const filePathTwo = `${imageDataTwo.path}/${tag}-${logNameTwo}-${resolution}.png`
        expect(fileExists(filePathTwo)).toBe(true, `File : "${filePathTwo}" could not be found`)
    });

    it('take a screenshot of each browser using the global browser', async () => {
        const tag = 'homepage-multi'
        const imageDatas = await browser.saveScreen(tag)

        // Result is
        // [0-0] imageDatas =  {
        // [0-0]   chromeBrowserOne: Promise { <pending> },
        // [0-0]   chromeBrowserTwo: Promise { <pending> }
        // [0-0] }

        for(const [browserName, imageData] of Object.entries(imageDatas)) {
            const logName = global[browserName].logName
            const filePath = `${imageData.path}/${tag}-${logName}-${resolution}.png`
            expect(fileExists(filePath)).toBe(true, `File : "${filePath}" could not be found`)
        }
    });

});
