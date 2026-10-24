import { afterEach, describe, expect, it, vi } from 'vitest'
import { addJasmineMatchers, getJasmineEnv, toJasmineAsyncMatchers } from '../src/jasmine.js'

const createJasmineEnv = () => ({
    beforeAll: vi.fn(),
    addAsyncMatchers: vi.fn(),
})

describe('jasmine', () => {
    afterEach(() => {
        delete (globalThis as { jasmine?: unknown }).jasmine
    })

    describe('getJasmineEnv', () => {
        it('should return undefined when Jasmine is not the framework', () => {
            expect(getJasmineEnv()).toBeUndefined()
        })

        it('should return the Jasmine environment', () => {
            const env = createJasmineEnv()
            ;(globalThis as { jasmine?: unknown }).jasmine = { getEnv: () => env }

            expect(getJasmineEnv()).toBe(env)
        })
    })

    describe('toJasmineAsyncMatchers', () => {
        const browser = { checkScreen: vi.fn() }

        it('should pass all the arguments to the visual matcher', async () => {
            const matcher = vi.fn().mockResolvedValue({ pass: true, message: () => 'passed' })
            const { toMatchScreenSnapshot } = toJasmineAsyncMatchers({ toMatchScreenSnapshot: matcher })

            await toMatchScreenSnapshot().compare(browser, 'tag', 5, { hideScrollBars: true })

            expect(matcher).toHaveBeenCalledWith(browser, 'tag', 5, { hideScrollBars: true })
        })

        it('should return the Jasmine result of a visual matcher', async () => {
            const matcher = vi.fn()
                .mockResolvedValueOnce({ pass: true, message: () => 'passed' })
                .mockResolvedValueOnce({ pass: false, message: () => 'Expected image mismatch percentage to be at most 0%, but was 5.47%.' })
            const { toMatchScreenSnapshot } = toJasmineAsyncMatchers({ toMatchScreenSnapshot: matcher })

            expect(await toMatchScreenSnapshot().compare(browser, 'tag')).toEqual({ pass: true, message: 'passed' })
            expect(await toMatchScreenSnapshot().compare(browser, 'tag')).toEqual({
                pass: false,
                message: 'Expected image mismatch percentage to be at most 0%, but was 5.47%.',
            })
        })

        it('should invert the result for `.not`', async () => {
            const matcher = vi.fn()
                .mockResolvedValueOnce({ pass: true, message: () => 'All instances passed the visual comparison test.' })
                .mockResolvedValueOnce({ pass: false, message: () => 'mismatch' })
            const { toMatchScreenSnapshot } = toJasmineAsyncMatchers({ toMatchScreenSnapshot: matcher })

            expect(await toMatchScreenSnapshot().negativeCompare!(browser, 'tag')).toEqual({
                pass: false,
                message: 'All instances passed the visual comparison test.',
            })
            expect(await toMatchScreenSnapshot().negativeCompare!(browser, 'tag')).toEqual({ pass: true, message: 'mismatch' })
        })

        it('should tell the visual matcher if it is called with `.not`, so `wait` waits for the right result (#690)', async () => {
            const matcher = vi.fn().mockResolvedValue({ pass: true, message: () => 'passed' })
            const { toMatchScreenSnapshot } = toJasmineAsyncMatchers({ toMatchScreenSnapshot: matcher })

            await toMatchScreenSnapshot().compare(browser, 'tag')
            await toMatchScreenSnapshot().negativeCompare!(browser, 'tag')

            expect(matcher.mock.contexts).toEqual([{ isNot: false }, { isNot: true }])
        })

        it('should make one Jasmine matcher for each visual matcher', () => {
            const matcher = vi.fn()

            expect(Object.keys(toJasmineAsyncMatchers({ toMatchScreenSnapshot: matcher, toMatchElementSnapshot: matcher })))
                .toEqual(['toMatchScreenSnapshot', 'toMatchElementSnapshot'])
        })
    })

    describe('addJasmineMatchers', () => {
        it('should add the matchers in a Jasmine `beforeAll`', () => {
            const env = createJasmineEnv()
            const matcher = vi.fn()

            addJasmineMatchers(env, { toMatchScreenSnapshot: matcher })

            // Jasmine only accepts matchers in a `beforeAll`, a `beforeEach` or a spec
            expect(env.addAsyncMatchers).not.toHaveBeenCalled()
            expect(env.beforeAll).toHaveBeenCalledTimes(1)

            env.beforeAll.mock.calls[0][0]()

            expect(env.addAsyncMatchers).toHaveBeenCalledTimes(1)
            expect(Object.keys(env.addAsyncMatchers.mock.calls[0][0])).toEqual(['toMatchScreenSnapshot'])
        })
    })
})
