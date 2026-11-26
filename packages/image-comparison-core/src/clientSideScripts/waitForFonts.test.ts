// @vitest-environment jsdom

import { describe, it, expect, afterEach, vi } from 'vitest'
import waitForFonts from './waitForFonts.js'

describe('waitForFontsLoaded', () => {
    // jsdom has no `document.fonts`, and `document` itself cannot be replaced, so only `fonts` is defined
    function setFontsReady(ready: Promise<void>) {
        Object.defineProperty(document, 'fonts', { value: { ready }, configurable: true })
    }

    afterEach(() => {
        Reflect.deleteProperty(document, 'fonts')
        vi.restoreAllMocks()
    })

    it('should resolve if fonts load within 11 seconds', async () => {
        const mockReady = new Promise<void>((resolve) => {
            setTimeout(resolve, 1000)
        })

        setFontsReady(mockReady)

        await expect(waitForFonts()).resolves.toBe('All fonts have loaded')
    })

    it('should reject if fonts do not load within 11 seconds', async () => {
        const mockReady = new Promise<void>((_, reject) => {
            setTimeout(reject, 12000)
        })

        setFontsReady(mockReady)

        vi.useFakeTimers()
        const promise = waitForFonts()

        vi.advanceTimersByTime(11000)

        await expect(promise).rejects.toThrow('Font loading timed out')
        vi.useRealTimers()
    })
})
