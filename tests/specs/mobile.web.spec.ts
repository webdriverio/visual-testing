import { browser, expect } from '@wdio/globals'

/**
 * Added a retry on the mobile tests because in some cases the emulator or simulator wasn't loaded properly
 */
describe('@wdio/visual-service mobile web', () => {
    // Get the commands that need to be executed
    // 0 means all, otherwise it will only execute the commands that are specified
    const caps = driver.requestedCapabilities
    const lt = caps['lt:options']
    const bs = caps['bstack:options']
    const appium = caps['appium:options']
    const wdioIcsCommands = caps['wdio-ics:options'].commands
    const deviceName = lt?.deviceName || bs?.deviceName || appium?.deviceName || caps.deviceName
    const platformName = (lt?.platformName || appium?.platformName || caps.platformName).toLowerCase() === 'android' ? 'Android' : 'iOS'
    const platformVersion = lt?.platformVersion || bs?.osVersion || appium?.platformVersion || caps.platformVersion
    const orientation = (lt?.deviceOrientation || bs?.deviceOrientation || appium?.orientation || caps.orientation || 'PORTRAIT').toLowerCase()

    beforeEach(async () => {
        await browser.url('')
        await $('.hero__title-logo').waitForDisplayed()
        await browser.pause(3000)
    })

    // Refresh after each test to reset DOM modifications and scroll position.
    // Chrome can restore pages from bfcache when navigating to the same URL,
    // which would preserve inline style changes from "ignore elements" tests.
    afterEach(async () => await browser.refresh())

    if (
        wdioIcsCommands.length === 0 ||
        wdioIcsCommands.includes('checkScreen')
    ) {
        it(`should compare a screen successful for '${deviceName}' with ${platformName}:${platformVersion} in ${orientation}-mode`, async function () {
            skipTest({ test: this, deviceName, platformName, platformVersion, orientation })
            this.retries(2)

            // This is normally a bad practice, but a mobile screenshot is normally around 1M pixels
            // We're accepting 0.05%, which is 500 pixels, to be a max difference
            const result = await browser.checkScreen('screenshot') as number
            if (result > 0 && result < 0.05) {
                console.log(`\n\n\n'Screenshot for ${deviceName}' with ${platformName}:${platformVersion} in ${orientation}-mode has a difference of ${result}%\n\n\n`)
            }
            await expect(result < 0.05 ? 0 : result).toEqual(0)

            const newOrientation = orientation.toUpperCase() === 'LANDSCAPE' ? 'PORTRAIT' : 'LANDSCAPE'

            await browser.pause(2000)
            await browser.setOrientation(newOrientation)
            await browser.pause(2000)
            const newResult = await browser.checkScreen(`screenshot-${newOrientation.toLowerCase()}`) as number
            if (newResult > 0 && result < 0.05) {
                console.log(`\n\n\n'Screenshot for ${deviceName}' with ${platformName}:${platformVersion} in new orientation mode ${newOrientation} has a difference of ${result}%\n\n\n`)
            }
            // Before the expect we need to revert the orientation otherwise the next test will not start in the default orientation
            await browser.setOrientation(orientation)
            await expect(newResult < 0.05 ? 0 : newResult).toEqual(0)
        })

        it(`should compare a screen with ignore elements successful for '${deviceName}' with ${platformName}:${platformVersion} in ${orientation}-mode`, async function () {
            skipTest({ test: this, deviceName, platformName, platformVersion, orientation })

            // When running a new set of images then first comment out block 1 and 2. Then run the test.
            // Then uncomment block 1, check if they fail with `--store-diffs` as an extra argument.
            // If so, then uncomment block 2 and check if pass with the same arguments.
            // Block 1
            await browser.execute(() => {
                document.querySelectorAll('.getStarted_Sjon').forEach(link => {
                    (link as HTMLElement).style.backgroundColor = 'var(--ifm-font-color-base)'
                })
            })

            // This is normally a bad practice, but a mobile screenshot is normally around 1M pixels
            // We're accepting 0.05%, which is 500 pixels, to be a max difference
            const result = await browser.checkScreen(
                'ignoredElementsScreenshot', {
                    // Block 2
                    ignore: [
                        await $$('.getStarted_Sjon'),
                    ],
                }) as number
            if (result > 0 && result < 0.05) {
                console.log(`\n\n\n'Screenshot for ${deviceName}' with ${platformName}:${platformVersion} in ${orientation}-mode has a difference of ${result}%\n\n\n`)
            }
            await expect(result < 0.05 ? 0 : result).toEqual(0)
        })
    }

    if (
        wdioIcsCommands.length === 0 ||
        wdioIcsCommands.includes('checkElement')
    ) {
        it(`should compare an element successful for '${deviceName}' with ${platformName}:${platformVersion} in ${orientation}-mode`, async function() {
            skipTest({ test: this, deviceName, platformName, platformVersion, orientation })
            this.retries(2)

            await expect(
                await browser.checkElement(
                    await $('.hero__title-logo'),
                    'wdioLogo',
                    {
                        removeElements: [await $('nav.navbar')]
                    }
                )
            ).toEqual(0)
        })

        it(`should compare an element with ignore elements successful for '${deviceName}' with ${platformName}:${platformVersion} in ${orientation}-mode`, async function() {
            skipTest({ test: this, deviceName, platformName, platformVersion, orientation })

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
                'ignoredElementsElementScreenshot',
                {
                    // Block 2
                    ignore: [
                        await $$('.feature_G9wp h3'),
                    ],
                    // Don't comment this out, it's needed to hide the navbar
                    hideElements: [await $('nav.navbar')]
                }
            )
        })
    }

    if (
        wdioIcsCommands.length === 0 ||
        wdioIcsCommands.includes('checkFullPageScreen')
    ) {
        it(`should compare a full page screenshot successful for '${deviceName}' with ${platformName}:${platformVersion} in ${orientation}-mode`, async function() {
            skipTest({ test: this, deviceName, platformName, platformVersion, orientation })
            this.retries(2)

            // This is normally a bad practice, but a mobile full page screenshot is normally around 4M pixels
            // We're accepting 0.05%, which is 2000 pixels, to be a max difference
            const result = await browser.checkFullPageScreen('fullPage', {
                fullPageScrollTimeout: 1500,
                hideAfterFirstScroll: [
                    await $('nav.navbar'),
                ],
            }) as number
            if (result > 0 && result < 0.05) {
                console.log(`\n\n\nFull page layout screenshot for '${deviceName}' with ${platformName}:${platformVersion} in ${orientation}-mode has a difference of ${result}%\n\n\n`)
            }
            await expect(result < 0.05 ? 0 : result).toEqual(0)
        })

        it(`should compare a full page screenshot with ignore elements successful for '${deviceName}' with ${platformName}:${platformVersion} in ${orientation}-mode`, async function() {
            skipTest({ test: this, deviceName, platformName, platformVersion, orientation })

            // When running a new set of images then first comment out block 1 and 2. Then run the test.
            // Then uncomment block 1, check if they fail with `--store-diffs` as an extra argument.
            // If so, then uncomment block 2 and check if pass with the same arguments.
            // Block 1
            await browser.execute(() => {
                document.querySelectorAll('.feature_G9wp h3').forEach(heading => {
                    (heading as HTMLElement).style.backgroundColor = 'var(--ifm-color-primary)'
                })
            })

            await expect(browser).toMatchFullPageSnapshot(
                'ignoredElementsFullPageScreenshot',
                {
                    // Block 2
                    ignore: [
                        await $$('.feature_G9wp h3'),
                    ],
                    // We need to add some padding to the ignore regions
                    // to make sure that we cover the element that is being ignored.
                    ignoreRegionPadding: 5,
                    fullPageScrollTimeout: 1500,
                    hideAfterFirstScroll: [
                        await $('nav.navbar'),
                    ],
                }
            )
        })
    }
})

