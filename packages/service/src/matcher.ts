import { getBrowserObject } from './utils.js'

import type {
    Result,
    WdioCheckFullPageMethodOptions,
    WdioCheckElementMethodOptions,
    WdioCheckScreenMethodOptions
} from './types.js'

const asymmetricMatcher =
    typeof Symbol === 'function' && Symbol.for
        ? Symbol.for('jest.asymmetricMatcher')
        : 0x13_57_a5

function compareResult (actual: Result, expected: number | ExpectWebdriverIO.PartialMatcher) {
    /**
     * expected value is an asymmetric matcher, e.g.
     *
     * ```ts
     * expect(browser).toMatchScreenSnapshot('foo', expect.closeTo(0, 2))
     * ```
     */
    if (typeof expected === 'object' && '$$typeof' in expected && expected.$$typeof === asymmetricMatcher && expected.asymmetricMatch) {
        const pass = expected.asymmetricMatch(actual)
        return {
            pass,
            message: () => expected.sample
        }
    }

    /**
     * expected value is a number
     *
     * ```ts
     * expect(browser).toMatchScreenSnapshot('foo', 0)
     * ```
     */
    if (typeof expected === 'number') {
        return {
            pass: actual === expected,
            message: () => `Expected image to have a mismatch percentage of ${expected}%, but was ${actual}%`
        }
    }

    throw new Error(`Invalid matcher, expect either a number or an asymmetric matcher, but found ${expected}`)
}

export async function toMatchScreenSnapshot (
    browser: WebdriverIO.Browser,
    tag: string,
    expectedResult: number | ExpectWebdriverIO.PartialMatcher,
    options: WdioCheckScreenMethodOptions
) {
    const result = await browser.checkScreen(tag, options)
    return compareResult(result, expectedResult)
}

export async function toMatchFullPageSnapshot (
    browser: WebdriverIO.Browser,
    tag: string,
    expectedResult: number | ExpectWebdriverIO.PartialMatcher,
    options: WdioCheckFullPageMethodOptions
) {
    const result = await browser.checkFullPageScreen(tag, options)
    return compareResult(result, expectedResult)
}

export async function toMatchElementSnapshot (
    element: WebdriverIO.Element,
    tag: string,
    expectedResult: number | ExpectWebdriverIO.PartialMatcher,
    options: WdioCheckElementMethodOptions
) {
    const browser = getBrowserObject(await element)
    const result = await browser.checkElement(await element, tag, options)
    return compareResult(result, expectedResult)
}

export async function toMatchTabbablePageSnapshot (
    browser: WebdriverIO.Browser,
    tag: string,
    expectedResult: number | ExpectWebdriverIO.PartialMatcher,
    options: WdioCheckFullPageMethodOptions
) {
    const result = await browser.checkTabbablePage(tag, options)
    return compareResult(result, expectedResult)
}
