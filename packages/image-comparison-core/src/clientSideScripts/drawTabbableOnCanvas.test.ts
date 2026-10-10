// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mock } from 'vitest-mock-extended'
import drawTabbableOnCanvas from './drawTabbableOnCanvas.js'
import type { TabbableOptions } from '../commands/tabbable.interfaces.js'

describe('drawTabbableOnCanvas', () => {
    const mockCanvasContext = {
        beginPath: vi.fn(),
        globalCompositeOperation: '',
        lineWidth: 0,
        strokeStyle: '',
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fillStyle: '',
        arc: vi.fn(),
        fill: vi.fn(),
        font: '',
        textAlign: '',
        textBaseline: '',
        fillText: vi.fn(),
    }

    const defaultOptions: TabbableOptions = {
        line: {
            color: '#ff0000',
            width: 2,
        },
        circle: {
            backgroundColor: '#ffffff',
            borderColor: '#ff0000',
            borderWidth: 2,
            size: 10,
            showNumber: true,
            fontSize: 12,
            fontFamily: 'Arial',
            fontColor: '#000000',
        },
    }

    /**
     * jsdom does no layout, so mark the element as rendered (one client rect), at `left` in the viewport
     */
    function render(element: Element, left = 0) {
        // Own properties: a spy on the inherited method would change it for all elements
        Object.defineProperty(element, 'getClientRects', { value: vi.fn().mockReturnValue(mock<DOMRectList>({ length: 1 })), configurable: true })
        Object.defineProperty(element, 'getBoundingClientRect', { value: vi.fn().mockReturnValue(DOMRect.fromRect({ x: left, y: 0, width: 10, height: 10 })), configurable: true, writable: true })
    }

    beforeEach(() => {
        document.body.innerHTML = ''
        document.body.removeAttribute('inert')
        document.documentElement.removeAttribute('inert')

        Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
        Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true })
        Object.defineProperty(document.documentElement, 'clientHeight', { value: 768, configurable: true })
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, configurable: true })
        Object.defineProperty(document.body, 'scrollHeight', { value: 1000, configurable: true })
        window.scrollTo = vi.fn()

        const mockGetContext = vi.fn().mockReturnValue(mockCanvasContext)

        HTMLCanvasElement.prototype.getContext = mockGetContext

        vi.clearAllMocks()
    })

    it('should create a canvas element with correct dimensions', () => {
        drawTabbableOnCanvas(defaultOptions)

        const canvas = document.getElementById('wic-tabbable-canvas') as HTMLCanvasElement
        expect(canvas).toBeTruthy()
        expect(canvas.width).toBe(1024)
        expect(canvas.height).toBe(1000)
        expect(canvas.style.position).toBe('absolute')
        expect(canvas.style.top).toBe('0px')
        expect(canvas.style.left).toBe('0px')
        expect(canvas.style.zIndex).toBe('999999')
    })

    it('should draw lines and circles for tabbable elements', () => {
        const button = document.createElement('button')
        button.textContent = 'Test Button'
        button.tabIndex = 0
        document.body.appendChild(button)

        const input = document.createElement('input')
        input.type = 'text'
        input.tabIndex = 0
        document.body.appendChild(input)

        const mockRect = {
            left: 100,
            top: 100,
            width: 100,
            height: 50,
            right: 200,
            bottom: 150,
        }
        Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue(mockRect)

        render(button)
        render(input)

        const beginPathSpy = vi.spyOn(mockCanvasContext, 'beginPath')
        const globalCompositeOperationSpy = vi.spyOn(mockCanvasContext, 'globalCompositeOperation', 'set')
        const fillStyleSpy = vi.spyOn(mockCanvasContext, 'fillStyle', 'set')
        const strokeStyleSpy = vi.spyOn(mockCanvasContext, 'strokeStyle', 'set')
        const lineWidthSpy = vi.spyOn(mockCanvasContext, 'lineWidth', 'set')

        drawTabbableOnCanvas(defaultOptions)

        expect(beginPathSpy).toHaveBeenCalled()

        expect(globalCompositeOperationSpy).toHaveBeenNthCalledWith(1, 'destination-over')
        expect(lineWidthSpy).toHaveBeenNthCalledWith(1, defaultOptions.line!.width)
        expect(strokeStyleSpy).toHaveBeenNthCalledWith(1, defaultOptions.line!.color)
        expect(mockCanvasContext.moveTo).toHaveBeenCalled()
        expect(mockCanvasContext.lineTo).toHaveBeenCalled()
        expect(mockCanvasContext.stroke).toHaveBeenCalled()
        expect(globalCompositeOperationSpy).toHaveBeenNthCalledWith(2, 'source-over')
        expect(fillStyleSpy).toHaveBeenNthCalledWith(1, defaultOptions.circle!.backgroundColor)
        expect(lineWidthSpy).toHaveBeenNthCalledWith(2, defaultOptions.circle!.borderWidth)
        expect(strokeStyleSpy).toHaveBeenNthCalledWith(2, defaultOptions.circle!.borderColor)
        expect(mockCanvasContext.arc).toHaveBeenCalled()
        expect(mockCanvasContext.fill).toHaveBeenCalled()
        expect(mockCanvasContext.stroke).toHaveBeenCalled()
        expect(fillStyleSpy).toHaveBeenNthCalledWith(2, defaultOptions.circle!.fontColor)
        expect(mockCanvasContext.font).toBe(`${defaultOptions.circle!.fontSize}px ${defaultOptions.circle!.fontFamily}`)
        expect(mockCanvasContext.textAlign).toBe('center')
        expect(mockCanvasContext.textBaseline).toBe('middle')
        expect(mockCanvasContext.fillText).toHaveBeenCalled()
    })

    it('should handle empty tabbable elements', () => {
        drawTabbableOnCanvas(defaultOptions)

        const canvas = document.getElementById('wic-tabbable-canvas') as HTMLCanvasElement
        expect(canvas).toBeTruthy()
        expect(mockCanvasContext.beginPath).not.toHaveBeenCalled()
    })

    it('should handle hidden elements', () => {
        const button = document.createElement('button')
        button.style.visibility = 'hidden'
        document.body.appendChild(button)
        render(button)

        drawTabbableOnCanvas(defaultOptions)

        expect(mockCanvasContext.beginPath).not.toHaveBeenCalled()
    })

    it('should handle disabled elements', () => {
        const button = document.createElement('button')
        button.disabled = true
        document.body.appendChild(button)
        render(button)

        drawTabbableOnCanvas(defaultOptions)

        expect(mockCanvasContext.beginPath).not.toHaveBeenCalled()
    })

    it('should not include elements with negative tabindex', () => {
        const div = document.createElement('div')
        div.tabIndex = -1
        document.body.appendChild(div)
        render(div)
        drawTabbableOnCanvas(defaultOptions)
        expect(mockCanvasContext.beginPath).not.toHaveBeenCalled()
    })

    it('should not include disabled elements', () => {
        const input = document.createElement('input')
        input.disabled = true
        document.body.appendChild(input)
        render(input)
        drawTabbableOnCanvas(defaultOptions)
        expect(mockCanvasContext.beginPath).not.toHaveBeenCalled()
    })

    it('should not include hidden elements (visibility: hidden)', () => {
        const input = document.createElement('input')
        input.style.visibility = 'hidden'
        document.body.appendChild(input)
        render(input)
        drawTabbableOnCanvas(defaultOptions)
        expect(mockCanvasContext.beginPath).not.toHaveBeenCalled()
    })

    it('should only include checked radio in group as tabbable', () => {
        const radio1 = document.createElement('input')
        radio1.type = 'radio'
        radio1.name = 'group1'
        document.body.appendChild(radio1)

        const radio2 = document.createElement('input')
        radio2.type = 'radio'
        radio2.name = 'group1'
        radio2.checked = true
        document.body.appendChild(radio2)
        render(radio1)
        render(radio2)
        radio2.getBoundingClientRect = vi.fn().mockReturnValue({ left: 0, top: 0, width: 10, height: 10, right: 10, bottom: 10 })

        drawTabbableOnCanvas(defaultOptions)

        expect(mockCanvasContext.beginPath).toHaveBeenCalled()
    })

    it('should sort tabbable elements correctly (tabIndex 0 vs non-zero)', () => {
        const btn1 = document.createElement('button')
        btn1.tabIndex = 0
        document.body.appendChild(btn1)
        const btn2 = document.createElement('button')
        btn2.tabIndex = 1
        document.body.appendChild(btn2)
        render(btn1)
        render(btn2)
        btn1.getBoundingClientRect = vi.fn().mockReturnValue({ left: 0, top: 0, width: 10, height: 10, right: 10, bottom: 10 })
        btn2.getBoundingClientRect = vi.fn().mockReturnValue({ left: 20, top: 20, width: 10, height: 10, right: 30, bottom: 30 })
        drawTabbableOnCanvas(defaultOptions)
        expect(mockCanvasContext.beginPath).toHaveBeenCalled()
    })

    it('should treat radio with no name as tabbable', () => {
        const radio = document.createElement('input')
        radio.type = 'radio'
        document.body.appendChild(radio)
        render(radio)
        radio.getBoundingClientRect = vi.fn().mockReturnValue({ left: 0, top: 0, width: 10, height: 10, right: 10, bottom: 10 })
        drawTabbableOnCanvas(defaultOptions)
        expect(mockCanvasContext.beginPath).toHaveBeenCalled()
    })

    it('should treat contentEditable as tabbable', () => {
        const div = document.createElement('div')
        div.contentEditable = 'true'
        div.tabIndex = 0
        document.body.appendChild(div)
        render(div)
        div.getBoundingClientRect = vi.fn().mockReturnValue({ left: 0, top: 0, width: 10, height: 10, right: 10, bottom: 10 })
        drawTabbableOnCanvas(defaultOptions)
        expect(mockCanvasContext.beginPath).toHaveBeenCalled()
    })

    it('should use body scrollHeight if it is greater than document scrollHeight', () => {
        Object.defineProperty(document.documentElement, 'clientHeight', { value: 100, configurable: true })
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 100, configurable: true })
        Object.defineProperty(document.body, 'scrollHeight', { value: 200, configurable: true })
        Object.defineProperty(window, 'innerHeight', { value: 100, configurable: true })

        const btn = document.createElement('button')
        btn.tabIndex = 0
        render(btn)
        btn.getBoundingClientRect = vi.fn().mockReturnValue({ left: 0, top: 0, width: 10, height: 10, right: 10, bottom: 10 })
        document.body.appendChild(btn)

        drawTabbableOnCanvas(defaultOptions)

        const canvas = document.getElementById('wic-tabbable-canvas') as HTMLCanvasElement

        expect(canvas.height).toBe(200)
    })

    it('should walk DOM to find highest node if scrollHeight and bodyScrollHeight equal clientHeight', () => {
        Object.defineProperty(document.documentElement, 'clientHeight', { value: 100, configurable: true })
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 100, configurable: true })
        Object.defineProperty(document.body, 'scrollHeight', { value: 100, configurable: true })

        const tallDiv = document.createElement('div')
        tallDiv.style.height = '300px'
        document.body.appendChild(tallDiv)
        tallDiv.getBoundingClientRect = vi.fn().mockReturnValue({ top: 0 })

        drawTabbableOnCanvas(defaultOptions)

        const canvas = document.getElementById('wic-tabbable-canvas') as HTMLCanvasElement

        expect(canvas.height).toBeGreaterThanOrEqual(100)
    })

    it('should not throw or attempt to draw if getContext returns null (drawLine)', () => {
        const originalGetContext = HTMLCanvasElement.prototype.getContext
        HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null)

        const btn1 = document.createElement('button')
        btn1.tabIndex = 0
        render(btn1)
        btn1.getBoundingClientRect = vi.fn().mockReturnValue({ left: 0, top: 0, width: 10, height: 10, right: 10, bottom: 10 })
        document.body.appendChild(btn1)

        const btn2 = document.createElement('button')
        btn2.tabIndex = 0
        render(btn2)
        btn2.getBoundingClientRect = vi.fn().mockReturnValue({ left: 20, top: 20, width: 10, height: 10, right: 30, bottom: 30 })
        document.body.appendChild(btn2)

        expect(() => drawTabbableOnCanvas(defaultOptions)).not.toThrow()
        expect(mockCanvasContext.beginPath).not.toHaveBeenCalled()

        HTMLCanvasElement.prototype.getContext = originalGetContext
    })

    it('should not throw or attempt to draw if getContext returns null (drawCircleAndNumber)', () => {
        const originalGetContext = HTMLCanvasElement.prototype.getContext
        HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null)

        const btn = document.createElement('button')
        btn.tabIndex = 0
        render(btn)
        btn.getBoundingClientRect = vi.fn().mockReturnValue({ left: 0, top: 0, width: 10, height: 10, right: 10, bottom: 10 })
        document.body.appendChild(btn)

        expect(() => drawTabbableOnCanvas(defaultOptions)).not.toThrow()
        expect(mockCanvasContext.beginPath).not.toHaveBeenCalled()

        HTMLCanvasElement.prototype.getContext = originalGetContext
    })

    describe('tab order (#515)', () => {
        let rendered: Map<number, string>

        beforeEach(() => {
            rendered = new Map()
        })

        /**
         * Create an element, mark it as rendered at its own x position, and remember its name for that position
         */
        function create(parent: Element | ShadowRoot, html: string, name?: string): Element {
            const template = document.createElement('template')
            template.innerHTML = html
            const element = template.content.firstElementChild
            if (!element) {
                throw new Error(`No element in ${html}`)
            }
            parent.appendChild(element)
            if (name) {
                track(element, name)
            }
            return element
        }

        /**
         * Mark an element as rendered at its own x position, and remember its name for that position
         */
        function track(element: Element | null, name: string): void {
            if (!element) {
                throw new Error(`No element for ${name}`)
            }
            const left = (rendered.size + 1) * 100
            rendered.set(left + 5, name)
            render(element, left)
        }

        /**
         * The names of the drawn elements, in the order of their numbers (the center of an element is at left + 5)
         */
        function drawnOrder(): string[] {
            drawTabbableOnCanvas(defaultOptions)

            return mockCanvasContext.fillText.mock.calls.map(([, x]) => rendered.get(x) ?? `unknown x=${x}`)
        }

        it('should include the elements of an open shadow root at the place of its host', () => {
            create(document.body, '<button></button>', 'start')
            const host = create(document.body, '<div></div>')
            const root = host.attachShadow({ mode: 'open' })
            create(root, '<button></button>', 'shadow-a')
            create(root, '<button></button>', 'shadow-b')
            create(document.body, '<button></button>', 'end')

            expect(drawnOrder()).toEqual(['start', 'shadow-a', 'shadow-b', 'end'])
        })

        it('should include the elements of nested shadow roots', () => {
            const host = create(document.body, '<div></div>')
            const root = host.attachShadow({ mode: 'open' })
            create(root, '<button></button>', 'outer-a')
            const inner = create(root, '<div></div>').attachShadow({ mode: 'open' })
            create(inner, '<button></button>', 'inner')
            create(root, '<button></button>', 'outer-b')

            expect(drawnOrder()).toEqual(['outer-a', 'inner', 'outer-b'])
        })

        it('should follow the order of the slots, not the order of the light DOM', () => {
            const host = create(document.body, '<div></div>')
            create(host, '<button></button>', 'slotted-default')
            create(host, '<button slot="second"></button>', 'slotted-second')
            const root = host.attachShadow({ mode: 'open' })
            create(root, '<button></button>', 'before')
            create(root, '<slot name="second"></slot>')
            create(root, '<slot></slot>')
            create(root, '<button></button>', 'after')

            expect(drawnOrder()).toEqual(['before', 'slotted-second', 'slotted-default', 'after'])
        })

        it('should sort a positive tabindex inside a shadow root only in that shadow root', () => {
            create(document.body, '<button></button>', 'document-0')
            const root = create(document.body, '<div></div>').attachShadow({ mode: 'open' })
            create(root, '<button></button>', 'shadow-0')
            create(root, '<button tabindex="2"></button>', 'shadow-2')
            create(root, '<button tabindex="1"></button>', 'shadow-1')
            create(document.body, '<button tabindex="1"></button>', 'document-1')

            expect(drawnOrder()).toEqual(['document-1', 'document-0', 'shadow-1', 'shadow-2', 'shadow-0'])
        })

        it('should sort the shadow root of a host with a positive tabindex with its host', () => {
            create(document.body, '<button></button>', 'document-0')
            const host = create(document.body, '<div tabindex="1"></div>', 'host')
            create(host.attachShadow({ mode: 'open' }), '<button></button>', 'in-host')

            expect(drawnOrder()).toEqual(['host', 'in-host', 'document-0'])
        })

        it('should skip a shadow host with a negative tabindex and its shadow root', () => {
            create(document.body, '<button></button>', 'start')
            const host = create(document.body, '<div tabindex="-1"></div>')
            create(host.attachShadow({ mode: 'open' }), '<button></button>', 'in-skipped-host')
            create(document.body, '<button></button>', 'end')

            expect(drawnOrder()).toEqual(['start', 'end'])
        })

        it('should not include a shadow host that delegates the focus, only the elements in its shadow root', () => {
            const host = create(document.body, '<div tabindex="0"></div>', 'host')
            const root = host.attachShadow({ mode: 'open', delegatesFocus: true })
            // jsdom does not keep `delegatesFocus`
            Object.defineProperty(root, 'delegatesFocus', { value: true })
            create(root, '<input>', 'input')

            expect(drawnOrder()).toEqual(['input'])
        })

        it('should use a radio group per shadow root', () => {
            create(document.body, '<input type="radio" name="r" checked>', 'document-radio')
            const root = create(document.body, '<div></div>').attachShadow({ mode: 'open' })
            create(root, '<input type="radio" name="r">', 'shadow-radio-1')
            create(root, '<input type="radio" name="r" checked>', 'shadow-radio-2')

            expect(drawnOrder()).toEqual(['document-radio', 'shadow-radio-2'])
        })

        it('should use the form owner of a radio input for its group, also with the form attribute', () => {
            const form = create(document.body, '<form id="f1"></form>')
            create(form, '<input type="radio" name="g">', 'in-form-a')
            create(form, '<input type="radio" name="g">', 'in-form-b')
            create(document.body, '<input type="radio" name="g" form="f1" checked>', 'form-attribute')

            expect(drawnOrder()).toEqual(['form-attribute'])
        })

        it('should not put a radio input without a form in the group of a form with the same name', () => {
            create(document.body, '<input type="radio" name="g">', 'no-form-a')
            create(document.body, '<input type="radio" name="g">', 'no-form-b')
            create(create(document.body, '<form></form>'), '<input type="radio" name="g" checked>', 'in-form')

            expect(drawnOrder()).toEqual(['no-form-a', 'in-form'])
        })

        it('should include only the first radio input of a group without a checked radio input', () => {
            create(document.body, '<input type="radio" name="g">', 'radio-a')
            create(document.body, '<button></button>', 'between')
            create(document.body, '<input type="radio" name="g">', 'radio-b')

            expect(drawnOrder()).toEqual(['radio-a', 'between'])
        })

        it('should include the first radio input in the tab order when the checked radio input is not a tab stop', () => {
            create(document.body, '<input type="radio" name="disabled">', 'disabled-a')
            create(document.body, '<input type="radio" name="disabled" checked disabled>', 'disabled-b')
            create(document.body, '<input type="radio" name="positive">', 'positive-0')
            create(document.body, '<input type="radio" name="positive" tabindex="2">', 'positive-2')

            expect(drawnOrder()).toEqual(['positive-2', 'disabled-a'])
        })

        it('should include SVG links and SVG elements with a tabindex', () => {
            const svg = create(document.body, '<svg><a href="#a"></a><a xlink:href="#b"></a><a></a><rect tabindex="0"></rect><circle tabindex="1"></circle><rect tabindex="-1"></rect></svg>')
            const [link, xlink, noHref] = Array.from(svg.querySelectorAll('a'))
            track(link, 'link')
            track(xlink, 'xlink')
            track(noHref, 'no-href')
            track(svg.querySelector('rect[tabindex="0"]'), 'rect')
            track(svg.querySelector('circle'), 'circle')
            track(svg.querySelector('rect[tabindex="-1"]'), 'rect-minus')

            expect(drawnOrder()).toEqual(['circle', 'link', 'xlink', 'rect'])
        })

        it('should include a details element with a summary when it has a tabindex, and then its summary', () => {
            const details = create(document.body, '<details tabindex="0"></details>', 'details')
            create(details, '<summary></summary>', 'summary')
            const invalid = create(document.body, '<details tabindex="invalid"></details>', 'details-invalid-tabindex')
            create(invalid, '<summary></summary>', 'summary-invalid-tabindex')

            expect(drawnOrder()).toEqual(['details', 'summary', 'summary-invalid-tabindex'])
        })

        it('should skip a details element with a negative tabindex with its summary and content', () => {
            create(document.body, '<button></button>', 'start')
            const details = create(document.body, '<details tabindex="-1" open></details>')
            create(details, '<summary></summary>', 'summary')
            create(details, '<button></button>', 'content')
            create(document.body, '<button></button>', 'end')

            expect(drawnOrder()).toEqual(['start', 'end'])
        })

        it('should sort a details element like a shadow host with a slot for the summary and a slot for the content', () => {
            create(document.body, '<button></button>', 'document-0')
            const details = create(document.body, '<details tabindex="2" open></details>', 'details')
            create(details, '<button></button>', 'content-0')
            create(details, '<summary></summary>', 'summary')
            create(details, '<button tabindex="1"></button>', 'content-1')

            expect(drawnOrder()).toEqual(['details', 'summary', 'content-1', 'content-0', 'document-0'])
        })

        it.each(['body', 'html'])('should not include any element when the %s element is inert', (root) => {
            create(document.body, '<button></button>', 'button')
            const element = root === 'body' ? document.body : document.documentElement
            element.setAttribute('inert', '')

            expect(drawnOrder()).toEqual([])
        })

        it('should include an element with position fixed, which has no offsetParent', () => {
            const fixed = create(document.body, '<button style="position: fixed"></button>', 'fixed')
            Object.defineProperty(fixed, 'offsetParent', { value: null, configurable: true })

            expect(drawnOrder()).toEqual(['fixed'])
        })

        it('should include the summary of a closed details element, not its content', () => {
            const details = create(document.body, '<details></details>')
            create(details, '<summary></summary>', 'summary')
            create(details, '<button></button>', 'in-closed-details')

            expect(drawnOrder()).toEqual(['summary'])
        })

        it('should include a details element without a summary', () => {
            create(document.body, '<details></details>', 'details')

            expect(drawnOrder()).toEqual(['details'])
        })

        it('should not include the elements in an inert subtree or in a disabled fieldset', () => {
            create(create(document.body, '<div inert></div>'), '<button></button>', 'inert')
            create(create(document.body, '<fieldset disabled></fieldset>'), '<button></button>', 'in-disabled-fieldset')
            create(document.body, '<button></button>', 'end')

            expect(drawnOrder()).toEqual(['end'])
        })

        it('should use checkVisibility when the browser has it', () => {
            const visible = create(document.body, '<button></button>', 'visible')
            const hidden = create(document.body, '<button></button>', 'hidden')
            visible.checkVisibility = vi.fn().mockReturnValue(true)
            hidden.checkVisibility = vi.fn().mockReturnValue(false)

            expect(drawnOrder()).toEqual(['visible'])
            expect(hidden.checkVisibility).toHaveBeenCalledWith({ visibilityProperty: true, checkVisibilityCSS: true })
        })
    })
})
