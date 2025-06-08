// @vitest-environment jsdom

import { describe, it, expect } from 'vitest'
import getDocumentScrollHeight from './getDocumentScrollHeight.js'
import { CONFIGURABLE } from '../mocks/mocks.js'

describe('getDocumentScrollHeight', () => {
    it('should return the bodyScrollHeight', () => {
        // For viewPortHeight
        Object.defineProperty(document.documentElement, 'clientHeight', { value: 500, ...CONFIGURABLE })
        Object.defineProperty(window, 'innerHeight', { value: 500, ...CONFIGURABLE })
        // For scrollHeight
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 500, ...CONFIGURABLE })
        // For bodyScrollHeight
        Object.defineProperty(document.body, 'scrollHeight', { value: 1500, ...CONFIGURABLE })

        expect(getDocumentScrollHeight()).toEqual(1500)
    })

    it('should return the scrollHeight', () => {
        // For viewPortHeight
        Object.defineProperty(document.documentElement, 'clientHeight', { value: 500, ...CONFIGURABLE })
        Object.defineProperty(window, 'innerHeight', { value: 500, ...CONFIGURABLE })
        // For scrollHeight
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2250, ...CONFIGURABLE })
        // For bodyScrollHeight
        Object.defineProperty(document.body, 'scrollHeight', { value: 1500, ...CONFIGURABLE })

        expect(getDocumentScrollHeight()).toEqual(2250)
    })

    it('should return the height of the largest node', () => {
        // For viewPortHeight
        Object.defineProperty(document.documentElement, 'clientHeight', { value: 1500, ...CONFIGURABLE })
        Object.defineProperty(window, 'innerHeight', { value: 1500, ...CONFIGURABLE })
        // For scrollHeight
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1500, ...CONFIGURABLE })
        // For bodyScrollHeight
        Object.defineProperty(document.body, 'scrollHeight', { value: 1500, ...CONFIGURABLE })
        document.body.innerHTML =
            '<div>' + '  <span style="height: 200px;width: 50px"/>' + '  <div style="height: 500px;width: 50px" />' + '</div>'

        // Some lines and the outcome can't be tested because we can't mock `scrollHeight` and `clientHeight`
        getDocumentScrollHeight()
    })
})
