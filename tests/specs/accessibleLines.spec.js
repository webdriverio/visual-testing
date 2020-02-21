import fileExists from '../helpers/fileExists';

describe('wdio-image-comparison-service accessible lines', () => {
    const logName = browser.logName;
    const resolution = '1366x768';

    it('should do a saveTabbable', () => {
        browser.url('https://saucelabs.com/');
        browser.pause(500);

        // Click away the cookie
        browser.execute(`var elem = document.querySelector('[aria-label="cookieconsent"]');elem.parentNode.removeChild(elem);`);

        // remove the feedback button
        browser.execute(`var elem = document.querySelector('.olark-launch-button');elem.parentNode.removeChild(elem);`);

        const tag = 'saveTabbable';
        const imageData = browser.saveTabbable(tag, {
            hideAfterFirstScroll: [$('#headerMainNav')],
        });
        const filePath = `${imageData.path}/${tag}-${logName}-${resolution}.png`;

        expect(fileExists(filePath)).toBe(true, `File : "${filePath}" could not be found`);
    });
});

