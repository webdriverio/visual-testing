describe('@wdio/visual-service check that multi remote is working', () => {
    it('take a screenshot of each browser', async () => {
        // First create a screenshot of the web app
        await multiremotebrowser.chromeBrowserOne.url('')
        await multiremotebrowser.chromeBrowserOne.pause(500)
        await multiremotebrowser.chromeBrowserOne.checkScreen('web-before-app')

        // Then create a screenshot of the native app
        await multiremotebrowser.androidApp.checkScreen('app-after-web')

        // Now create a screenshot of both of them at the same time
        await browser.checkScreen('app-web')
    })
})
