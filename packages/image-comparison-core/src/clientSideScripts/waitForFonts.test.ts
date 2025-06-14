// @vitest-environment jsdom

import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import waitForFonts from './waitForFonts.js'

describe('waitForFontsLoaded', () => {
    let originalDocument: Document

    beforeEach(() => {
        originalDocument = { ...document }
    })

    afterEach(() => {
        document = originalDocument
        vi.restoreAllMocks()
    })

    it('should resolve if fonts load within 11 seconds', async () => {
        const mockReady = new Promise<void>((resolve) => {
            setTimeout(resolve, 1000)
        })

        global.document = {
            ...originalDocument,
            fonts: { ready: mockReady } as unknown as FontFaceSet,
        } as Document

        await expect(waitForFonts()).resolves.toBe('All fonts have loaded')
    })

    it('should reject if fonts do not load within 11 seconds', async () => {
        const mockReady = new Promise<void>((_, reject) => {
            setTimeout(reject, 12000)
        })

        global.document = {
            ...originalDocument,
            fonts: { ready: mockReady } as unknown as FontFaceSet,
        } as Document

        vi.useFakeTimers()
        const promise = waitForFonts()

        vi.advanceTimersByTime(11000)

        await expect(promise).rejects.toThrow('Font loading timed out')
        vi.useRealTimers()
    })
})
