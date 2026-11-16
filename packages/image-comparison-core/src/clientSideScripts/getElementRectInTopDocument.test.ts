
// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach } from 'vitest'
import getElementRectInTopDocument from './getElementRectInTopDocument.js'

describe('getElementRectInTopDocument', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('should return the element coordinates for an element in the top-level document', () => {
        const element = document.createElement('div')

        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 20, y: 30, width: 100, height: 50 })
        )

        expect(getElementRectInTopDocument(element)).toEqual({
            x: 20, y: 30, width: 100, height: 50,
        })
    })

    it('should add the top-level scroll position for document origin', () => {
        const element = document.createElement('div')

        vi.stubGlobal('scrollX', 10)
        vi.stubGlobal('scrollY', 15)

        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 20, y: 30, width: 100, height: 50 })
        )

        expect(getElementRectInTopDocument(element, 'document')).toEqual({
            x: 30, y: 45, width: 100, height: 50,
        })
    })

    it('should not add the top-level scroll position for viewport origin', () => {
        const element = document.createElement('div')

        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 20, y: 30, width: 100, height: 50 })
        )

        expect(getElementRectInTopDocument(element, 'viewport')).toEqual({
            x: 20, y: 30, width: 100, height: 50,
        })
    })

    it('should add the iframe position to the element coordinates', () => {
        const iframe = document.createElement('iframe')
        document.body.appendChild(iframe)

        const childDocument = iframe.contentDocument!
        const childElement = childDocument.createElement('div')
        childDocument.body.appendChild(childElement)

        vi.spyOn(iframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 30, y: 60, width: 400, height: 300 })
        )

        vi.spyOn(childElement, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 40, y: 40, width: 100, height: 50 })
        )

        expect(getElementRectInTopDocument(childElement)).toEqual({
            x: 70, y: 100, width: 100, height: 50,
        })

        iframe.remove()
    })

    it('should return iframe coordinates relative to the top-level viewport without adding scroll', () => {
        const iframe = document.createElement('iframe')
        document.body.appendChild(iframe)

        const childDocument = iframe.contentDocument!
        const childElement = childDocument.createElement('div')
        childDocument.body.appendChild(childElement)

        vi.stubGlobal('scrollX', 10)
        vi.stubGlobal('scrollY', 15)

        vi.spyOn(iframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 30, y: 60, width: 400, height: 300 })
        )

        vi.spyOn(childElement, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 40, y: 40, width: 100, height: 50 })
        )

        expect(getElementRectInTopDocument(childElement, 'viewport')).toEqual({
            x: 70, y: 100, width: 100, height: 50,
        })

        iframe.remove()
    })

    it('should add the positions of nested iframes to the element coordinates', () => {
        const outerIframe = document.createElement('iframe')
        document.body.appendChild(outerIframe)

        const outerDocument = outerIframe.contentDocument!
        const innerIframe = outerDocument.createElement('iframe')
        outerDocument.body.appendChild(innerIframe)

        const innerDocument = innerIframe.contentDocument!
        const childElement = innerDocument.createElement('div')
        innerDocument.body.appendChild(childElement)

        vi.spyOn(outerIframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 30, y: 60, width: 400, height: 300 })
        )

        vi.spyOn(innerIframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 10, y: 20, width: 200, height: 150 })
        )

        vi.spyOn(childElement, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 5, y: 7, width: 100, height: 50 })
        )

        expect(getElementRectInTopDocument(childElement)).toEqual({
            x: 45, y: 87, width: 100, height: 50,
        })

        outerIframe.remove()
    })

    it('should account for iframe borders and padding', () => {
        const iframe = document.createElement('iframe')

        iframe.style.paddingLeft = '10px'
        iframe.style.paddingTop = '15px'

        document.body.appendChild(iframe)

        const childDocument = iframe.contentDocument!
        const childElement = childDocument.createElement('div')
        childDocument.body.appendChild(childElement)

        vi.spyOn(iframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 30, y: 60, width: 400, height: 300 })
        )

        Object.defineProperty(iframe, 'clientLeft', { value: 5 })
        Object.defineProperty(iframe, 'clientTop', { value: 5 })

        vi.spyOn(childElement, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 40, y: 40, width: 100, height: 50 })
        )

        expect(getElementRectInTopDocument(childElement)).toEqual({
            x: 85, y: 120, width: 100, height: 50,
        })

        iframe.remove()
    })

    it('should return null when the parent frame is inaccessible', () => {
        const iframe = document.createElement('iframe')
        document.body.appendChild(iframe)

        const childDocument = iframe.contentDocument!
        const childElement = childDocument.createElement('div')
        childDocument.body.appendChild(childElement)

        const childWindow = childDocument.defaultView!

        Object.defineProperty(childWindow, 'frameElement', {
            configurable: true,
            get: () => null,
        })

        expect(getElementRectInTopDocument(childElement)).toBeNull()

        iframe.remove()
    })

    it('should account for iframe CSS scale transform on element coordinates and dimensions', () => {
        const iframe = document.createElement('iframe')
        iframe.style.transform = 'scale(2)'
        document.body.appendChild(iframe)

        const childDocument = iframe.contentDocument!
        const childElement = childDocument.createElement('div')
        childDocument.body.appendChild(childElement)

        vi.spyOn(iframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 0, y: 0, width: 800, height: 600 })
        )

        vi.spyOn(childElement, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 40, y: 30, width: 100, height: 50 })
        )

        expect(getElementRectInTopDocument(childElement)).toEqual({
            x: 80,
            y: 60,
            width: 200,
            height: 100,
        })

        iframe.remove()
    })

    it('should account for fractional scaling on iframe element coordinates and dimensions', () => {
        const iframe = document.createElement('iframe')
        iframe.style.transform = 'scale(1.5)'
        document.body.appendChild(iframe)

        const childDocument = iframe.contentDocument!
        const childElement = childDocument.createElement('div')
        childDocument.body.appendChild(childElement)

        vi.spyOn(iframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 20, y: 30, width: 600, height: 450 })
        )

        vi.spyOn(childElement, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 40, y: 30, width: 100, height: 50 })
        )

        expect(getElementRectInTopDocument(childElement)).toEqual({
            x: 80,
            y: 75,
            width: 150,
            height: 75,
        })

        iframe.remove()
    })

    it('should account for non-uniform scaling (scaleX !== scaleY)', () => {
        const iframe = document.createElement('iframe')
        iframe.style.transform = 'scale(2, 1.5)'
        document.body.appendChild(iframe)

        const childDocument = iframe.contentDocument!
        const childElement = childDocument.createElement('div')
        childDocument.body.appendChild(childElement)

        vi.spyOn(iframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 10, y: 20, width: 800, height: 450 })
        )

        vi.spyOn(childElement, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 40, y: 30, width: 100, height: 50 })
        )

        expect(getElementRectInTopDocument(childElement)).toEqual({
            x: 90,
            y: 65,
            width: 200,
            height: 75,
        })

        iframe.remove()
    })

    it('should parse computed matrix transform format', () => {
        const iframe = document.createElement('iframe')
        iframe.style.transform = 'matrix(2, 0, 0, 1.5, 0, 0)'
        document.body.appendChild(iframe)

        const childDocument = iframe.contentDocument!
        const childElement = childDocument.createElement('div')
        childDocument.body.appendChild(childElement)

        vi.spyOn(iframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 10, y: 20, width: 800, height: 450 })
        )

        vi.spyOn(childElement, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 40, y: 30, width: 100, height: 50 })
        )

        expect(getElementRectInTopDocument(childElement)).toEqual({
            x: 90,
            y: 65,
            width: 200,
            height: 75,
        })

        iframe.remove()
    })

    it('should parse computed matrix3d transform format', () => {
        const iframe = document.createElement('iframe')
        iframe.style.transform = 'matrix3d(2, 0, 0, 0, 0, 1.5, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
        document.body.appendChild(iframe)

        const childDocument = iframe.contentDocument!
        const childElement = childDocument.createElement('div')
        childDocument.body.appendChild(childElement)

        vi.spyOn(iframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 10, y: 20, width: 800, height: 450 })
        )

        vi.spyOn(childElement, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 40, y: 30, width: 100, height: 50 })
        )

        expect(getElementRectInTopDocument(childElement)).toEqual({
            x: 90,
            y: 65,
            width: 200,
            height: 75,
        })

        iframe.remove()
    })

    it('should account for iframe borders and padding under scaling', () => {
        const iframe = document.createElement('iframe')
        iframe.style.paddingLeft = '10px'
        iframe.style.paddingTop = '15px'
        iframe.style.transform = 'scale(2)'
        document.body.appendChild(iframe)

        const childDocument = iframe.contentDocument!
        const childElement = childDocument.createElement('div')
        childDocument.body.appendChild(childElement)

        vi.spyOn(iframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 30, y: 60, width: 800, height: 600 })
        )

        Object.defineProperty(iframe, 'clientLeft', { value: 5 })
        Object.defineProperty(iframe, 'clientTop', { value: 5 })

        vi.spyOn(childElement, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 40, y: 40, width: 100, height: 50 })
        )

        // x: 30 + (40 + 5 + 10) * 2 = 30 + 110 = 140
        // y: 60 + (40 + 5 + 15) * 2 = 60 + 120 = 180
        // width: 100 * 2 = 200
        // height: 50 * 2 = 100
        expect(getElementRectInTopDocument(childElement)).toEqual({
            x: 140,
            y: 180,
            width: 200,
            height: 100,
        })

        iframe.remove()
    })

    it('should account for cumulative scaling across nested iframes', () => {
        const outerIframe = document.createElement('iframe')
        outerIframe.style.transform = 'scale(2)'
        document.body.appendChild(outerIframe)

        const outerDocument = outerIframe.contentDocument!
        const innerIframe = outerDocument.createElement('iframe')
        innerIframe.style.transform = 'scale(1.5)'
        outerDocument.body.appendChild(innerIframe)

        const innerDocument = innerIframe.contentDocument!
        const childElement = innerDocument.createElement('div')
        innerDocument.body.appendChild(childElement)

        vi.spyOn(outerIframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 30, y: 60, width: 800, height: 600 })
        )

        vi.spyOn(innerIframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 10, y: 20, width: 300, height: 225 })
        )

        vi.spyOn(childElement, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 5, y: 7, width: 100, height: 50 })
        )

        // Inner frame:
        // x_inner = 10 + 5 * 1.5 = 17.5
        // y_inner = 20 + 7 * 1.5 = 30.5
        // width_inner = 100 * 1.5 = 150
        // height_inner = 50 * 1.5 = 75
        // Outer frame:
        // x_outer = 30 + 17.5 * 2 = 65
        // y_outer = 60 + 30.5 * 2 = 121
        // width_outer = 150 * 2 = 300
        // height_outer = 75 * 2 = 150
        expect(getElementRectInTopDocument(childElement)).toEqual({
            x: 65,
            y: 121,
            width: 300,
            height: 150,
        })

        outerIframe.remove()
    })

    it('should flag isClippedByIframe when an element is taller than its iframe', () => {
        const iframe = document.createElement('iframe')
        document.body.appendChild(iframe)

        const childDocument = iframe.contentDocument!
        const childElement = childDocument.createElement('div')
        childDocument.body.appendChild(childElement)

        vi.spyOn(iframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 0, y: 0, width: 400, height: 200 })
        )

        // 400px-tall child in a 200px-tall iframe
        vi.spyOn(childElement, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 400 })
        )

        const rect = getElementRectInTopDocument(childElement)
        expect(rect).not.toBeNull()
        expect(rect?.isClippedByIframe).toBe(true)

        iframe.remove()
    })

    it('should flag isClippedByIframe when an element is scrolled or positioned outside its iframe', () => {
        const iframe = document.createElement('iframe')
        document.body.appendChild(iframe)

        const childDocument = iframe.contentDocument!
        const childElement = childDocument.createElement('div')
        childDocument.body.appendChild(childElement)

        vi.spyOn(iframe, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 0, y: 0, width: 400, height: 200 })
        )

        // Child element is at y = 150, height = 100 (bottom is 250 > 200)
        vi.spyOn(childElement, 'getBoundingClientRect').mockReturnValue(
            DOMRect.fromRect({ x: 0, y: 150, width: 100, height: 100 })
        )

        const rect = getElementRectInTopDocument(childElement)
        expect(rect).not.toBeNull()
        expect(rect?.isClippedByIframe).toBe(true)

        iframe.remove()
    })
})
