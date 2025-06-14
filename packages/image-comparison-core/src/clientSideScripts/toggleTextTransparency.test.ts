// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import toggleTextTransparency from './toggleTextTransparency.js'

describe('toggleTextTransparency', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="testDiv">
                <p>Paragraph</p>
                <span>Span</span>
                <script>console.log('script')</script>
                <style>body { background-color: blue; }</style>
            </div>
        `
        const styleElement = document.createElement('style')
        styleElement.innerHTML = '/* head style */'
        document.head.appendChild(styleElement)
    })

    afterEach(() => {
        document.body.innerHTML = ''
        document.head.innerHTML = ''
    })

    it('should make text transparent when enabled', () => {
        toggleTextTransparency(true)

        const testDiv = document.getElementById('testDiv')
        expect(testDiv).toMatchSnapshot()
    })

    it('should remove transparent style when disabled', () => {
        toggleTextTransparency(true)
        const transparentDiv = document.getElementById('testDiv')
        expect(transparentDiv).toMatchSnapshot()

        // Now remove it
        toggleTextTransparency(false)
        const testDiv = document.getElementById('testDiv')
        expect(testDiv).toMatchSnapshot()
    })
})
