import { describe, it, vi, expect } from 'vitest'
import {
    toMatchScreenSnapshot, toMatchFullPageSnapshot,
    toMatchElementSnapshot, toMatchTabbablePageSnapshot
} from '../src/matcher.js'

const browser = {
    checkScreen: vi.fn().mockResolvedValue(123),
    checkFullPageScreen: vi.fn().mockResolvedValue(123),
    checkElement: vi.fn().mockResolvedValue(123),
    checkTabbablePage: vi.fn().mockResolvedValue(123)
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
})
