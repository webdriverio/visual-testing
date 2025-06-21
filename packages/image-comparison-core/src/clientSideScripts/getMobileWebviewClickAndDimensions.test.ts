import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { getMobileWebviewClickAndDimensions } from './getMobileWebviewClickAndDimensions.js'

describe('getMobileWebviewClickAndDimensions', () => {
    const selector = '[data-test="ics-overlay"]'

    beforeEach(() => {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
        global.document = dom.window.document
        global.window = dom.window as any
    })

    it('should return default values when overlay is not found', () => {
        expect(getMobileWebviewClickAndDimensions(selector)).toEqual({
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        })
    })

    it('should return default values when data attribute is missing', () => {
        const el = document.createElement('div')
        el.setAttribute('data-test', 'ics-overlay')
        document.body.appendChild(el)

        expect(getMobileWebviewClickAndDimensions(selector)).toEqual({
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        })
    })

    it('should return parsed data from data attribute and remove element', () => {
        const el = document.createElement('div')
        el.setAttribute('data-test', 'ics-overlay')
        el.dataset.icsWebviewData = JSON.stringify({ x: 10, y: 20, width: 100, height: 200 })
        document.body.appendChild(el)

        const result = getMobileWebviewClickAndDimensions(selector)

        expect(result).toEqual({ x: 10, y: 20, width: 100, height: 200 })
        expect(document.querySelector(selector)).toBeNull()
    })

    it('should return default values if JSON parsing fails', () => {
        const el = document.createElement('div')
        el.setAttribute('data-test', 'ics-overlay')
        el.dataset.icsWebviewData = '{not:valid:json'
        document.body.appendChild(el)

        const result = getMobileWebviewClickAndDimensions(selector)

        expect(result).toEqual({ x: 0, y: 0, width: 0, height: 0 })
    })
})