/******************************************************************************************
 * SKIP RULES
 * These are most likely TODO's that we have to fix but are not a blocker for the release.
 * The reason is added to help us remember why we skipped the test.
 ******************************************************************************************/

interface SkipRule {
    titleIncludes: string | string[]
    deviceName: string
    platformName: 'Android' | 'iOS'
    platformVersions: string[]
    orientations: ('landscape' | 'portrait')[]
    reason: string
}

const skipRules: SkipRule[] = [
    // Android devices
    {
        titleIncludes: 'compare a screen with ignore elements',
        deviceName: 'Pixel 4',
        platformName: 'Android',
        platformVersions: ['11'],
        orientations: ['landscape', 'portrait'],
        reason: 'Elements not visible in the screenshot, no value in testing',
    },
    {
        titleIncludes: 'compare a screen with ignore elements',
        deviceName: 'Pixel 4',
        platformName: 'Android',
        platformVersions: ['12', '13'],
        orientations: ['landscape'],
        reason: 'Elements not visible in the screenshot, no value in testing',
    },
    {
        titleIncludes: 'compare a screen with ignore elements',
        deviceName: 'Pixel 9 Pro',
        platformName: 'Android',
        platformVersions: ['14', '15'],
        orientations: ['landscape'],
        reason: 'Elements not visible in the screenshot, no value in testing',
    },
    {
        titleIncludes: 'compare a screen with ignore elements',
        deviceName: 'Pixel 9 Pro',
        platformName: 'Android',
        platformVersions: ['14'],
        orientations: ['portrait'],
        reason: 'Elements not visible in the screenshot, no value in testing',
    },
    {
        titleIncludes: 'should compare a screen successful for',
        deviceName: 'Pixel 9 Pro',
        platformName: 'Android',
        platformVersions: ['14'],
        orientations: ['landscape', 'portrait'],
        reason: 'Full black screen',
    },
    {
        titleIncludes: 'should compare a full page screenshot successful',
        deviceName: 'Pixel 9 Pro',
        platformName: 'Android',
        platformVersions: ['14'],
        orientations: ['landscape', 'portrait'],
        reason: 'Full black screen',
    },
    {
        titleIncludes: 'should compare a full page screenshot with ignore elements successful for',
        deviceName: 'Pixel 9 Pro',
        platformName: 'Android',
        platformVersions: ['14'],
        orientations: ['landscape', 'portrait'],
        reason: 'Full black screen',
    },
    {
        titleIncludes: 'should compare a full page screenshot with ignore elements successful for',
        deviceName: 'Galaxy Tab S8',
        platformName: 'Android',
        platformVersions: ['14'],
        orientations: ['landscape', 'portrait'],
        reason: 'Full black screen',
    },
    {
        titleIncludes: 'should compare a full page screenshot successful',
        deviceName: 'Galaxy Tab S8',
        platformName: 'Android',
        platformVersions: ['14'],
        orientations: ['landscape', 'portrait'],
        reason: 'Full black screen',
    },
    {
        titleIncludes: 'should compare a screen successful for',
        deviceName: 'Galaxy Tab S8',
        platformName: 'Android',
        platformVersions: ['14'],
        orientations: ['landscape', 'portrait'],
        reason: 'Full black screen',
    },
    {
        titleIncludes: 'compare a screen with ignore elements',
        deviceName: 'Galaxy Tab S8',
        platformName: 'Android',
        platformVersions: ['14'],
        orientations: ['landscape', 'portrait'],
        reason: 'Black screen',
    },
    // iOS devices
    {
        titleIncludes: 'compare a screen with ignore elements',
        deviceName: 'iPhone 13 mini',
        platformName: 'iOS',
        platformVersions: ['17.5'],
        orientations: ['landscape'],
        reason: 'Elements not visible in the screenshot, no value in testing',
    },
    {
        titleIncludes: 'compare a screen with ignore elements',
        deviceName: 'iPhone 13 Pro',
        platformName: 'iOS',
        platformVersions: ['16.0'],
        orientations: ['landscape'],
        reason: 'Elements not visible in the screenshot, no value in testing',
    },
    {
        titleIncludes: 'compare a screen with ignore elements',
        deviceName: 'iPhone 14 Pro',
        platformName: 'iOS',
        platformVersions: ['17.5'],
        orientations: ['landscape'],
        reason: 'Elements not visible in the screenshot, no value in testing',
    },
    {
        titleIncludes: 'compare a screen with ignore elements',
        deviceName: 'iPhone 15 Pro Max',
        platformName: 'iOS',
        platformVersions: ['18.0'],
        orientations: ['landscape'],
        reason: 'Elements not visible in the screenshot, no value in testing',
    },
]
function skipTest({ test, deviceName, platformName, platformVersion, orientation }: {
    test: Mocha.Context
    deviceName: string
    platformName: string
    platformVersion: string
    orientation: string
}) {
    const { title } = test.test!

    const matchedRule = skipRules.find(rule => {
        const patterns = Array.isArray(rule.titleIncludes) ? rule.titleIncludes : [rule.titleIncludes]

        return patterns.some(p => title.includes(p))
            && rule.deviceName === deviceName
            && rule.platformName === platformName
            && rule.platformVersions.includes(platformVersion)
            && rule.orientations.includes(orientation as 'landscape' | 'portrait')
    })

    if (matchedRule) {
        test.skip()
    }
}
