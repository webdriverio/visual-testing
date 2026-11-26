// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest'
import scrollBackToPosition from './scrollBackToPosition.js'

/**
 * jsdom does no layout, so set the sizes that the browser would report. The scroll position is a plain value,
 * and `scrollBehaviorOnScroll` records the inline `scroll-behavior` of the node at the moment it is scrolled
 */
function setScrollState(node: HTMLElement, { scrollHeight, clientHeight }: { scrollHeight: number, clientHeight: number }) {
    let scrollTop = 0
    const state = { scrollBehaviorOnScroll: '' }
    Object.defineProperty(node, 'scrollHeight', { value: scrollHeight, configurable: true })
    Object.defineProperty(node, 'clientHeight', { value: clientHeight, configurable: true })
    Object.defineProperty(node, 'scrollTop', {
        configurable: true,
        get: () => scrollTop,
        set: (value: number) => {
            state.scrollBehaviorOnScroll = `${node.style.getPropertyValue('scroll-behavior')} ${node.style.getPropertyPriority('scroll-behavior')}`
            scrollTop = value
        },
    })
    return state
}

describe('scrollBackToPosition', () => {
    let html: { scrollBehaviorOnScroll: string }
    let body: { scrollBehaviorOnScroll: string }

    beforeEach(() => {
        document.documentElement.removeAttribute('style')
        document.body.removeAttribute('style')
        html = setScrollState(document.documentElement, { scrollHeight: 500, clientHeight: 500 })
        body = setScrollState(document.body, { scrollHeight: 500, clientHeight: 500 })
    })

    it('should scroll the html node when it scrolls', () => {
        html = setScrollState(document.documentElement, { scrollHeight: 3000, clientHeight: 800 })

        scrollBackToPosition(420)

        expect(document.documentElement.scrollTop).toBe(420)
        expect(document.body.scrollTop).toBe(0)
    })

    it('should scroll the body when only the body scrolls', () => {
        body = setScrollState(document.body, { scrollHeight: 3000, clientHeight: 800 })

        scrollBackToPosition(250)

        expect(document.body.scrollTop).toBe(250)
    })

    it('should scroll the scrolling element when neither html nor body scrolls', () => {
        // In jsdom the scrolling element is the html node
        scrollBackToPosition(30)

        expect(document.documentElement.scrollTop).toBe(30)
    })

    it('should scroll without a smooth scroll animation of the page', () => {
        html = setScrollState(document.documentElement, { scrollHeight: 3000, clientHeight: 800 })
        document.documentElement.style.setProperty('scroll-behavior', 'smooth')

        scrollBackToPosition(420)

        // An inline `!important` value wins over `scroll-behavior: smooth` of the page
        expect(html.scrollBehaviorOnScroll).toBe('auto important')
    })

    it('should put back the inline scroll-behavior of the page after the scroll', () => {
        body = setScrollState(document.body, { scrollHeight: 3000, clientHeight: 800 })
        document.documentElement.style.setProperty('scroll-behavior', 'smooth', 'important')

        scrollBackToPosition(250)

        expect(body.scrollBehaviorOnScroll).toBe('auto important')
        expect(document.documentElement.style.getPropertyValue('scroll-behavior')).toBe('smooth')
        expect(document.documentElement.style.getPropertyPriority('scroll-behavior')).toBe('important')
        expect(document.body.style.getPropertyValue('scroll-behavior')).toBe('')
    })
})
