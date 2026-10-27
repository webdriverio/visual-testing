// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach } from 'vitest'
import getElementRectInTopDocument from './getElementRectInTopDocument.js'

describe('getElementRectInTopDocument', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should return the viewport and document position in the top-level document, not rounded', () => {
        const element = document.createElement('div')
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 10.5, y: 20.25, width: 100.75, height: 50 })
        )
        vi.spyOn(window, 'scrollX', 'get').mockReturnValue(15)
        vi.spyOn(window, 'scrollY', 'get').mockReturnValue(300)

        expect(getElementRectInTopDocument(element, 'viewport')).toEqual({
            x: 10.5,
            y: 20.25,
            width: 100.75,
            height: 50,
        })
        expect(getElementRectInTopDocument(element, 'document')).toEqual({
            x: 25.5,
            y: 320.25,
            width: 100.75,
            height: 50,
        })
    })

    it('should add the iframe position, border and padding for an element in a frame', () => {
        const iframe = document.createElement('iframe')
        iframe.style.paddingLeft = '8px'
        iframe.style.paddingTop = '12px'
        Object.defineProperty(iframe, 'clientLeft', { value: 2 })
        Object.defineProperty(iframe, 'clientTop', { value: 4 })
        vi.spyOn(iframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 30, y: 60, width: 400, height: 300 })
        )
        document.body.appendChild(iframe)

        const frameWin = {
            frameElement: iframe,
            parent: window,
            top: window,
            scrollX: 999,
            scrollY: 999,
        } as unknown as Window
        const element = {
            getBoundingClientRect: () => DOMRect.fromRect({ x: 40, y: 50, width: 200, height: 100 }),
            ownerDocument: { defaultView: frameWin },
        } as unknown as HTMLElement

        vi.spyOn(window, 'scrollX', 'get').mockReturnValue(10)
        vi.spyOn(window, 'scrollY', 'get').mockReturnValue(200)

        // viewport: x = 40 + 30 + 2 + 8 = 80, y = 50 + 60 + 4 + 12 = 126
        expect(getElementRectInTopDocument(element, 'viewport')).toEqual({
            x: 80,
            y: 126,
            width: 200,
            height: 100,
        })
        // document: adds top-level scroll (10, 200), not the frame scroll (999)
        expect(getElementRectInTopDocument(element, 'document')).toEqual({
            x: 90,
            y: 326,
            width: 200,
            height: 100,
        })

        document.body.removeChild(iframe)
    })

    it('should accumulate offsets across nested frames', () => {
        const outerIframe = document.createElement('iframe')
        outerIframe.style.paddingLeft = '5px'
        outerIframe.style.paddingTop = '6px'
        Object.defineProperty(outerIframe, 'clientLeft', { value: 1 })
        Object.defineProperty(outerIframe, 'clientTop', { value: 2 })
        vi.spyOn(outerIframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 10, y: 20, width: 500, height: 400 })
        )

        const innerIframe = document.createElement('iframe')
        innerIframe.style.paddingLeft = '3px'
        innerIframe.style.paddingTop = '4px'
        Object.defineProperty(innerIframe, 'clientLeft', { value: 2 })
        Object.defineProperty(innerIframe, 'clientTop', { value: 3 })
        vi.spyOn(innerIframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 15, y: 25, width: 300, height: 200 })
        )

        const outerWin = {
            frameElement: outerIframe,
            parent: window,
            top: window,
            getComputedStyle: (el: Element) => window.getComputedStyle(el),
        } as unknown as Window
        const innerWin = {
            frameElement: innerIframe,
            parent: outerWin,
            top: window,
        } as unknown as Window
        const element = {
            getBoundingClientRect: () => DOMRect.fromRect({ x: 7, y: 8, width: 50, height: 60 }),
            ownerDocument: { defaultView: innerWin },
        } as unknown as HTMLElement

        vi.spyOn(window, 'scrollX', 'get').mockReturnValue(0)
        vi.spyOn(window, 'scrollY', 'get').mockReturnValue(100)

        // x = 7 + (15 + 2 + 3) + (10 + 1 + 5) = 43
        // y = 8 + (25 + 3 + 4) + (20 + 2 + 6) = 68 (+ 100 scrollY = 168)
        expect(getElementRectInTopDocument(element, 'viewport')).toEqual({
            x: 43,
            y: 68,
            width: 50,
            height: 60,
        })
        expect(getElementRectInTopDocument(element, 'document')).toEqual({
            x: 43,
            y: 168,
            width: 50,
            height: 60,
        })
    })

    it('should return null when an ancestor frame is cross-origin (frameElement is null)', () => {
        const crossOriginWin = {
            frameElement: null,
            parent: window,
            top: window,
        } as unknown as Window
        const element = {
            getBoundingClientRect: () => DOMRect.fromRect({ x: 10, y: 20, width: 100, height: 50 }),
            ownerDocument: { defaultView: crossOriginWin },
        } as unknown as HTMLElement

        expect(getElementRectInTopDocument(element, 'document')).toBeNull()
        expect(getElementRectInTopDocument(element, 'viewport')).toBeNull()
    })

    it('should return null when accessing frameElement throws a SecurityError', () => {
        const crossOriginWin = {
            get frameElement(): Element | null {
                throw new Error('SecurityError')
            },
            parent: window,
            top: window,
        } as unknown as Window
        const element = {
            getBoundingClientRect: () => DOMRect.fromRect({ x: 10, y: 20, width: 100, height: 50 }),
            ownerDocument: { defaultView: crossOriginWin },
        } as unknown as HTMLElement

        expect(getElementRectInTopDocument(element, 'document')).toBeNull()
    })

    it('should scale child offsets, borders, padding, and dimensions when an ancestor frame is scaled', () => {
        const iframe = document.createElement('iframe')
        iframe.style.paddingLeft = '8px'
        iframe.style.paddingTop = '12px'
        iframe.style.transform = 'scale(0.5)'
        Object.defineProperty(iframe, 'clientLeft', { value: 2 })
        Object.defineProperty(iframe, 'clientTop', { value: 4 })
        Object.defineProperty(iframe, 'offsetWidth', { value: 400 })
        Object.defineProperty(iframe, 'offsetHeight', { value: 300 })
        vi.spyOn(iframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 30, y: 60, width: 200, height: 150 })
        )
        document.body.appendChild(iframe)

        const frameWin = {
            frameElement: iframe,
            parent: window,
            top: window,
        } as unknown as Window
        const element = {
            getBoundingClientRect: () => DOMRect.fromRect({ x: 40, y: 50, width: 200, height: 100 }),
            ownerDocument: { defaultView: frameWin },
        } as unknown as HTMLElement

        vi.spyOn(window, 'scrollX', 'get').mockReturnValue(10)
        vi.spyOn(window, 'scrollY', 'get').mockReturnValue(200)

        // scaleX = 200 / 400 = 0.5, scaleY = 150 / 300 = 0.5
        // viewport: x = 30 + (2 + 8 + 40) * 0.5 = 55, y = 60 + (4 + 12 + 50) * 0.5 = 93
        // width = 200 * 0.5 = 100, height = 100 * 0.5 = 50
        expect(getElementRectInTopDocument(element, 'viewport')).toEqual({
            x: 55,
            y: 93,
            width: 100,
            height: 50,
        })
        expect(getElementRectInTopDocument(element, 'document')).toEqual({
            x: 65,
            y: 293,
            width: 100,
            height: 50,
        })

        document.body.removeChild(iframe)
    })

    it('should not distort child size when an unscaled frame has fractional dimensions and rounded offsetWidth', () => {
        const iframe = document.createElement('iframe')
        iframe.style.width = '399.75px'
        iframe.style.height = '299.5px'
        Object.defineProperty(iframe, 'offsetWidth', { value: 400 })
        Object.defineProperty(iframe, 'offsetHeight', { value: 300 })
        vi.spyOn(iframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 10, y: 20, width: 399.75, height: 299.5 })
        )
        document.body.appendChild(iframe)

        const frameWin = {
            frameElement: iframe,
            parent: window,
            top: window,
        } as unknown as Window
        const element = {
            getBoundingClientRect: () => DOMRect.fromRect({ x: 40, y: 50, width: 200, height: 100 }),
            ownerDocument: { defaultView: frameWin },
        } as unknown as HTMLElement

        expect(getElementRectInTopDocument(element, 'viewport')).toEqual({
            x: 50,
            y: 70,
            width: 200,
            height: 100,
        })

        document.body.removeChild(iframe)
    })
})
