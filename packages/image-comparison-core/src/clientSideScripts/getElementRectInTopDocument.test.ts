
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
})
