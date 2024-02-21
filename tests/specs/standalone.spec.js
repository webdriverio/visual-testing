import { remote } from 'webdriverio'
import VisualService from '@wdio/visual-service'

const visualService = new VisualService({
    autoSaveBaseline: true
})

const browser = await remote({
    logLevel: 'debug',
    capabilities: {
        browserName: 'chrome',
    }
})

visualService.remoteSetup(browser)

await browser.url('https://webdriver.io/')

await browser.checkScreen('examplePaged', {})

await browser.deleteSession()
