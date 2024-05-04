/// <reference types="../" />
import { describe, it, vi, expect } from 'vitest'
import {
    toMatchScreenSnapshot, toMatchFullPageSnapshot,
    toMatchElementSnapshot, toMatchTabbablePageSnapshot
} from '../src/matcher.js'

const folders = {
    baseline: 'foo',
    actual: 'bar',
    diff: 'baz'
}
const browser = {
    checkScreen: vi.fn().mockResolvedValue({ misMatchPercentage :113, folders }),
    checkFullPageScreen: vi.fn().mockResolvedValue({ misMatchPercentage :113, folders }),
    checkElement: vi.fn().mockResolvedValue({ misMatchPercentage :113, folders }),
    checkTabbablePage: vi.fn().mockResolvedValue({ misMatchPercentage :113, folders })
} as any as WebdriverIO.Browser

describe('custom visual matcher', () => {
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
})
