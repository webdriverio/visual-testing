describe('wdio-image-comparison-service check that multi remote is working', () => {


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
        //Not a great test, but saves the screen on one browser and expect it to be exactly the same on the other
        //Note that autoSaveBaseline is set to false but neither of these capabilities have a logname set so they'll use
        // the same file name given the same tag.
        chromeBrowserOne.saveScreen('homepage')
        expect(chromeBrowserTwo.checkScreen('homepage')).toBe(0)
    });
});
