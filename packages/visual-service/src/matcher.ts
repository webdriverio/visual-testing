import type { ImageCompareResult } from '@wdio/image-comparison-core'

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

function isAsymmetricMatcher (expected: unknown): expected is ExpectWebdriverIO.PartialMatcher<number> {
    return Boolean(expected && typeof expected === 'object' && '$$typeof' in expected && expected.$$typeof === asymmetricMatcher && 'asymmetricMatch' in expected)
}
function evaluateResult(
    result: ImageCompareResult,
    expected: number | ExpectWebdriverIO.PartialMatcher<number>,
    instanceName: string
) {
    if (isAsymmetricMatcher(expected)) {
        const pass = expected.asymmetricMatch(result.misMatchPercentage)
        const message = `${instanceName !== 'default' ? `Instance "${instanceName}": ` : ''}Expected image to match with the given asymmetric matcher but did not pass!`

        return {
            pass,
            message: () => message,
        }
    }

    if (typeof expected === 'number') {
        const pass = result.misMatchPercentage <= expected
        return {
            pass,
            message: () =>
                (instanceName !== 'default' ? `Instance "${instanceName}":\n` : '') +
                `Expected image mismatch percentage to be at most ${expected}%, but was ${result.misMatchPercentage}%.\n` +
                'If this is acceptable, you may need to adjust the threshold or update the baseline image if the changes are intentional.\n' +
                `\nBaseline: ${result.folders.baseline}\n` +
                `Actual Screenshot: ${result.folders.actual}\n` +
                `Difference: ${result.folders.diff}\n` +
                '\nFor guidance on handling visual discrepancies, refer to: https://webdriver.io/docs/api/visual-regression.html'
        }
    }

    throw new Error(
        `Invalid matcher for instance "${instanceName}", expect either a number or an asymmetric matcher, but found ${expected}`
    )
}

function isMultiremoteResult(
    result: ImageCompareResult | Record<string, ImageCompareResult>
): result is Record<string, ImageCompareResult> {
    return typeof result === 'object' && Object.values(result)[0]?.misMatchPercentage !== undefined
}

function compareResult (result: ImageCompareResult, expected: number | ExpectWebdriverIO.PartialMatcher<number>) {
    const isMultiremote = isMultiremoteResult(result)
    const results = isMultiremote
        ? Object.entries(result as unknown as Record<string, ImageCompareResult>).map(([instanceName, instanceResult]) => ({
            instanceName,
            result: instanceResult,
        }))
        : [{ instanceName: 'default', result }]

    const failureMessages: string[] = []
    let overallPass = true

    for (const { instanceName, result: instanceResult } of results) {
        const { pass, message } = evaluateResult(instanceResult, expected, instanceName)
        if (!pass) {
            overallPass = false
            failureMessages.push(message())
        }
    }

    return {
        pass: overallPass,
        message: () => failureMessages.join('\n\n') || 'All instances passed the visual comparison test.',
    }
}

function parseMatcherParams (
    tag: string,
    expectedResult?: number | ExpectWebdriverIO.PartialMatcher<number>,
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

    /**
     * Pass the expected threshold to the core as `saveAboveTolerance` so it knows
     * when to save actual images (only when mismatch exceeds the threshold).
     * This ensures that when `alwaysSaveActualImage: false`, images are not saved
     * if the comparison passes within the user's acceptable threshold.
     * Only set if user hasn't explicitly set saveAboveTolerance.
     * For numeric thresholds, use that value; otherwise default to 0 (same as comparison default).
     * @see https://github.com/webdriverio/visual-testing/issues/1111
     */
    if (options.saveAboveTolerance === undefined) {
        // Only set saveAboveTolerance for numeric thresholds (including undefined which defaults to 0)
        // Asymmetric matchers can't be converted to a numeric tolerance
        if (typeof expectedResult === 'number') {
            options.saveAboveTolerance = expectedResult
        } else if (expectedResult === undefined) {
            options.saveAboveTolerance = DEFAULT_EXPECTED_RESULT
        }
    }

    return { expectedResult, options }
}

export async function toMatchScreenSnapshot (
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
    tag: string,
    expectedResultOrOptions?: number | ExpectWebdriverIO.PartialMatcher<number>,
    optionsOrUndefined?: WdioCheckScreenMethodOptions
) {
    const { expectedResult, options } = parseMatcherParams(tag, expectedResultOrOptions, optionsOrUndefined)
    const result = await browser.checkScreen(tag, options) as ImageCompareResult
    return compareResult(result, expectedResult || DEFAULT_EXPECTED_RESULT)
}

export async function toMatchFullPageSnapshot (
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
    tag: string,
    expectedResultOrOptions?: number | ExpectWebdriverIO.PartialMatcher<number>,
    optionsOrUndefined?: WdioCheckFullPageMethodOptions
) {
    const { expectedResult, options } = parseMatcherParams(tag, expectedResultOrOptions, optionsOrUndefined)
    const result = await browser.checkFullPageScreen(tag, options) as ImageCompareResult
    return compareResult(result, expectedResult || DEFAULT_EXPECTED_RESULT)
}

export async function toMatchElementSnapshot (
    element: WebdriverIO.Element,
    tag: string,
    expectedResultOrOptions?: number | ExpectWebdriverIO.PartialMatcher<number>,
    optionsOrUndefined?: WdioCheckElementMethodOptions
) {
    const { expectedResult, options } = parseMatcherParams(tag, expectedResultOrOptions, optionsOrUndefined)
    const browser = getBrowserObject(await element)
    const result = await browser.checkElement(await element, tag, options) as ImageCompareResult
    return compareResult(result, expectedResult || DEFAULT_EXPECTED_RESULT)
}

export async function toMatchTabbablePageSnapshot (
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
    tag: string,
    expectedResultOrOptions?: number | ExpectWebdriverIO.PartialMatcher<number>,
    optionsOrUndefined?: WdioCheckFullPageMethodOptions
) {
    const { expectedResult, options } = parseMatcherParams(tag, expectedResultOrOptions, optionsOrUndefined)
    const result = await browser.checkTabbablePage(tag, options) as ImageCompareResult
    return compareResult(result, expectedResult || DEFAULT_EXPECTED_RESULT)
}
