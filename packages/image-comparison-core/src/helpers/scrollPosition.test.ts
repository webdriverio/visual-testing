import { join } from 'node:path'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mock } from 'vitest-mock-extended'
import logger from '@wdio/logger'
import { readScrollPosition, restoreScrollPosition, SAFARI_MAX_SCROLL_WAIT_TIME, SAFARI_STABLE_SCROLL_TIME } from './scrollPosition.js'
import getScrollPosition from '../clientSideScripts/getScrollPosition.js'
import scrollBackToPosition from '../clientSideScripts/scrollBackToPosition.js'

vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))
const log = logger('test')

describe('scrollPosition', () => {
    const createBrowser = (execute = vi.fn().mockResolvedValue(420), browserName = 'chrome') => mock<WebdriverIO.Browser>({
        execute,
        capabilities: { browserName },
    })

    afterEach(() => {
        vi.clearAllMocks()
        vi.useRealTimers()
    })

    describe('readScrollPosition', () => {
        it('should return the scroll position of the page', async () => {
            const browserInstance = createBrowser()

            await expect(readScrollPosition(browserInstance)).resolves.toBe(420)
            expect(browserInstance.execute).toHaveBeenCalledWith(getScrollPosition)
        })

        it('should return undefined and warn when the position can not be read', async () => {
            const browserInstance = createBrowser(vi.fn().mockRejectedValue(new Error('no scripts')))

            await expect(readScrollPosition(browserInstance)).resolves.toBeUndefined()
            expect(log.warn).toHaveBeenCalledWith(expect.stringContaining('Could not read the scroll position'))
        })
    })

    describe('restoreScrollPosition', () => {
        it('should scroll back to the position', async () => {
            const browserInstance = createBrowser()

            await restoreScrollPosition(browserInstance, 420)

            expect(browserInstance.execute).toHaveBeenCalledWith(scrollBackToPosition, 420)
        })

        it('should scroll back to the top of the page', async () => {
            const browserInstance = createBrowser()

            await restoreScrollPosition(browserInstance, 0)

            expect(browserInstance.execute).toHaveBeenCalledWith(scrollBackToPosition, 0)
        })

        it('should do nothing when there is no position', async () => {
            const browserInstance = createBrowser()

            await restoreScrollPosition(browserInstance, undefined)

            expect(browserInstance.execute).not.toHaveBeenCalled()
        })

        it('should only warn when the scroll back fails', async () => {
            const browserInstance = createBrowser(vi.fn().mockRejectedValue(new Error('no browser')))

            await expect(restoreScrollPosition(browserInstance, 420)).resolves.toBeUndefined()
            expect(log.warn).toHaveBeenCalledWith(expect.stringContaining('Could not scroll back'))
        })

        describe('in Safari', () => {
            /**
             * Each read of the position takes 20 ms, and returns the next value of `positions` (the last one repeats)
             */
            const createIOSBrowser = (positions: number[], browserName = 'Safari') => {
                vi.useFakeTimers()
                let read = 0
                return createBrowser(vi.fn(async (script: unknown) => {
                    if (script !== getScrollPosition) {
                        return undefined
                    }
                    vi.advanceTimersByTime(20)
                    return positions[Math.min(read++, positions.length - 1)]
                }), browserName)
            }
            const reads = (browserInstance: WebdriverIO.Browser) => vi.mocked(browserInstance.execute).mock.calls
                .filter(([script]) => script === getScrollPosition).length

            it('should wait until the page stays at the position', async () => {
                const browserInstance = createIOSBrowser([420])

                await restoreScrollPosition(browserInstance, 420, true)

                expect(browserInstance.execute).toHaveBeenNthCalledWith(1, scrollBackToPosition, 420)
                // The first read at the position, then reads until 100 ms later
                expect(reads(browserInstance)).toBe(SAFARI_STABLE_SCROLL_TIME / 20 + 1)
            })

            it('should wait again when Safari puts back the old position for a moment', async () => {
                // At the position, then the old position for 2 reads, then at the position again
                const browserInstance = createIOSBrowser([420, 5346, 5346, 420])

                await restoreScrollPosition(browserInstance, 420, true)

                expect(reads(browserInstance)).toBe(3 + SAFARI_STABLE_SCROLL_TIME / 20 + 1)
            })

            it('should stop waiting after the maximum time when the page does not stay at the position', async () => {
                const browserInstance = createIOSBrowser([5346])

                await restoreScrollPosition(browserInstance, 420, true)

                expect(reads(browserInstance)).toBe(SAFARI_MAX_SCROLL_WAIT_TIME / 20)
                expect(log.warn).not.toHaveBeenCalled()
            })

            it('should wait in Safari on macOS, where a screenshot right after the scroll can show the old position', async () => {
                const browserInstance = createIOSBrowser([420], 'Safari')

                await restoreScrollPosition(browserInstance, 420)

                expect(reads(browserInstance)).toBe(SAFARI_STABLE_SCROLL_TIME / 20 + 1)
            })

            it('should wait on iOS also when the browser name is not Safari', async () => {
                const browserInstance = createIOSBrowser([420], 'chrome')

                await restoreScrollPosition(browserInstance, 420, true)

                expect(reads(browserInstance)).toBe(SAFARI_STABLE_SCROLL_TIME / 20 + 1)
            })

            it('should not wait in other browsers', async () => {
                const browserInstance = createIOSBrowser([5346], 'chrome')

                await restoreScrollPosition(browserInstance, 420)

                expect(reads(browserInstance)).toBe(0)
            })
        })
    })
})
