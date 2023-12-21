import { describe, it, expect } from 'vitest'
import removeElementFromDom from './removeElementFromDom.js'

describe('removeElementFromDom', () => {
    it('should be able to remove the custom css', () => {
    // Set up our document body
        const id = 'test'
        const cssText = 'body:{width:100%}'
        const head = document.head || document.getElementsByTagName('head')[0]
        const style = document.createElement('style')

        style.id = id
        style.appendChild(document.createTextNode(cssText))
        head.appendChild(style)

        expect(document.head.textContent).toMatchSnapshot()

        removeElementFromDom(id)

        expect(document.head.textContent).toMatchSnapshot()
    })

    it('should do nothing if custom css is not present', () => {
        const id = 'test'

        expect(document.head.textContent).toMatchSnapshot()

        removeElementFromDom(id)

        expect(document.head.textContent).toMatchSnapshot()
    })

    it('should do nothing if document.head is null', () => {
        const id = 'test'
        Object.defineProperty(document, 'head', { value: null })

        removeElementFromDom(id)

        expect(document.head).toBe(null)
    })

    it('should be able to remove an element from the body', () => {
        document.body.innerHTML =
      '<div>' +
      '   <span id="id-1">Hello</span>' +
      '   <span id="id-2">Hello</span>' +
      '   <div>' +
      '     <span id="id-3">Hello</span>' +
      '     <span id="id-4">Hello</span>' +
      '  </div>' +
      '</div>'

        expect(document.body).toMatchSnapshot()

        removeElementFromDom('id-1')

        expect(document.body).toMatchSnapshot()
    })
})
