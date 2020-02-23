import { copy } from 'fs-extra';
import { normalize, join } from 'path'

describe('webdriverio image comparison local development initialization', () => {
    const localBaseline = 'localBaseline';
    const checkBaseline = 'checkBaseline';

    beforeEach(() => {
        browser.url('');
        browser.pause(500);
    });

    // Chrome remembers the last postion when the url is loaded again, this will reset it.
    afterEach(() => browser.execute('window.scrollTo(0, 0);', []));

    it('should save the compare screenshot screenshot', () => {
        const examplePage = 'examplePage';
        browser.saveScreen(examplePage);
        const { fileName, path } = browser.saveScreen(examplePage);

        copy(normalize(`${ path }/${ fileName }`), join(process.cwd(), `./${ localBaseline }/${ path.split('/').pop() }/${ fileName }`));
        copy(
            normalize(`${ path }/${ fileName }`),
            join(process.cwd(), `./${ localBaseline }/${ path.split('/').pop() }/${ fileName.replace(examplePage, 'examplePageFail') }`),
        );
        copy(
            normalize(`${ path }/${ fileName }`),
            join(
                process.cwd(),
                `./${ localBaseline }/${ checkBaseline }/${ path.split('/').pop() }/${ fileName.replace(examplePage, 'screenCheckFolders') }`
            ),
        );
    });

    it('should save the compare element screenshot', () => {
        const firstButtonElement = 'firstButtonElement';
        const { fileName, path } = browser.saveElement($('.uk-button:nth-child(1)'), firstButtonElement);

        copy(normalize(`${ path }/${ fileName }`), join(process.cwd(), `./${ localBaseline }/${ path.split('/').pop() }/${ fileName }`));
        copy(
            normalize(`${ path }/${ fileName }`),
            join(
                process.cwd(),
                `./${ localBaseline }/${ checkBaseline }/${ path.split('/').pop() }/${ fileName.replace(firstButtonElement, 'elementCheckFolders') }`
            ),
        );
    });

    it('should save the compare fullpage screenshot', () => {
        const fullPage = 'fullPage';
        const { fileName, path } = browser.saveFullPageScreen(fullPage, { fullPageScrollTimeout: '1500' });

        copy(normalize(`${ path }/${ fileName }`), join(process.cwd(), `./${ localBaseline }/${ path.split('/').pop() }/${ fileName }`));
        copy(
            normalize(`${ path }/${ fileName }`),
            join(
                process.cwd(),
                `./${ localBaseline }/${ checkBaseline }/${ path.split('/').pop() }/${ fileName.replace(fullPage, 'fullPageCheckFolders') }`,
            ),
        );
    });

    it('should save the tabbable screenshot', () => {
        const tabbable = 'tabbable';
        const { fileName, path } = browser.saveTabbable(tabbable, { fullPageScrollTimeout: '1500' });

        copy(normalize(`${ path }/${ fileName }`), join(process.cwd(), `./${ localBaseline }/${ path.split('/').pop() }/${ fileName }`));
        copy(
            normalize(`${ path }/${ fileName }`),
            join(
                process.cwd(),
                `./${ localBaseline }/${ checkBaseline }/${ path.split('/').pop() }/${ fileName.replace(tabbable, 'tabbableCheckFolders') }`,
            ),
        );
    });
});
