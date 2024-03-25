// @vitest-environment jsdom

import { describe, it, expect } from 'vitest'
import type { CssOptions } from './customCss.interfaces.js'
import setCustomCss from './setCustomCss.js'

describe('setCustomCss', () => {
    it('should be able to set the custom css with the default options', () => {
        const cssOptions: CssOptions = {
            addressBarPadding: 6,
            disableCSSAnimation: false,
            id: 'id',
            toolBarPadding: 6,
        }

        expect(document.head.textContent).toMatchSnapshot()

        setCustomCss(cssOptions)

        expect(document.head.textContent).toMatchSnapshot()
    })

    it('should be able to set the custom css with the animations disabled', () => {
        const cssOptions: CssOptions = {
            addressBarPadding: 6,
            disableCSSAnimation: true,
            id: 'id',
            toolBarPadding: 6,
        }

        expect(document.head.textContent).toMatchSnapshot()

        setCustomCss(cssOptions)

        expect(document.head.textContent).toMatchSnapshot()
    })

    it('should be able to set the custom css with the with padding set to 0', () => {
        const cssOptions: CssOptions = {
            addressBarPadding: 0,
            disableCSSAnimation: true,
            id: 'id',
            toolBarPadding: 0,
        }

        expect(document.head.textContent).toMatchSnapshot()

        setCustomCss(cssOptions)

        expect(document.head.textContent).toMatchSnapshot()
    })

    it('should do nothing if document.head is null', () => {
        const cssOptions: CssOptions = {
            addressBarPadding: 6,
            disableCSSAnimation: false,
            id: 'id',
            toolBarPadding: 6,
        }
        Object.defineProperty(document, 'head', { value: null })

        setCustomCss(cssOptions)

        expect(document.head).toBe(null)
    })
})
