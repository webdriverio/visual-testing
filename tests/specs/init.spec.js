import { copy } from 'fs-extra';
import { normalize, join } from 'path'

describe('protractor-image-comparison local development initialization', () => {
    const localBaseline = 'localBaseline';

    beforeEach(async () => {
        await browser.url('');
        await browser.pause(500);
    });

    // Chrome remembers the last postion when the url is loaded again, this will reset it.
    afterEach(() => browser.execute('window.scrollTo(0, 0);', []));

    it('should save the compare screenshot screenshots', () => {
        const examplePage = 'examplePage';
        const examplePageFail = 'examplePageFail';
        browser.saveScreen(examplePage);
        const { fileName, path } = browser.saveScreen(examplePage);

        copy(normalize(`${ path }/${ fileName }`), join(process.cwd(), `./${ localBaseline }/${ path.split('/').pop() }/${ fileName }`));
        copy(
            normalize(`${ path }/${ fileName }`), join(process.cwd(),
                `./${ localBaseline }/${ path.split('/').pop() }/${ fileName.replace(examplePage, examplePageFail) }`)
        );
    });

    it('should save the compare element screenshot', () => {
        const { fileName, path } = browser.saveElement($('.uk-button:nth-child(1)'), 'firstButtonElement');

        copy(normalize(`${ path }/${ fileName }`), join(process.cwd(), `./${ localBaseline }/${ path.split('/').pop() }/${ fileName }`));
    });

    it('should save the compare fullpage screenshots', () => {
        const { fileName, path } = browser.saveFullPageScreen('fullPage', { fullPageScrollTimeout: '1500' });

        copy(normalize(`${ path }/${ fileName }`), join(process.cwd(), `./${ localBaseline }/${ path.split('/').pop() }/${ fileName }`));
    });
});
