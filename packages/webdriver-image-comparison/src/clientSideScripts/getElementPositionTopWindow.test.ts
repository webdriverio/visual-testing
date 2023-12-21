// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest'
import getElementPositionTopWindow from './getElementPositionTopWindow.js'

describe('getElementPositionTopWindow', () => {
    it('should the the element position to the top of the window', () => {
        Element.prototype.getBoundingClientRect = vi.fn(() => {
            return {
                width: 120,
                height: 120,
                top: 10,
                left: 100,
                bottom: 5,
                right: 12,
            }
        }) as any
        document.body.innerHTML = '<div>' + '  <span id="username">Hello</span>' + '</div>'

        expect(getElementPositionTopWindow(document.querySelector('#username')!)).toMatchSnapshot()
    })
})
