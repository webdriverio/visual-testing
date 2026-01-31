import { beforeEach, describe, it, vi, expect } from 'vitest'
import {
    toMatchScreenSnapshot, toMatchFullPageSnapshot,
    toMatchElementSnapshot, toMatchTabbablePageSnapshot
} from '../src/matcher.js'

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
            isMultiremote: true,
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

    it('toMatchTabbablePageSnapshot', async () => {
        await expect(toMatchTabbablePageSnapshot(browser, 'foo', 123, {})).resolves.toEqual({
            pass: true,
            message: expect.any(Function)
        })
        expect(browser.checkTabbablePage).toBeCalledTimes(1)
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
})
