import { copy } from 'fs-extra'
import { normalize, join } from 'node:path'
import { browser } from '@wdio/globals'

describe('webdriverio image comparison local development initialization', () => {
    const localBaseline = 'localBaseline'
    const checkBaseline = 'checkBaseline'

    beforeEach(async () => {
        await browser.url('')
        await browser.pause(500)
    })

    // Chrome remembers the last position when the url is loaded again, this will reset it.
    afterEach(async () => await browser.execute('window.scrollTo(0, 0);', []))

    it('should save the compare screenshot screenshot', async () => {
        const examplePage = 'examplePage'
        const { fileName, path } = (await browser.saveScreen(examplePage)) as {
            fileName: string;
            path: string;
        }

        copy(
            normalize(`${path}/${fileName}`),
            join(
                process.cwd(),
                `./${localBaseline}/${path.split('/').pop()}/${fileName}`
            )
        )
        copy(
            normalize(`${path}/${fileName}`),
            join(
                process.cwd(),
                `./${localBaseline}/${path.split('/').pop()}/${fileName.replace(
                    examplePage,
                    'examplePageFail'
                )}`
            )
        )
        copy(
            normalize(`${path}/${fileName}`),
            join(
                process.cwd(),
                `./${localBaseline}/${checkBaseline}/${path
                    .split('/')
                    .pop()}/${fileName.replace(
                    examplePage,
                    'screenCheckFolders'
                )}`
            )
        )
    })

    it('should save the compare element screenshot', async () => {
        const wdioLogo = 'wdioLogo'
        const { fileName, path } = (await browser.saveElement(
            await $('.hero__title-logo'),
            wdioLogo,
            {
                removeElements: [await $('nav.navbar')]
            }
        )) as {
            fileName: string;
            path: string;
        }

        copy(
            normalize(`${path}/${fileName}`),
            join(
                process.cwd(),
                `./${localBaseline}/${path.split('/').pop()}/${fileName}`
            )
        )
        copy(
            normalize(`${path}/${fileName}`),
            join(
                process.cwd(),
                `./${localBaseline}/${checkBaseline}/${path
                    .split('/')
                    .pop()}/${fileName.replace(
                    wdioLogo,
                    'elementCheckFolders'
                )}`
            )
        )
    })

    it('should save the compare fullpage screenshot', async () => {
        const fullPage = 'fullPage'
        const { fileName, path } = (await browser.saveFullPageScreen(fullPage, {
            fullPageScrollTimeout: 1500,
            hideAfterFirstScroll: [await $('nav.navbar')],
        })) as {
            fileName: string;
            path: string;
        }

        copy(
            normalize(`${path}/${fileName}`),
            join(
                process.cwd(),
                `./${localBaseline}/${path.split('/').pop()}/${fileName}`
            )
        )
        copy(
            normalize(`${path}/${fileName}`),
            join(
                process.cwd(),
                `./${localBaseline}/${checkBaseline}/${path
                    .split('/')
                    .pop()}/${fileName.replace(
                    fullPage,
                    'fullPageCheckFolders'
                )}`
            )
        )
    })

    it('should save the tabbable screenshot', async () => {
        const tabbable = 'tabbable'
        const { fileName, path } = (await browser.saveTabbablePage(tabbable, {
            fullPageScrollTimeout: 1500,
            hideAfterFirstScroll: [await $('nav.navbar')],
        })) as {
            fileName: string;
            path: string;
        }

        copy(
            normalize(`${path}/${fileName}`),
            join(
                process.cwd(),
                `./${localBaseline}/${path.split('/').pop()}/${fileName}`
            )
        )
        copy(
            normalize(`${path}/${fileName}`),
            join(
                process.cwd(),
                `./${localBaseline}/${checkBaseline}/${path
                    .split('/')
                    .pop()}/${fileName.replace(
                    tabbable,
                    'tabbableCheckFolders'
                )}`
            )
        )
    })
})
