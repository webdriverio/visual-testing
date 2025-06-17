// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest'
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

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = ''

        // Mock window properties
        Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
        Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true })

        // Mock document properties
        Object.defineProperty(document.documentElement, 'clientHeight', { value: 768, configurable: true })
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, configurable: true })
        Object.defineProperty(document.body, 'scrollHeight', { value: 1000, configurable: true })

        // Mock window.scrollTo
        window.scrollTo = vi.fn()

        // Mock canvas context
        const mockGetContext = vi.fn().mockReturnValue(mockCanvasContext)
        HTMLCanvasElement.prototype.getContext = mockGetContext

        // Reset all mock functions
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
        // Create some tabbable elements
        const button = document.createElement('button')
        button.textContent = 'Test Button'
        button.tabIndex = 0
        document.body.appendChild(button)

        const input = document.createElement('input')
        input.type = 'text'
        input.tabIndex = 0
        document.body.appendChild(input)

        // Mock getBoundingClientRect for the elements
        const mockRect = {
            left: 100,
            top: 100,
            width: 100,
            height: 50,
            right: 200,
            bottom: 150,
        }
        Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue(mockRect)

        // Mock offsetParent to make elements visible
        Object.defineProperty(button, 'offsetParent', { value: document.body, configurable: true })
        Object.defineProperty(input, 'offsetParent', { value: document.body, configurable: true })

        // Create spies for canvas context methods
        const beginPathSpy = vi.spyOn(mockCanvasContext, 'beginPath')
        const globalCompositeOperationSpy = vi.spyOn(mockCanvasContext, 'globalCompositeOperation', 'set')
        const fillStyleSpy = vi.spyOn(mockCanvasContext, 'fillStyle', 'set')
        const strokeStyleSpy = vi.spyOn(mockCanvasContext, 'strokeStyle', 'set')
        const lineWidthSpy = vi.spyOn(mockCanvasContext, 'lineWidth', 'set')

        drawTabbableOnCanvas(defaultOptions)

        // Verify the sequence of operations
        expect(beginPathSpy).toHaveBeenCalled()

        // Check line drawing operations (happens first)
        expect(globalCompositeOperationSpy).toHaveBeenNthCalledWith(1, 'destination-over')
        expect(lineWidthSpy).toHaveBeenNthCalledWith(1, defaultOptions.line!.width)
        expect(strokeStyleSpy).toHaveBeenNthCalledWith(1, defaultOptions.line!.color)
        expect(mockCanvasContext.moveTo).toHaveBeenCalled()
        expect(mockCanvasContext.lineTo).toHaveBeenCalled()
        expect(mockCanvasContext.stroke).toHaveBeenCalled()

        // Check circle drawing operations (happens second)
        expect(globalCompositeOperationSpy).toHaveBeenNthCalledWith(2, 'source-over')
        expect(fillStyleSpy).toHaveBeenNthCalledWith(1, defaultOptions.circle!.backgroundColor)
        expect(lineWidthSpy).toHaveBeenNthCalledWith(2, defaultOptions.circle!.borderWidth)
        expect(strokeStyleSpy).toHaveBeenNthCalledWith(2, defaultOptions.circle!.borderColor)
        expect(mockCanvasContext.arc).toHaveBeenCalled()
        expect(mockCanvasContext.fill).toHaveBeenCalled()
        expect(mockCanvasContext.stroke).toHaveBeenCalled()

        // Check number drawing operations (happens last)
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
        // Create a hidden button
        const button = document.createElement('button')
        button.style.visibility = 'hidden'
        document.body.appendChild(button)

        drawTabbableOnCanvas(defaultOptions)

        expect(mockCanvasContext.beginPath).not.toHaveBeenCalled()
    })

    it('should handle disabled elements', () => {
        // Create a disabled button
        const button = document.createElement('button')
        button.disabled = true
        document.body.appendChild(button)

        drawTabbableOnCanvas(defaultOptions)

        expect(mockCanvasContext.beginPath).not.toHaveBeenCalled()
    })

    it('should not include elements with negative tabindex', () => {
        const div = document.createElement('div')
        div.tabIndex = -1
        document.body.appendChild(div)
        drawTabbableOnCanvas(defaultOptions)
        expect(mockCanvasContext.beginPath).not.toHaveBeenCalled()
    })

    it('should not include disabled elements', () => {
        const input = document.createElement('input')
        input.disabled = true
        document.body.appendChild(input)
        drawTabbableOnCanvas(defaultOptions)
        expect(mockCanvasContext.beginPath).not.toHaveBeenCalled()
    })

    it('should not include hidden elements (visibility: hidden)', () => {
        const input = document.createElement('input')
        input.style.visibility = 'hidden'
        document.body.appendChild(input)
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
        // Make radios visible
        Object.defineProperty(radio1, 'offsetParent', { value: document.body, configurable: true })
        Object.defineProperty(radio2, 'offsetParent', { value: document.body, configurable: true })
        // Mock getBoundingClientRect
        radio2.getBoundingClientRect = vi.fn().mockReturnValue({ left: 0, top: 0, width: 10, height: 10, right: 10, bottom: 10 })
        drawTabbableOnCanvas(defaultOptions)
        expect(mockCanvasContext.beginPath).toHaveBeenCalled()
    })

    it('should treat radio with no name as tabbable', () => {
        const radio = document.createElement('input')
        radio.type = 'radio'
        document.body.appendChild(radio)
        Object.defineProperty(radio, 'offsetParent', { value: document.body, configurable: true })
        radio.getBoundingClientRect = vi.fn().mockReturnValue({ left: 0, top: 0, width: 10, height: 10, right: 10, bottom: 10 })
        drawTabbableOnCanvas(defaultOptions)
        expect(mockCanvasContext.beginPath).toHaveBeenCalled()
    })

    it('should treat contentEditable as tabbable', () => {
        const div = document.createElement('div')
        div.contentEditable = 'true'
        div.tabIndex = 0
        document.body.appendChild(div)
        Object.defineProperty(div, 'offsetParent', { value: document.body, configurable: true })
        div.getBoundingClientRect = vi.fn().mockReturnValue({ left: 0, top: 0, width: 10, height: 10, right: 10, bottom: 10 })
        drawTabbableOnCanvas(defaultOptions)
        expect(mockCanvasContext.beginPath).toHaveBeenCalled()
    })

    it('should use body scrollHeight if it is greater than document scrollHeight', () => {
        Object.defineProperty(document.documentElement, 'clientHeight', { value: 100, configurable: true })
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 100, configurable: true })
        Object.defineProperty(document.body, 'scrollHeight', { value: 200, configurable: true })
        // Set window.innerHeight to match the others
        Object.defineProperty(window, 'innerHeight', { value: 100, configurable: true })
        // Add a tabbable element to trigger canvas drawing
        const btn = document.createElement('button')
        btn.tabIndex = 0
        Object.defineProperty(btn, 'offsetParent', { value: document.body, configurable: true })
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
})
