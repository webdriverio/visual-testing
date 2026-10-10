import type { ImageCompareResult } from '@wdio/image-comparison-core'

import { getBrowserObject, isMultiRemoteElement } from './utils.js'
import type {
    WdioCheckFullPageMethodOptions,
    WdioCheckElementMethodOptions,
    WdioCheckScreenMethodOptions,
    WdioMatcherWaitOptions,
} from './types.js'

const DEFAULT_EXPECTED_RESULT = 0
const DEFAULT_WAIT_INTERVAL = 100

/**
 * The context of a matcher: `expect` gives `isNot` for `.not`, the Jasmine adapter gives it too
 */
interface VisualMatcherContext {
    isNot?: boolean
}

/**
 * Is the matcher called with `.not` (a direct call has no context)
 */
function isNegated (context: VisualMatcherContext | void): boolean {
    return typeof context === 'object' && context !== null && context.isNot === true
}
type CompareResult = ReturnType<typeof compareResult>
type CheckResult = ImageCompareResult | Record<string, ImageCompareResult>

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
                '\nFor guidance on handling visual discrepancies, refer to: https://webdriver.io/docs/visual-testing/faq'
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

function compareResult (
    result: ImageCompareResult | Record<string, ImageCompareResult>,
    expected: number | ExpectWebdriverIO.PartialMatcher<number>
) {
    const results = isMultiremoteResult(result)
        ? Object.entries(result).map(([instanceName, instanceResult]) => ({
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
    options?: WdioCheckFullPageMethodOptions & WdioMatcherWaitOptions
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
     * `wait` and `interval` are options of the matcher, not of the check command (#690)
     */
    const { wait = 0, interval = DEFAULT_WAIT_INTERVAL, ...checkOptions } = options
    for (const [name, value] of Object.entries({ wait, interval })) {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
            throw new Error(`Expected the option "${name}" to be a number of milliseconds of 0 or more, but received "${value}"`)
        }
    }
    options = checkOptions

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

    return { expectedResult, options, waitOptions: { wait, interval } }
}

/**
 * Run the visual check until the result is the expected one, for at most `wait` milliseconds: until the image matches,
 * or with `.not` until it does not match. Each attempt is a full check (screenshot and compare), so the files of the
 * last attempt stay (#690)
 */
async function checkUntilExpected (
    check: () => Promise<CheckResult>,
    expectedResult: number | ExpectWebdriverIO.PartialMatcher<number>,
    { wait, interval }: Required<WdioMatcherWaitOptions>,
    isNot = false,
): Promise<CompareResult> {
    const start = Date.now()
    let attempts = 0

    for (;;) {
        attempts++
        const compared = compareResult(await check(), expectedResult)
        const elapsed = Date.now() - start
        if (compared.pass !== isNot || elapsed >= wait) {
            return attempts === 1 ? compared : {
                pass: compared.pass,
                message: () => `${compared.message()}\n\nThe visual check ran ${attempts} times in ${elapsed} ms (wait: ${wait} ms).`,
            }
        }
        await new Promise((resolve) => setTimeout(resolve, Math.min(interval, wait - elapsed)))
    }
}

/**
 * Give a clear error when the service could not add its commands, for example when its setup failed
 */
function assertVisualCommand (browser: unknown, command: string) {
    // A WebdriverIO browser can be an object or a function
    const canHaveCommands = (typeof browser === 'object' && browser !== null) || typeof browser === 'function'
    const visualCommand = canHaveCommands && command in browser ? Reflect.get(browser, command) : undefined
    if (typeof visualCommand !== 'function') {
        throw new Error(`The visual service did not add the "${command}" command to this session. See the earlier error of @wdio/visual-service in the log.`)
    }
}

export async function toMatchScreenSnapshot (
    this: VisualMatcherContext | void,
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
    tag: string,
    expectedResultOrOptions?: number | ExpectWebdriverIO.PartialMatcher<number>,
    optionsOrUndefined?: WdioCheckScreenMethodOptions & WdioMatcherWaitOptions
) {
    const { expectedResult, options, waitOptions } = parseMatcherParams(tag, expectedResultOrOptions, optionsOrUndefined)
    assertVisualCommand(browser, 'checkScreen')
    return checkUntilExpected(
        async () => await browser.checkScreen(tag, options) as ImageCompareResult,
        expectedResult || DEFAULT_EXPECTED_RESULT,
        waitOptions,
        isNegated(this),
    )
}

export async function toMatchFullPageSnapshot (
    this: VisualMatcherContext | void,
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
    tag: string,
    expectedResultOrOptions?: number | ExpectWebdriverIO.PartialMatcher<number>,
    optionsOrUndefined?: WdioCheckFullPageMethodOptions & WdioMatcherWaitOptions
) {
    const { expectedResult, options, waitOptions } = parseMatcherParams(tag, expectedResultOrOptions, optionsOrUndefined)
    assertVisualCommand(browser, 'checkFullPageScreen')
    return checkUntilExpected(
        async () => await browser.checkFullPageScreen(tag, options) as ImageCompareResult,
        expectedResult || DEFAULT_EXPECTED_RESULT,
        waitOptions,
        isNegated(this),
    )
}

export async function toMatchElementSnapshot (
    this: VisualMatcherContext | void,
    element: WebdriverIO.Element,
    tag: string,
    expectedResultOrOptions?: number | ExpectWebdriverIO.PartialMatcher<number>,
    optionsOrUndefined?: WdioCheckElementMethodOptions & WdioMatcherWaitOptions
) {
    const { expectedResult, options, waitOptions } = parseMatcherParams(tag, expectedResultOrOptions, optionsOrUndefined)
    const resolvedElement = await element

    return checkUntilExpected(async () => {
        // A multiremote element has no parent, so compare the element of each instance with the browser of that instance
        if (isMultiRemoteElement(resolvedElement)) {
            const results: Record<string, ImageCompareResult> = {}
            for (const instanceName of resolvedElement.instances) {
                results[instanceName] = await checkElementOfBrowser(resolvedElement.getInstance(instanceName), tag, options)
            }
            return results
        }

        return checkElementOfBrowser(resolvedElement, tag, options)
    }, expectedResult || DEFAULT_EXPECTED_RESULT, waitOptions, isNegated(this))
}

async function checkElementOfBrowser (element: WebdriverIO.Element, tag: string, options: WdioCheckElementMethodOptions) {
    const browser = getBrowserObject(element)
    assertVisualCommand(browser, 'checkElement')
    return await browser.checkElement(element, tag, options) as ImageCompareResult
}

export async function toMatchTabbablePageSnapshot (
    this: VisualMatcherContext | void,
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
    tag: string,
    expectedResultOrOptions?: number | ExpectWebdriverIO.PartialMatcher<number>,
    optionsOrUndefined?: WdioCheckFullPageMethodOptions & WdioMatcherWaitOptions
) {
    const { expectedResult, options, waitOptions } = parseMatcherParams(tag, expectedResultOrOptions, optionsOrUndefined)
    assertVisualCommand(browser, 'checkTabbablePage')
    return checkUntilExpected(
        async () => await browser.checkTabbablePage(tag, options) as ImageCompareResult,
        expectedResult || DEFAULT_EXPECTED_RESULT,
        waitOptions,
        isNegated(this),
    )
}
