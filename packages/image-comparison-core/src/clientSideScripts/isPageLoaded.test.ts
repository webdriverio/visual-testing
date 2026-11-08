// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { isPageLoaded } from './isPageLoaded.js'

describe('isPageLoaded', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should be true when the page has the url and is loaded', () => {
        vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete')

        expect(isPageLoaded(window.location.href)).toBe(true)
    })

    it('should be false when the browser did not leave the previous page yet', () => {
        vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete')

        expect(isPageLoaded('blob:http://localhost/new-page')).toBe(false)
    })

    it('should be false when the page has the url but is still loading', () => {
        vi.spyOn(document, 'readyState', 'get').mockReturnValue('interactive')

        expect(isPageLoaded(window.location.href)).toBe(false)
    })
})
