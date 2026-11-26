/**
 * Before @wdio/jasmine-framework 10.0.2, the global `expect` of WebdriverIO has no `extend()` with the Jasmine
 * framework, and the Jasmine adapter only gives Jasmine the WebdriverIO matchers that exist before the `before` hook.
 * For these versions the visual matchers are added to Jasmine as async matchers instead. From 10.0.2 the service uses
 * `expect.extend()`. Remove this file when the service needs @wdio/jasmine-framework 10.0.2 or newer.
 * @see https://github.com/webdriverio/webdriverio/issues/15913
 * @see https://github.com/webdriverio/webdriverio/pull/15947
 */

interface VisualMatcherResult {
    pass: boolean
    message: () => string
}

type VisualMatcher = (actual: any, ...args: any[]) => Promise<VisualMatcherResult>

interface JasmineMatcherResult {
    pass: boolean
    message: string
}

interface JasmineAsyncMatcher {
    compare: (actual: unknown, ...args: unknown[]) => Promise<JasmineMatcherResult>
    negativeCompare?: (actual: unknown, ...args: unknown[]) => Promise<JasmineMatcherResult>
}

export interface JasmineEnv {
    beforeAll: (fn: () => void) => void
    addAsyncMatchers: (matchers: Record<string, () => JasmineAsyncMatcher>) => void
}

/**
 * Get the Jasmine environment when Jasmine is the framework
 */
export function getJasmineEnv(): JasmineEnv | undefined {
    const { jasmine } = globalThis as { jasmine?: { getEnv?: () => JasmineEnv } }
    return typeof jasmine?.getEnv === 'function' ? jasmine.getEnv() : undefined
}

/**
 * Convert the visual matchers (`expect.extend` format) to Jasmine async matchers
 */
export function toJasmineAsyncMatchers(matchers: Record<string, VisualMatcher>): Record<string, () => JasmineAsyncMatcher> {
    return Object.fromEntries(Object.entries(matchers).map(([name, matcher]) => [name, () => ({
        async compare(actual: unknown, ...args: unknown[]) {
            const { pass, message } = await matcher(actual, ...args)
            return { pass, message: message() }
        },
        async negativeCompare(actual: unknown, ...args: unknown[]) {
            const { pass, message } = await matcher(actual, ...args)
            return { pass: !pass, message: message() }
        },
    })]))
}

/**
 * Add the visual matchers to Jasmine
 */
export function addJasmineMatchers(env: JasmineEnv, matchers: Record<string, VisualMatcher>) {
    // Jasmine only accepts matchers in a `beforeAll`, a `beforeEach` or a spec
    env.beforeAll(() => env.addAsyncMatchers(toJasmineAsyncMatchers(matchers)))
}
