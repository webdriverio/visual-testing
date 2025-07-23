import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { injectWebviewOverlay } from './injectWebviewOverlay.js'

describe('injectWebviewOverlay', () => {
    beforeEach(() => {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            pretendToBeVisual: true,
            runScripts: 'dangerously',
        })

        global.window = dom.window as unknown as Window & typeof globalThis
        global.document = dom.window.document

        Object.defineProperty(document.documentElement, 'clientHeight', {
            value: 800,
            configurable: true,
        })
        Object.defineProperty(window, 'innerWidth', {
            value: 400,
            configurable: true,
        })
        Object.defineProperty(window, 'devicePixelRatio', {
            value: 2,
            configurable: true,
        })
    })

    it('should inject an overlay if not already present', () => {
        expect(document.querySelector('[data-test="ics-overlay"]')).toBeNull()

        injectWebviewOverlay(true)

        const overlay = document.querySelector('[data-test="ics-overlay"]') as HTMLElement
        expect(overlay).toBeTruthy()
        expect(overlay?.tagName).toBe('DIV')
        expect(overlay?.style.position).toBe('fixed')
        expect(overlay?.style.height).toContain('800px')
    })

    it('should not inject a second overlay if one already exists', () => {
        injectWebviewOverlay(true)
        injectWebviewOverlay(true)

        const overlays = document.querySelectorAll('[data-test="ics-overlay"]')
        expect(overlays.length).toBe(1)
    })

    it('should store click position and dimensions in dataset on click (Android DPR)', () => {
        injectWebviewOverlay(true)

        const overlay = document.querySelector('[data-test="ics-overlay"]') as HTMLDivElement
        const event = new window.MouseEvent('click', {
            clientX: 50,
            clientY: 100,
            bubbles: true,
        })
        overlay.dispatchEvent(event)

        const parsedData = JSON.parse(overlay.dataset.icsWebviewData!)

        expect(parsedData).toEqual({
            x: 100,
            y: 200,
            width: 800,
            height: 1600,
        })
    })

    it('should use DPR = 1 for iOS (isAndroid = false)', () => {
        injectWebviewOverlay(false)

        const overlay = document.querySelector('[data-test="ics-overlay"]') as HTMLDivElement
        const event = new window.MouseEvent('click', {
            clientX: 50,
            clientY: 100,
            bubbles: true,
        })
        overlay.dispatchEvent(event)

        const parsedData = JSON.parse(overlay.dataset.icsWebviewData!)

        expect(parsedData).toEqual({
            x: 50,
            y: 100,
            width: 400,
            height: 800,
        })
    })
})
