import { existsSync, mkdtempSync, readFileSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, it, vi, expect } from 'vitest'
import { mock } from 'vitest-mock-extended'
import {
    toMatchScreenSnapshot, toMatchFullPageSnapshot,
    toMatchElementSnapshot, toMatchTabbablePageSnapshot
} from '../src/matcher.js'

// WebdriverIO brands its objects with their kind, see `isWdioKind()` in `src/utils.ts`
const WDIO_KIND = Symbol.for('wdio.kind')

const folders = {
    baseline: 'foo',
    actual: 'bar',
    diff: 'baz'
}
let browser = {} as any as WebdriverIO.Browser
let multiremoteBrowser = {} as any as WebdriverIO.MultiRemoteBrowser

describe('custom visual matcher', () => {
    beforeEach(() => {
        browser = {
            [WDIO_KIND]: 'browser',
            checkScreen: vi.fn().mockResolvedValue({ misMatchPercentage :113, folders }),
            checkFullPageScreen: vi.fn().mockResolvedValue({ misMatchPercentage :113, folders }),
            checkElement: vi.fn().mockResolvedValue({ misMatchPercentage :113, folders }),
            checkTabbablePage: vi.fn().mockResolvedValue({ misMatchPercentage :113, folders })
        } as any as WebdriverIO.Browser
        multiremoteBrowser = {
            checkScreen: vi.fn().mockResolvedValue({
                androidDevice: {
                    fileName: 'Gmail-1344x2992-3.png',
                    folders: {
                        actual: 'actual/android/Gmail-1344x2992-3.png',
                        baseline: 'baseline/android/Gmail-1344x2992-3.png',
                        diff: 'diff/android/Gmail-1344x2992-3.png'
                    },
                    misMatchPercentage: 0
                },
                iosDevice: {
                    fileName: 'Contacts-1344x2992-3.png',
                    folders: {
                        actual: 'actual/ios/Contacts-1344x2992-3.png',
                        baseline: 'baseline/ios/Contacts-1344x2992-3.png',
                        diff: 'diff/ios/Contacts-1344x2992-3.png'
                    },
                    misMatchPercentage: 0
                },
            }),
            isMultiRemote: true,
            instances: {
                chrome: {
                    checkScreen: vi.fn().mockResolvedValue({ misMatchPercentage: 10, folders }),
                },
                firefox: {
                    checkScreen: vi.fn().mockResolvedValue({ misMatchPercentage: 20, folders }),
                },
            },
        } as any as WebdriverIO.MultiRemoteBrowser
    })

    it('toMatchScreenSnapshot', async () => {
        await expect(toMatchScreenSnapshot(browser, 'foo', 123, {})).resolves.toEqual({
            pass: true,
            message: expect.any(Function)
        })
        expect(browser.checkScreen).toBeCalledTimes(1)
    })

    it('toMatchFullPageSnapshot', async () => {
        await expect(toMatchFullPageSnapshot(browser, 'foo', 123, {})).resolves.toEqual({
            pass: true,
            message: expect.any(Function)
        })
        expect(browser.checkFullPageScreen).toBeCalledTimes(1)
    })

    it('toMatchElementSnapshot', async () => {
        await expect(toMatchElementSnapshot(browser as any as WebdriverIO.Element, 'foo', 123, {})).resolves.toEqual({
            pass: true,
            message: expect.any(Function)
        })
        expect(browser.checkElement).toBeCalledTimes(1)
    })

    it('toMatchElementSnapshot with an element found from a WebdriverIO v10 browsing context', async () => {
        // In WebdriverIO v10 the parent of the element is the browsing context, which holds the browser in `browser`
        const browsingContext = { [WDIO_KIND]: 'browsing-context', browser, isFrame: false }
        const element = { [WDIO_KIND]: 'element', elementId: 'element-id', selector: '#logo', parent: browsingContext } as any as WebdriverIO.Element

        await expect(toMatchElementSnapshot(element, 'foo', 123, {})).resolves.toEqual({
            pass: true,
            message: expect.any(Function)
        })
        expect(browser.checkElement).toHaveBeenCalledWith(element, 'foo', expect.any(Object))
    })

    describe('toMatchElementSnapshot with a multiremote element', () => {
        // `multiRemoteBrowser.$()` gives an element without `parent`, `getInstance()` gives the element of each
        // instance, and the parent of that element is the browser of the instance
        const createMultiRemoteElement = (misMatchPercentages = { chrome: 0, firefox: 0 }) => {
            const instanceBrowsers = {
                chrome: { [WDIO_KIND]: 'browser', checkElement: vi.fn().mockResolvedValue({ misMatchPercentage: misMatchPercentages.chrome, folders }) },
                firefox: { [WDIO_KIND]: 'browser', checkElement: vi.fn().mockResolvedValue({ misMatchPercentage: misMatchPercentages.firefox, folders }) },
            }
            const instanceElements: Record<string, { [WDIO_KIND]: string, elementId: string, parent: object }> = {
                chrome: { [WDIO_KIND]: 'element', elementId: 'chrome-element', parent: instanceBrowsers.chrome },
                firefox: { [WDIO_KIND]: 'element', elementId: 'firefox-element', parent: instanceBrowsers.firefox },
            }
            const element = {
                [WDIO_KIND]: 'element',
                isMultiRemote: true,
                selector: '#purplebox',
                instances: Object.keys(instanceElements),
                getInstance: (instanceName: string) => instanceElements[instanceName],
            } as any as WebdriverIO.Element

            return { element, instanceBrowsers, instanceElements }
        }

        it('compares the element on each instance', async () => {
            const { element, instanceBrowsers, instanceElements } = createMultiRemoteElement()

            await expect(toMatchElementSnapshot(element, 'purplebox', 0, {})).resolves.toEqual({
                pass: true,
                message: expect.any(Function)
            })
            expect(instanceBrowsers.chrome.checkElement).toHaveBeenCalledTimes(1)
            expect(instanceBrowsers.chrome.checkElement).toHaveBeenCalledWith(instanceElements.chrome, 'purplebox', expect.any(Object))
            expect(instanceBrowsers.firefox.checkElement).toHaveBeenCalledTimes(1)
            expect(instanceBrowsers.firefox.checkElement).toHaveBeenCalledWith(instanceElements.firefox, 'purplebox', expect.any(Object))
        })

        it('waits until the element of each instance matches', async () => {
            vi.useFakeTimers()
            try {
                const { element, instanceBrowsers } = createMultiRemoteElement()
                // chrome matches at the second check, firefox at the third
                instanceBrowsers.chrome.checkElement
                    .mockResolvedValueOnce({ misMatchPercentage: 10, folders })
                instanceBrowsers.firefox.checkElement
                    .mockResolvedValueOnce({ misMatchPercentage: 10, folders })
                    .mockResolvedValueOnce({ misMatchPercentage: 10, folders })

                const promise = toMatchElementSnapshot(element, 'purplebox', 0, { wait: 1000, interval: 100 })
                await vi.advanceTimersByTimeAsync(1000)

                expect((await promise).pass).toBe(true)
                expect(instanceBrowsers.chrome.checkElement).toHaveBeenCalledTimes(3)
                expect(instanceBrowsers.firefox.checkElement).toHaveBeenCalledTimes(3)
            } finally {
                vi.useRealTimers()
            }
        })

        it('fails with the message of each instance that does not match', async () => {
            const { element } = createMultiRemoteElement({ chrome: 0, firefox: 5 })

            const result = await toMatchElementSnapshot(element, 'purplebox', 1, {})

            expect(result.pass).toBe(false)
            expect(result.message()).toContain('Instance "firefox":\nExpected image mismatch percentage to be at most 1%, but was 5%.')
            expect(result.message()).not.toContain('Instance "chrome"')
        })

        it('gives a clear error when the browser of an instance has no checkElement command', async () => {
            const { element, instanceElements } = createMultiRemoteElement()
            instanceElements.firefox.parent = { [WDIO_KIND]: 'browser' }

            await expect(toMatchElementSnapshot(element, 'purplebox')).rejects.toThrow(
                'The visual service did not add the "checkElement" command to this session'
            )
        })
    })

    it('toMatchTabbablePageSnapshot', async () => {
        await expect(toMatchTabbablePageSnapshot(browser, 'foo', 123, {})).resolves.toEqual({
            pass: true,
            message: expect.any(Function)
        })
        expect(browser.checkTabbablePage).toBeCalledTimes(1)
    })

    describe('when the visual service did not add its commands', () => {
        const pageMatchers: Array<[string, typeof toMatchScreenSnapshot | typeof toMatchFullPageSnapshot | typeof toMatchTabbablePageSnapshot, string]> = [
            ['toMatchScreenSnapshot', toMatchScreenSnapshot, 'checkScreen'],
            ['toMatchFullPageSnapshot', toMatchFullPageSnapshot, 'checkFullPageScreen'],
            ['toMatchTabbablePageSnapshot', toMatchTabbablePageSnapshot, 'checkTabbablePage'],
        ]

        it.each(pageMatchers)('%s gives a clear error', async (_, matcher, command) => {
            await expect(matcher({} as any, 'tag')).rejects.toThrow(
                `The visual service did not add the "${command}" command to this session`
            )
        })

        it('accepts a browser that is a function, as a WebdriverIO browser can be', async () => {
            const functionBrowser = Object.assign(() => {}, {
                checkScreen: vi.fn().mockResolvedValue({ misMatchPercentage: 0, folders }),
            })

            await expect(toMatchScreenSnapshot(functionBrowser as any, 'tag')).resolves.toMatchObject({ pass: true })
        })

        it('toMatchElementSnapshot gives a clear error', async () => {
            // The browser of the element has no `checkElement` command
            const element = { [WDIO_KIND]: 'element', parent: { [WDIO_KIND]: 'browser' } } as any as WebdriverIO.Element

            await expect(toMatchElementSnapshot(element, 'tag')).rejects.toThrow(
                'The visual service did not add the "checkElement" command to this session'
            )
        })
    })

    it('should throw an error if tag is missing', async () => {
        // @ts-expect-error test invalid input
        await expect(toMatchScreenSnapshot(browser)).rejects.toThrow(/tag as a string/)
        // @ts-expect-error test invalid input
        await expect(toMatchFullPageSnapshot(browser)).rejects.toThrow(/tag as a string/)
        // @ts-expect-error test invalid input
        await expect(toMatchElementSnapshot(browser as any as WebdriverIO.Element)).rejects.toThrow(/tag as a string/)
        // @ts-expect-error test invalid input
        await expect(toMatchTabbablePageSnapshot(browser)).rejects.toThrow(/tag as a string/)
    })

    it('defaults to 0 if no expected result is given', async () => {
        const result = await toMatchScreenSnapshot(browser, 'foo')
        expect(result.pass).toBe(false)
        expect(result.message()).toMatchSnapshot()
    })

    it('should allow asymmetric matchers', async () => {
        const result = await toMatchScreenSnapshot(browser, 'foo', expect.any(String))
        expect(result.pass).toBe(false)
        expect(result.message()).toMatchSnapshot()
        const result2 = await toMatchScreenSnapshot(browser, 'foo', expect.any(Number))
        expect(result2.pass).toBe(true)
    })

    it('toMatchScreenSnapshot with multiremote', async () => {
        const results = await toMatchScreenSnapshot(multiremoteBrowser, 'foo', 25, {})
        expect(results).toEqual({
            pass: true,
            message: expect.any(Function),
        })
    })

    it('toMatchScreenSnapshot with multiremote - failure', async () => {
        // @ts-expect-error test invalid input
        multiremoteBrowser.checkScreen.mockResolvedValueOnce({
            androidDevice: {
                fileName: 'Gmail-1344x2992-3.png',
                folders: {
                    actual: 'actual/android/Gmail-1344x2992-3.png',
                    baseline: 'baseline/android/Gmail-1344x2992-3.png',
                    diff: 'diff/android/Gmail-1344x2992-3.png'
                },
                misMatchPercentage: 50
            },
            iosDevice: {
                fileName: 'Contacts-1344x2992-3.png',
                folders: {
                    actual: 'actual/ios/Contacts-1344x2992-3.png',
                    baseline: 'baseline/ios/Contacts-1344x2992-3.png',
                    diff: 'diff/ios/Contacts-1344x2992-3.png'
                },
                misMatchPercentage: 26
            },
        })

        const results = await toMatchScreenSnapshot(multiremoteBrowser, 'foo', 25, {})
        expect(results.pass).toBe(false)
        expect(results.message()).toMatchSnapshot()
    })

    describe('saveAboveTolerance threshold passthrough (#1111)', () => {
        it('should pass numeric expectedResult as saveAboveTolerance to checkScreen', async () => {
            await toMatchScreenSnapshot(browser, 'foo', 0.9, {})
            expect(browser.checkScreen).toHaveBeenCalledWith('foo', {
                returnAllCompareData: true,
                saveAboveTolerance: 0.9
            })
        })

        it('should pass numeric expectedResult as saveAboveTolerance to checkFullPageScreen', async () => {
            await toMatchFullPageSnapshot(browser, 'foo', 0.5, {})
            expect(browser.checkFullPageScreen).toHaveBeenCalledWith('foo', {
                returnAllCompareData: true,
                saveAboveTolerance: 0.5
            })
        })

        it('should pass numeric expectedResult as saveAboveTolerance to checkElement', async () => {
            await toMatchElementSnapshot(browser as any as WebdriverIO.Element, 'foo', 1.5, {})
            expect(browser.checkElement).toHaveBeenCalledWith(browser, 'foo', {
                returnAllCompareData: true,
                saveAboveTolerance: 1.5
            })
        })

        it('should pass numeric expectedResult as saveAboveTolerance to checkTabbablePage', async () => {
            await toMatchTabbablePageSnapshot(browser, 'foo', 2.0, {})
            expect(browser.checkTabbablePage).toHaveBeenCalledWith('foo', {
                returnAllCompareData: true,
                saveAboveTolerance: 2.0
            })
        })

        it('should use default saveAboveTolerance of 0 when no threshold is provided', async () => {
            await toMatchScreenSnapshot(browser, 'foo')
            expect(browser.checkScreen).toHaveBeenCalledWith('foo', {
                returnAllCompareData: true,
                saveAboveTolerance: 0
            })
        })

        it('should not override user-provided saveAboveTolerance', async () => {
            await toMatchScreenSnapshot(browser, 'foo', 0.9, { saveAboveTolerance: 0.1 })
            expect(browser.checkScreen).toHaveBeenCalledWith('foo', {
                returnAllCompareData: true,
                saveAboveTolerance: 0.1  // User's explicit value is preserved
            })
        })

        it('should not set saveAboveTolerance for asymmetric matchers', async () => {
            await toMatchScreenSnapshot(browser, 'foo', expect.any(Number))
            expect(browser.checkScreen).toHaveBeenCalledWith('foo', {
                returnAllCompareData: true
                // No saveAboveTolerance - can't convert asymmetric matcher to number
            })
        })

        it('should set saveAboveTolerance to 0 when options object is passed without threshold', async () => {
            // When only options are passed (no expectedResult), threshold defaults to 0
            await toMatchScreenSnapshot(browser, 'foo', { hideScrollBars: true })
            expect(browser.checkScreen).toHaveBeenCalledWith('foo', {
                hideScrollBars: true,
                returnAllCompareData: true,
                saveAboveTolerance: 0
            })
        })
    })

    describe('wait until the image matches (#690)', () => {
        const result = (misMatchPercentage: number) => ({ misMatchPercentage, folders })

        beforeEach(() => {
            vi.useFakeTimers()
        })

        afterEach(() => {
            vi.useRealTimers()
        })

        it('should check once without wait, also when the image does not match', async () => {
            const matched = await toMatchScreenSnapshot(browser, 'foo', 0, {})

            expect(matched.pass).toBe(false)
            expect(browser.checkScreen).toHaveBeenCalledTimes(1)
        })

        it('should check again until the image matches', async () => {
            vi.mocked(browser.checkScreen).mockResolvedValueOnce(result(10)).mockResolvedValueOnce(result(10)).mockResolvedValueOnce(result(0))

            const promise = toMatchScreenSnapshot(browser, 'foo', 0, { wait: 1000, interval: 200 })
            await vi.advanceTimersByTimeAsync(1000)
            const matched = await promise

            expect(matched.pass).toBe(true)
            expect(browser.checkScreen).toHaveBeenCalledTimes(3)
        })

        it('should stop after the wait time and tell how often it checked', async () => {
            const promise = toMatchScreenSnapshot(browser, 'foo', 0, { wait: 300, interval: 100 })
            await vi.advanceTimersByTimeAsync(1000)
            const matched = await promise

            expect(matched.pass).toBe(false)
            // At 0, 100, 200 and 300 ms
            expect(browser.checkScreen).toHaveBeenCalledTimes(4)
            expect(matched.message()).toContain('The visual check ran 4 times in 300 ms (wait: 300 ms).')
        })

        it('should not pass wait and interval to the check command', async () => {
            vi.mocked(browser.checkScreen).mockResolvedValue(result(0))

            await toMatchScreenSnapshot(browser, 'foo', 0, { wait: 1000, interval: 200, hideScrollBars: false })

            expect(vi.mocked(browser.checkScreen).mock.calls[0][1]).toEqual({ hideScrollBars: false, returnAllCompareData: true, saveAboveTolerance: 0 })
        })

        it('should check again until the image does not match with .not', async () => {
            vi.mocked(browser.checkScreen).mockResolvedValueOnce(result(0)).mockResolvedValueOnce(result(5))

            const promise = toMatchScreenSnapshot.call({ isNot: true }, browser, 'foo', 0, { wait: 1000, interval: 100 })
            await vi.advanceTimersByTimeAsync(1000)
            const matched = await promise

            // `expect` inverts the result for `.not`: no match, so `.not` passes
            expect(matched.pass).toBe(false)
            expect(browser.checkScreen).toHaveBeenCalledTimes(2)
        })

        it('should wait for an element', async () => {
            vi.mocked(browser.checkElement).mockResolvedValueOnce(result(10)).mockResolvedValueOnce(result(0))
            // WebdriverIO brands its elements, see `isWdioKind()`
            const element = mock<WebdriverIO.Element>({ [WDIO_KIND]: 'element', parent: browser })

            const promise = toMatchElementSnapshot(element, 'foo', 0, { wait: 1000 })
            await vi.advanceTimersByTimeAsync(1000)

            expect((await promise).pass).toBe(true)
            expect(browser.checkElement).toHaveBeenCalledTimes(2)
        })

        it('should find a stale element again and check it again within the wait time', async () => {
            const element = mock<WebdriverIO.Element>({ [WDIO_KIND]: 'element', parent: browser })
            // An element command of WebdriverIO finds a stale element again and updates its element id
            element.getTagName.mockResolvedValue('div')
            vi.mocked(browser.checkElement)
                .mockRejectedValueOnce(new Error('stale element reference: element is not attached to the page document'))
                .mockResolvedValueOnce(result(0))

            const promise = toMatchElementSnapshot(element, 'foo', 0, { wait: 1000 })
            await vi.advanceTimersByTimeAsync(1000)

            expect((await promise).pass).toBe(true)
            expect(element.getTagName).toHaveBeenCalledTimes(1)
            expect(browser.checkElement).toHaveBeenCalledTimes(2)
        })

        it('should throw the error of a stale element without wait time', async () => {
            const element = mock<WebdriverIO.Element>({ [WDIO_KIND]: 'element', parent: browser })
            vi.mocked(browser.checkElement).mockRejectedValueOnce(new Error('stale element reference: element is not attached to the page document'))

            await expect(toMatchElementSnapshot(element, 'foo', 0, {})).rejects.toThrow('stale element reference')
            expect(element.getTagName).not.toHaveBeenCalled()
        })

        /**
         * Image files in a new folder, like the check command saves them
         */
        function imageFiles() {
            const folder = mkdtempSync(join(tmpdir(), 'visual-matcher-'))
            return { baseline: join(folder, 'baseline.png'), actual: join(folder, 'actual.png'), diff: join(folder, 'diff.png') }
        }

        it('should remove the images of a failed check when a later check matches without saving images', async () => {
            const files = imageFiles()
            vi.mocked(browser.checkScreen)
                .mockImplementationOnce(async () => {
                    writeFileSync(files.actual, 'failed')
                    writeFileSync(files.diff, 'failed')
                    return { misMatchPercentage: 10, folders: files }
                })
                // A matching check does not save the actual image (alwaysSaveActualImage: false) and has no diff
                .mockResolvedValueOnce({ misMatchPercentage: 0, folders: { baseline: files.baseline, actual: files.actual } })

            const promise = toMatchScreenSnapshot(browser, 'foo', 0, { wait: 1000 })
            await vi.advanceTimersByTimeAsync(1000)

            expect((await promise).pass).toBe(true)
            expect(existsSync(files.actual)).toBe(false)
            expect(existsSync(files.diff)).toBe(false)
        })

        it('should keep the actual image that the matching check saved (alwaysSaveActualImage: true)', async () => {
            const files = imageFiles()
            const earlier = new Date(Date.UTC(2020, 0, 1))
            vi.mocked(browser.checkScreen)
                .mockImplementationOnce(async () => {
                    writeFileSync(files.actual, 'failed')
                    writeFileSync(files.diff, 'failed')
                    utimesSync(files.actual, earlier, earlier)
                    return { misMatchPercentage: 10, folders: files }
                })
                .mockImplementationOnce(async () => {
                    writeFileSync(files.actual, 'matched')
                    return { misMatchPercentage: 0, folders: { baseline: files.baseline, actual: files.actual } }
                })

            const promise = toMatchScreenSnapshot(browser, 'foo', 0, { wait: 1000 })
            await vi.advanceTimersByTimeAsync(1000)

            expect((await promise).pass).toBe(true)
            expect(readFileSync(files.actual, 'utf8')).toBe('matched')
            expect(existsSync(files.diff)).toBe(false)
        })

        it('should wait for the full page and tabbable matchers too', async () => {
            vi.mocked(browser.checkFullPageScreen).mockResolvedValueOnce(result(10)).mockResolvedValueOnce(result(0))
            vi.mocked(browser.checkTabbablePage).mockResolvedValueOnce(result(10)).mockResolvedValueOnce(result(0))

            const fullPage = toMatchFullPageSnapshot(browser, 'foo', 0, { wait: 1000 })
            const tabbable = toMatchTabbablePageSnapshot(browser, 'foo', 0, { wait: 1000 })
            await vi.advanceTimersByTimeAsync(1000)

            expect((await fullPage).pass).toBe(true)
            expect((await tabbable).pass).toBe(true)
        })

        it.each([-1, Number.NaN, 'soon'])('should throw for an invalid wait %j', async (wait) => {
            // @ts-expect-error test invalid input
            await expect(toMatchScreenSnapshot(browser, 'foo', 0, { wait })).rejects.toThrow('Expected the option "wait" to be a number of milliseconds of 0 or more')
        })
    })
})
