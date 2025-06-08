// @vitest-environment jsdom

import { describe, it, expect } from 'vitest'
import hideScrollBars from './hideScrollbars.js'

describe('hideScrollBars', () => {
    it('should be able to hide and show the scrollbars', () => {
        expect(document.body.style.overflow).toMatchSnapshot()

        hideScrollBars(true)

        expect(document.body.style.overflow).toMatchSnapshot()

        hideScrollBars(false)

        expect(document.body.style.overflow).toMatchSnapshot()
    })
})
