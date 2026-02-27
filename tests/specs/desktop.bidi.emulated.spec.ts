import { browser, expect } from '@wdio/globals'

describe('@wdio/visual-service desktop bidi emulated', () => {
    // @TODO
    // @ts-ignore
    const browserName = `${browser.capabilities.browserName}-${browser.capabilities.browserVersion}`

    beforeEach(async () => {
        await browser.url('')
        await $('.hero__title-logo').waitForDisplayed()
    })

    it(`should compare an element successful with a baseline for '${browserName}'`, async function() {
        await expect($('.hero__title-logo')).toMatchElementSnapshot(
            'bidiEmulatedWdioLogo', {
                hideElements: [await $('nav.navbar')]
            }
        )
    })

    it(`should compare an element screenshot with ignore elements successful with a baseline for '${browserName}'`, async function () {
        await $('.features_vqN4').scrollIntoView()

        // When running a new set of images then first comment out block 1 and 2. Then run the test.
        // Then uncomment block 1, check if they fail with `--store-diffs` as an extra argument.
        // If so, then uncomment block 2 and check if pass with the same arguments.
        // Block 1
        await browser.execute(() => {
            document.querySelectorAll('.feature_G9wp h3').forEach(heading => {
                (heading as HTMLElement).style.backgroundColor = 'var(--ifm-color-primary)'
            })
        })

        await expect($('.features_vqN4')).toMatchElementSnapshot(
            'bidiIgnoredElementsElementScreenshot',
            {
                // Block 2
                ignore: [
                    await $$('.feature_G9wp h3'),
                ],
                // Some padding to make sure that we cover the element,
                // with BiDi we sometimes miss the element due to internal calculations
                ignoreRegionPadding: 2,
                // Don't comment this out, it's needed to hide the navbar
                hideElements: [await $('nav.navbar')]
            }
        )
    })

    it(`should compare a viewport screenshot successful with a baseline for '${browserName}'`, async function () {
        await expect(browser).toMatchScreenSnapshot('bidiEmulatedViewportScreenshot')
    })

    // NOTE: Bidi screenshots are not supported in emulated mode, it will fallback to the legacy API automatically
    // This is a bug in the bidi protocol, it should be fixed in the future
    it(`should compare a full page screenshot successful with a baseline for '${browserName}'`, async function() {
        await expect(browser).toMatchFullPageSnapshot('bidiLegacyEmulatedFullPage', { hideAfterFirstScroll: [await $('nav.navbar')] })
    })

    it(`should compare an element successful with a baseline for '${browserName}' with the legacy API`, async function() {
        await expect($('.hero__title-logo')).toMatchElementSnapshot('legacyEmulatedWdioLogo', {
            enableLegacyScreenshotMethod: true,
            // We need to remove the navbar otherwise it will be in the screenshot
            removeElements: [await $('nav.navbar')]
        })
    })

    it(`should compare an element screenshot with ignore elements successful with a baseline for '${browserName}' with the legacy API`, async function () {
        await $('.features_vqN4').scrollIntoView()

        // When running a new set of images then first comment out block 1 and 2. Then run the test.
        // Then uncomment block 1, check if they fail with `--store-diffs` as an extra argument.
        // If so, then uncomment block 2 and check if pass with the same arguments.
        // Block 1
        await browser.execute(() => {
            document.querySelectorAll('.feature_G9wp h3').forEach(heading => {
                (heading as HTMLElement).style.backgroundColor = 'var(--ifm-color-primary)'
            })
        })

        await expect($('.features_vqN4')).toMatchElementSnapshot(
            'legacyIgnoredElementsElementScreenshot',
            {
                enableLegacyScreenshotMethod: true,
                // Block 2
                ignore: [
                    await $$('.feature_G9wp h3'),
                ],
                // Don't comment this out, it's needed to hide the navbar
                hideElements: [await $('nav.navbar')]
            }
        )
    })

    it(`should compare a viewport screenshot successful with a baseline for '${browserName}' with the legacy API`, async function () {
        await expect(browser).toMatchScreenSnapshot('legacyEmulatedViewportScreenshot', { enableLegacyScreenshotMethod: true })
    })
})
