// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest'
import getScrollPosition from './getScrollPosition.js'

/**
 * jsdom does no layout, so set the sizes and the scroll position that the browser would report
 */
function setScrollState(node: HTMLElement, { scrollHeight, clientHeight, scrollTop }: { scrollHeight: number, clientHeight: number, scrollTop: number }) {
    Object.defineProperty(node, 'scrollHeight', { value: scrollHeight, configurable: true })
    Object.defineProperty(node, 'clientHeight', { value: clientHeight, configurable: true })
    Object.defineProperty(node, 'scrollTop', { value: scrollTop, configurable: true, writable: true })
}

describe('getScrollPosition', () => {
    beforeEach(() => {
        setScrollState(document.documentElement, { scrollHeight: 500, clientHeight: 500, scrollTop: 0 })
        setScrollState(document.body, { scrollHeight: 500, clientHeight: 500, scrollTop: 0 })
    })

    it('should return the position of the html node when it scrolls', () => {
        setScrollState(document.documentElement, { scrollHeight: 3000, clientHeight: 800, scrollTop: 420 })

        expect(getScrollPosition()).toBe(420)
    })

    it('should return the position of the html node when the body also has a position, like scrollToPosition', () => {
        setScrollState(document.documentElement, { scrollHeight: 3000, clientHeight: 800, scrollTop: 100 })
        setScrollState(document.body, { scrollHeight: 3000, clientHeight: 800, scrollTop: 500 })

        expect(getScrollPosition()).toBe(100)
    })

    it('should return the position of the body when only the body scrolls', () => {
        setScrollState(document.body, { scrollHeight: 3000, clientHeight: 800, scrollTop: 250 })

        expect(getScrollPosition()).toBe(250)
    })

    it('should return the position of the scrolling element when neither html nor body scrolls', () => {
        // In jsdom the scrolling element is the html node
        setScrollState(document.documentElement, { scrollHeight: 500, clientHeight: 500, scrollTop: 30 })

        expect(getScrollPosition()).toBe(30)
    })
})
