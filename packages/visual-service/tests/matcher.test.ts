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
})
