describe('@wdio/visual-service check that multi remote is working', () => {
    it('take a screenshot of each browser', async () => {
        // First create a screenshot of the web app
        await multiremotebrowser.chromeBrowserOne.url('')
        await multiremotebrowser.chromeBrowserOne.pause(500)
        await multiremotebrowser.chromeBrowserOne.saveScreen('web-before-app')

        // Then create a screenshot of the Android app
        await multiremotebrowser.androidApp.saveScreen('app-should-not-fail')
    })
})
