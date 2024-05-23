import type { ImageCompareResult } from 'webdriver-image-comparison'

import { getBrowserObject } from './utils.js'
import type {
    WdioCheckFullPageMethodOptions,
    WdioCheckElementMethodOptions,
    WdioCheckScreenMethodOptions
} from './types.js'

const DEFAULT_EXPECTED_RESULT = 0

const asymmetricMatcher =
    typeof Symbol === 'function' && Symbol.for
        ? Symbol.for('jest.asymmetricMatcher')
        : 0x13_57_a5

function isAsymmetricMatcher (expected: unknown): expected is ExpectWebdriverIO.PartialMatcher {
    return Boolean(expected && typeof expected === 'object' && '$$typeof' in expected && expected.$$typeof === asymmetricMatcher && 'asymmetricMatch' in expected)
}

function compareResult (result: ImageCompareResult, expected: number | ExpectWebdriverIO.PartialMatcher) {
    /**
     * expected value is an asymmetric matcher, e.g.
     *
     * ```ts
     * expect(browser).toMatchScreenSnapshot('foo', expect.closeTo(0, 2))
     * ```
     */
    if (isAsymmetricMatcher(expected)) {
        const pass = expected.asymmetricMatch(result.misMatchPercentage)
        return {
            pass,
            message: () => 'Expected image to match with given asymmetric matcher but did not pass!\n'
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
            pass: result.misMatchPercentage <= expected,
            message: () => (
                `Expected image mismatch percentage to be at most ${expected}%, but was ${result.misMatchPercentage}%.\n` +
                'If this is acceptable, you may need to adjust the threshold or update the baseline image if the changes are intentional.\n' +
                `\nBaseline: ${result.folders.baseline}\n` +
                `Actual Screenshot: ${result.folders.actual}\n` +
                `Difference: ${result.folders.diff}\n` +
                '\nFor guidance on handling visual discrepancies, refer to: https://webdriver.io/docs/api/visual-regression.html'
            )
        }
    }

    throw new Error(`Invalid matcher, expect either a number or an asymmetric matcher, but found ${expected}`)
}

function parseMatcherParams (
    tag: string,
    expectedResult?: number | ExpectWebdriverIO.PartialMatcher,
    options?: WdioCheckFullPageMethodOptions
) {
    /**
     * throw if `tag` is not a string
     */
    if (typeof tag !== 'string') {
        throw new Error(`Expected a snapshot tag as a string but received "${typeof tag}"`)
    }

    /**
     * if `expectedResult` is an object, it is an options object
     * ```ts
     * expect(browser).toMatchScreenSnapshot('foo', { hideAfterFirstScroll: [element] })
     * ```
     */
    if (typeof expectedResult === 'object' && !isAsymmetricMatcher(expectedResult)) {
        options = expectedResult
        expectedResult = DEFAULT_EXPECTED_RESULT
    }

    /**
     * make sure `options` is an object
     */
    if (typeof options !== 'object') {
        options = {}
    }

    /**
     * overwrite `returnAllCompareData` to allow us to provide a better assertion message
     */
    options.returnAllCompareData = true

    return { expectedResult, options }
}

export async function toMatchScreenSnapshot (
    browser: WebdriverIO.Browser,
    tag: string,
    expectedResultOrOptions?: number | ExpectWebdriverIO.PartialMatcher,
    optionsOrUndefined?: WdioCheckScreenMethodOptions
) {
    const { expectedResult, options } = parseMatcherParams(tag, expectedResultOrOptions, optionsOrUndefined)
    const result = await browser.checkScreen(tag, options) as ImageCompareResult
    return compareResult(result, expectedResult || DEFAULT_EXPECTED_RESULT)
}

export async function toMatchFullPageSnapshot (
    browser: WebdriverIO.Browser,
    tag: string,
    expectedResultOrOptions?: number | ExpectWebdriverIO.PartialMatcher,
    optionsOrUndefined?: WdioCheckFullPageMethodOptions
) {
    const { expectedResult, options } = parseMatcherParams(tag, expectedResultOrOptions, optionsOrUndefined)
    const result = await browser.checkFullPageScreen(tag, options) as ImageCompareResult
    return compareResult(result, expectedResult || DEFAULT_EXPECTED_RESULT)
}

export async function toMatchElementSnapshot (
    element: WebdriverIO.Element,
    tag: string,
    expectedResultOrOptions?: number | ExpectWebdriverIO.PartialMatcher,
    optionsOrUndefined?: WdioCheckElementMethodOptions
) {
    const { expectedResult, options } = parseMatcherParams(tag, expectedResultOrOptions, optionsOrUndefined)
    const browser = getBrowserObject(await element)
    const result = await browser.checkElement(await element, tag, options) as ImageCompareResult
    return compareResult(result, expectedResult || DEFAULT_EXPECTED_RESULT)
}

export async function toMatchTabbablePageSnapshot (
    browser: WebdriverIO.Browser,
    tag: string,
    expectedResultOrOptions?: number | ExpectWebdriverIO.PartialMatcher,
    optionsOrUndefined?: WdioCheckFullPageMethodOptions
) {
    const { expectedResult, options } = parseMatcherParams(tag, expectedResultOrOptions, optionsOrUndefined)
    const result = await browser.checkTabbablePage(tag, options) as ImageCompareResult
    return compareResult(result, expectedResult || DEFAULT_EXPECTED_RESULT)
}
