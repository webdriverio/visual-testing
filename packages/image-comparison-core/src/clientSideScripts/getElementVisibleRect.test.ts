// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest'
import getElementVisibleRect from './getElementVisibleRect.js'

function elementWithRect(rect: { top: number, left: number, bottom: number, right: number }): HTMLElement {
    const element = document.createElement('div')
    Object.defineProperty(element, 'getBoundingClientRect', {
        value: () => ({ ...rect, x: rect.left, y: rect.top, width: rect.right - rect.left, height: rect.bottom - rect.top, toJSON: () => {} }),
    })

    return element
}

describe('getElementVisibleRect', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'innerHeight', { value: 714, configurable: true })
        Object.defineProperty(window, 'innerWidth', { value: 402, configurable: true })
    })

    it('should return the whole element when it is fully inside the viewport', () => {
        expect(getElementVisibleRect(elementWithRect({ top: 10, left: 0, bottom: 700, right: 402 })))
            .toEqual({ isFullyVisible: true, isInFrame: false, x: 0, y: 10, width: 402, height: 690 })
    })

    it('should allow a rounding margin of 1 pixel', () => {
        expect(getElementVisibleRect(elementWithRect({ top: -0.5, left: 0, bottom: 714.6, right: 402.4 })).isFullyVisible).toBe(true)
    })

    it('should return the visible part of an element that is taller than the viewport', () => {
        expect(getElementVisibleRect(elementWithRect({ top: 0, left: 0, bottom: 2000, right: 402 })))
            .toEqual({ isFullyVisible: false, isInFrame: false, x: 0, y: 0, width: 402, height: 714 })
    })

    it('should return the visible part of an element that starts above the viewport', () => {
        expect(getElementVisibleRect(elementWithRect({ top: -500, left: 0, bottom: 200, right: 402 })))
            .toEqual({ isFullyVisible: false, isInFrame: false, x: 0, y: 0, width: 402, height: 200 })
    })

    it('should return the visible part of an element that is wider than the viewport', () => {
        expect(getElementVisibleRect(elementWithRect({ top: 0, left: -100, bottom: 100, right: 800 })))
            .toEqual({ isFullyVisible: false, isInFrame: false, x: 0, y: 0, width: 402, height: 100 })
    })

    it('should tell that the element is not in a frame in the top window', () => {
        expect(getElementVisibleRect(elementWithRect({ top: 0, left: 0, bottom: 100, right: 100 })).isInFrame).toBe(false)
    })

    it('should return a zero size for an element outside the viewport', () => {
        expect(getElementVisibleRect(elementWithRect({ top: 900, left: 0, bottom: 1000, right: 402 })))
            .toEqual({ isFullyVisible: false, isInFrame: false, x: 0, y: 900, width: 402, height: 0 })
    })
})
