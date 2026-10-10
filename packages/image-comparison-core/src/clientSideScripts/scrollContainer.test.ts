// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest'
import getScrollContainerData from './getScrollContainerData.js'
import scrollContainerTo from './scrollContainerTo.js'
import hideScrollContainerScrollbar from './hideScrollContainerScrollbar.js'

/**
 * jsdom does no layout, so set the sizes and scroll data that the browser would report. The scroll position stops at
 * the end of the content, as in a browser
 */
function createContainer({ scrollHeight = 2000, clientHeight = 740 } = {}) {
    const container = document.createElement('main')
    document.body.appendChild(container)
    let scrollTop = 0
    Object.defineProperty(container, 'scrollHeight', { value: scrollHeight, configurable: true })
    Object.defineProperty(container, 'clientHeight', { value: clientHeight, configurable: true })
    Object.defineProperty(container, 'clientWidth', { value: 980, configurable: true })
    Object.defineProperty(container, 'clientTop', { value: 2, configurable: true })
    Object.defineProperty(container, 'clientLeft', { value: 3, configurable: true })
    Object.defineProperty(container, 'scrollTop', {
        configurable: true,
        get: () => scrollTop,
        set: (value: number) => { scrollTop = Math.max(0, Math.min(value, scrollHeight - clientHeight)) },
    })
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ x: 10, y: 60, width: 1000, height: 744 }))

    return container
}

describe('scroll container client scripts (#125)', () => {
    beforeEach(() => {
        document.head.innerHTML = ''
        document.body.innerHTML = ''
    })

    it('getScrollContainerData should return the visible content box and the scroll data', () => {
        const container = createContainer()
        container.scrollTop = 300

        expect(getScrollContainerData(container)).toEqual(expect.objectContaining({
            top: 62,
            left: 13,
            width: 980,
            height: 740,
            scrollTop: 300,
            scrollHeight: 2000,
        }))
    })

    it('scrollContainerTo should scroll and return the position where the container stops', () => {
        const container = createContainer()

        expect(scrollContainerTo(container, 1000)).toBe(1000)
        expect(scrollContainerTo(container, 5000)).toBe(1260)
    })

    it('scrollContainerTo should scroll without a smooth scroll animation and put back the inline value', () => {
        const container = createContainer()
        container.style.setProperty('scroll-behavior', 'smooth')
        let behaviorDuringScroll = ''
        const descriptor = Object.getOwnPropertyDescriptor(container, 'scrollTop')
        Object.defineProperty(container, 'scrollTop', {
            configurable: true,
            get: descriptor?.get,
            set: (value: number) => {
                behaviorDuringScroll = `${container.style.getPropertyValue('scroll-behavior')} ${container.style.getPropertyPriority('scroll-behavior')}`
                descriptor?.set?.call(container, value)
            },
        })

        scrollContainerTo(container, 100)

        expect(behaviorDuringScroll).toBe('auto important')
        expect(container.style.getPropertyValue('scroll-behavior')).toBe('smooth')
    })

    it('hideScrollContainerScrollbar should hide and show the scrollbar of the container only', () => {
        const container = createContainer()

        hideScrollContainerScrollbar(container, true)
        expect(container.hasAttribute('data-wic-scroll-container')).toBe(true)
        expect(document.getElementById('wic-scroll-container-style')?.textContent).toContain('scrollbar-width: none')

        hideScrollContainerScrollbar(container, false)
        expect(container.hasAttribute('data-wic-scroll-container')).toBe(false)
        expect(document.getElementById('wic-scroll-container-style')).toBeNull()
    })
})
