import { browser, expect } from '@wdio/globals'

describe('Storybook Interaction', () => {
    it('should create screenshots for the logged in state when it logs out', async () => {
        const componentId = 'example-page--logged-in'
        await browser.waitForStorybookComponentToBeLoaded({ id: componentId })

        await expect($('header')).toMatchElementSnapshot(`${componentId}-logged-in-state`)
        await $('button=Log out').click()
        await expect($('header')).toMatchElementSnapshot(`${componentId}-logged-out-state`)

    })

    it('should create screenshots for the logged out state when it logs in', async () => {
        const componentId = 'example-page--logged-out'
        await browser.waitForStorybookComponentToBeLoaded({ id: componentId })

        await expect($('header')).toMatchElementSnapshot(`${componentId}-logged-out-state`)
        await $('button=Log in').click()
        await expect($('header')).toMatchElementSnapshot(`${componentId}-logged-in-state`)
    })
})
