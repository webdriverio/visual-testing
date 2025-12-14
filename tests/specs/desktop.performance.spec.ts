import { browser, expect } from '@wdio/globals'
import { unlink } from 'node:fs/promises'
import type { ImageCompareResult } from '@wdio/image-comparison-core'

describe('@wdio/visual-service desktop performance', () => {
    // @TODO
    // @ts-ignore
    const browserName = `${browser.capabilities.browserName}-${browser.capabilities.browserVersion}`
    const iterations = 20

    beforeEach(async () => {
        await browser.url('')
        await $('.hero__title-logo').waitForDisplayed()
    })

    // Chrome remembers the last position when the url is loaded again, this will reset it.
    afterEach(async () => await browser.execute('window.scrollTo(0, 0);', []))

    it(`should compare an element successful with a baseline for '${browserName}' (performance test)`, async function() {
        const executionTimes: number[] = []

        for (let i = 0; i < iterations; i++) {
            const startTime = Date.now()

            const result = await browser.checkElement(await $('.hero__title-logo'), 'wdioLogo', {
                removeElements: [await $('nav.navbar')],
                returnAllCompareData: true
            }) as ImageCompareResult

            // Delete the actual image after each iteration
            try {
                await unlink(result.folders.actual)
            } catch {
                // Ignore errors if file doesn't exist
            }

            // Assert the result
            expect(result.misMatchPercentage).toBeLessThanOrEqual(0)

            const endTime = Date.now()
            const executionTime = endTime - startTime
            executionTimes.push(executionTime)

            if (i === iterations - 1) {
                const averageTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
                console.log(`[Element Snapshot] Average execution time over ${iterations} iterations: ${averageTime.toFixed(2)}ms`)
            }
        }
    })

    it(`should compare a viewport screenshot successful with a baseline for '${browserName}' (performance test)`, async function() {
        const executionTimes: number[] = []

        for (let i = 0; i < iterations; i++) {
            const startTime = Date.now()

            const result = await browser.checkScreen('viewportScreenshot', {
                returnAllCompareData: true
            }) as ImageCompareResult

            // Delete the actual image after each iteration
            try {
                await unlink(result.folders.actual)
            } catch {
                // Ignore errors if file doesn't exist
            }

            // Assert the result
            expect(result.misMatchPercentage).toBeLessThanOrEqual(0)

            const endTime = Date.now()
            const executionTime = endTime - startTime
            executionTimes.push(executionTime)

            if (i === iterations - 1) {
                const averageTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
                console.log(`[Viewport Screenshot] Average execution time over ${iterations} iterations: ${averageTime.toFixed(2)}ms`)
            }
        }
    })

    it(`should compare a full page screenshot successful with a baseline for '${browserName}' (performance test)`, async function () {
        const executionTimes: number[] = []

        for (let i = 0; i < iterations; i++) {
            const startTime = Date.now()

            const result = await browser.checkFullPageScreen('fullPage', {
                fullPageScrollTimeout: 1500,
                hideAfterFirstScroll: [
                    await $('nav.navbar'),
                ],
                returnAllCompareData: true
            }) as ImageCompareResult

            // Delete the actual image after each iteration
            try {
                await unlink(result.folders.actual)
            } catch {
                // Ignore errors if file doesn't exist
            }

            // Assert the result
            expect(result.misMatchPercentage).toBeLessThanOrEqual(0)

            const endTime = Date.now()
            const executionTime = endTime - startTime
            executionTimes.push(executionTime)

            if (i === iterations - 1) {
                const averageTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
                console.log(`[Full Page Screenshot] Average execution time over ${iterations} iterations: ${averageTime.toFixed(2)}ms`)
            }
        }
    })

    it(`should compare a tabbable screenshot successful with a baseline for '${browserName}' (performance test)`, async function() {
        const executionTimes: number[] = []

        for (let i = 0; i < iterations; i++) {
            const startTime = Date.now()

            const result = await browser.checkTabbablePage('tabbable', {
                hideAfterFirstScroll: [
                    await $('nav.navbar'),
                ],
                returnAllCompareData: true
            }) as ImageCompareResult

            // Delete the actual image after each iteration
            try {
                await unlink(result.folders.actual)
            } catch {
                // Ignore errors if file doesn't exist
            }

            // Assert the result
            expect(result.misMatchPercentage).toBeLessThanOrEqual(0)

            const endTime = Date.now()
            const executionTime = endTime - startTime
            executionTimes.push(executionTime)

            if (i === iterations - 1) {
                const averageTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
                console.log(`[Tabbable Screenshot] Average execution time over ${iterations} iterations: ${averageTime.toFixed(2)}ms`)
            }
        }
    })
})
