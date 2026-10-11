// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest'
import getScrollContainerData from './getScrollContainerData.js'
import scrollContainerTo from './scrollContainerTo.js'
import prepareScrollContainer from './prepareScrollContainer.js'
import getVisibleElementViewportRect from './getVisibleElementViewportRect.js'

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
    Object.defineProperty(container, 'offsetHeight', { value: clientHeight + 4, configurable: true })
    Object.defineProperty(container, 'offsetWidth', { value: 1000, configurable: true })
    container.style.borderStyle = 'solid'
    container.style.borderWidth = '2px 3px'
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

    it('getScrollContainerData should use the exact content box when the borders are at a fractional pixel', () => {
        // At DPR 2.625 Chrome draws a 6px border as 5.714px; clientTop (6) and clientHeight (536) are rounded, the
        // bounding box is not: the content box is 85.714px to 621.428px, not 86px to 622px
        const container = createContainer({ clientHeight: 536 })
        container.style.borderWidth = '5.714286px'
        Object.defineProperty(container, 'clientTop', { value: 6, configurable: true })
        Object.defineProperty(container, 'clientLeft', { value: 6, configurable: true })
        Object.defineProperty(container, 'offsetHeight', { value: 547, configurable: true })
        Object.defineProperty(container, 'offsetWidth', { value: 920, configurable: true })
        Object.defineProperty(container, 'clientWidth', { value: 909, configurable: true })
        vi.spyOn(container, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ x: 40, y: 80, width: 920, height: 547.142857 }))

        const data = getScrollContainerData(container)

        expect(data.top).toBeCloseTo(85.714, 3)
        expect(data.top + data.height).toBeCloseTo(621.429, 3)
        expect(data.left).toBeCloseTo(45.714, 3)
        expect(data.width).toBeCloseTo(908.571, 3)
    })

    it('getScrollContainerData should leave out a scrollbar that takes space', () => {
        // A classic scrollbar of 15px on the right and at the bottom
        const container = createContainer({ clientHeight: 725 })
        Object.defineProperty(container, 'offsetHeight', { value: 744, configurable: true })
        Object.defineProperty(container, 'offsetWidth', { value: 1000, configurable: true })
        Object.defineProperty(container, 'clientWidth', { value: 979, configurable: true })

        const data = getScrollContainerData(container)

        expect(data).toEqual(expect.objectContaining({ top: 62, left: 13, height: 725, width: 979 }))
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

    it('prepareScrollContainer should hide and show the scrollbar of the container only', () => {
        const container = createContainer()

        prepareScrollContainer(container, true, { scrollbar: true, snap: true })
        expect(container.hasAttribute('data-wic-scroll-container')).toBe(true)
        expect(document.getElementById('wic-scroll-container-style')?.textContent).toContain('scrollbar-width: none')

        prepareScrollContainer(container, false, { scrollbar: true, snap: true })
        expect(container.hasAttribute('data-wic-scroll-container')).toBe(false)
        expect(document.getElementById('wic-scroll-container-style')).toBeNull()
    })

    it('prepareScrollContainer should not touch the scrollbar when it must stay visible', () => {
        const container = createContainer()

        prepareScrollContainer(container, true, { scrollbar: false, snap: true })

        expect(container.hasAttribute('data-wic-scroll-container')).toBe(false)
        expect(document.getElementById('wic-scroll-container-style')).toBeNull()
    })

    it.each([
        ['no inline value', '', ''],
        ['an inline value', 'y mandatory', ''],
        ['an inline !important value', 'y proximity', 'important'],
    ])('prepareScrollContainer should turn off scroll snap during the screenshots and put back %s', (_name, value, priority) => {
        // With scroll snap, the container does not stop at the scroll position of the next screenshot
        const container = createContainer()
        if (value) {
            container.style.setProperty('scroll-snap-type', value, priority)
        }

        prepareScrollContainer(container, true, { scrollbar: true, snap: true })
        expect(container.style.getPropertyValue('scroll-snap-type')).toBe('none')
        expect(container.style.getPropertyPriority('scroll-snap-type')).toBe('important')

        prepareScrollContainer(container, false, { scrollbar: true, snap: true })
        expect(container.style.getPropertyValue('scroll-snap-type')).toBe(value)
        expect(container.style.getPropertyPriority('scroll-snap-type')).toBe(priority)
        expect(container.hasAttribute('data-wic-scroll-snap-type')).toBe(false)
    })

    it('prepareScrollContainer should put back the scrollbar and scroll snap separately', () => {
        // The scrollbar comes back before the scroll back (it can change the layout), scroll snap after it
        const container = createContainer()
        container.style.setProperty('scroll-snap-type', 'y mandatory')

        prepareScrollContainer(container, true, { scrollbar: true, snap: true })
        prepareScrollContainer(container, false, { scrollbar: true, snap: false })
        expect(container.hasAttribute('data-wic-scroll-container')).toBe(false)
        expect(container.style.getPropertyValue('scroll-snap-type')).toBe('none')

        prepareScrollContainer(container, false, { scrollbar: false, snap: true })
        expect(container.style.getPropertyValue('scroll-snap-type')).toBe('y mandatory')
    })

    describe('getVisibleElementViewportRect', () => {
        /**
         * An element with a bounding box; jsdom does no layout
         */
        function boxed(element: HTMLElement, rect: { x: number, y: number, width: number, height: number }): HTMLElement {
            vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect(rect))
            element.checkVisibility = () => true
            return element
        }

        it('should clip the box to the scroll container, which hides the rest of the element', () => {
            // The container starts at x = 200 (a sidebar on the left); the element goes 150px to the left of it
            const container = boxed(document.createElement('main'), { x: 200, y: 60, width: 800, height: 740 })
            container.style.overflowX = 'auto'
            container.style.overflowY = 'auto'
            const element = boxed(document.createElement('div'), { x: 50, y: 362, width: 950, height: 900 })
            container.appendChild(element)
            document.body.appendChild(container)

            expect(getVisibleElementViewportRect(element)).toEqual({ x: 200, y: 362, width: 800, height: 438 })
        })

        it('should not clip a fixed element to its ancestors', () => {
            const container = boxed(document.createElement('main'), { x: 200, y: 60, width: 800, height: 740 })
            container.style.overflowX = 'auto'
            container.style.overflowY = 'auto'
            const element = boxed(document.createElement('div'), { x: 0, y: 0, width: 1000, height: 50 })
            element.style.position = 'fixed'
            container.appendChild(element)
            document.body.appendChild(container)

            expect(getVisibleElementViewportRect(element)).toEqual({ x: 0, y: 0, width: 1000, height: 50 })
        })

        /**
         * A wrapper that clips its overflow, with the box of the scroll container
         */
        function clipper(position = 'static'): HTMLElement {
            const element = boxed(document.createElement('div'), { x: 200, y: 60, width: 800, height: 740 })
            element.style.overflowX = 'hidden'
            element.style.overflowY = 'hidden'
            element.style.position = position
            return element
        }

        it('should not clip an absolute element to a static wrapper above its containing block', () => {
            // The containing block of the child is the positioned page wrapper, which is above the clipping wrapper
            const page = boxed(document.createElement('div'), { x: 0, y: 0, width: 1000, height: 800 })
            page.style.position = 'relative'
            const wrapper = clipper()
            const element = boxed(document.createElement('div'), { x: 50, y: 10, width: 100, height: 40 })
            element.style.position = 'absolute'
            wrapper.appendChild(element)
            page.appendChild(wrapper)
            document.body.appendChild(page)

            expect(getVisibleElementViewportRect(element)).toEqual({ x: 50, y: 10, width: 100, height: 40 })
        })

        it('should clip an absolute element to a positioned wrapper (its containing block)', () => {
            const wrapper = clipper('relative')
            const element = boxed(document.createElement('div'), { x: 150, y: 70, width: 100, height: 40 })
            element.style.position = 'absolute'
            wrapper.appendChild(element)
            document.body.appendChild(wrapper)

            expect(getVisibleElementViewportRect(element)).toEqual({ x: 200, y: 70, width: 50, height: 40 })
        })

        it('should clip a fixed element to a wrapper with a transform (its containing block)', () => {
            const wrapper = clipper()
            wrapper.style.transform = 'translateX(0px)'
            const element = boxed(document.createElement('div'), { x: 150, y: 70, width: 100, height: 40 })
            element.style.position = 'fixed'
            wrapper.appendChild(element)
            document.body.appendChild(wrapper)

            expect(getVisibleElementViewportRect(element)).toEqual({ x: 200, y: 70, width: 50, height: 40 })
        })

        it('should return null for an element that the scroll container hides completely', () => {
            const container = boxed(document.createElement('main'), { x: 200, y: 60, width: 800, height: 740 })
            container.style.overflowX = 'auto'
            container.style.overflowY = 'auto'
            const element = boxed(document.createElement('div'), { x: 220, y: 900, width: 100, height: 50 })
            container.appendChild(element)
            document.body.appendChild(container)

            expect(getVisibleElementViewportRect(element)).toBeNull()
        })
    })
})
