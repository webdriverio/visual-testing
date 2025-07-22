import { describe, it, expect, vi, beforeEach } from 'vitest'
import scrollToPosition from './scrollToPosition.js'

describe('scrollToPosition', () => {
    let mockHtmlNode: HTMLElement
    let mockBodyNode: HTMLElement
    let mockScrollingElement: HTMLElement

    beforeEach(() => {
        mockHtmlNode = {
            scrollTop: 0,
            get scrollHeight() { return 1000 },
            get clientHeight() { return 500 },
        } as unknown as HTMLElement

        mockBodyNode = {
            scrollTop: 0,
            get scrollHeight() { return 1000 },
            get clientHeight() { return 500 },
        } as unknown as HTMLElement

        mockScrollingElement = {
            scrollTop: 0,
        } as unknown as HTMLElement

        global.document = {
            querySelector: vi.fn((selector) => {
                if (selector === 'html') {return mockHtmlNode}
                if (selector === 'body') {return mockBodyNode}
                return null
            }),
            scrollingElement: mockScrollingElement,
            documentElement: mockHtmlNode,
        } as unknown as Document
    })

    it('should scroll html node when it is scrollable', () => {
        const yPosition = 100
        scrollToPosition(yPosition)

        expect(mockHtmlNode.scrollTop).toBe(yPosition)
    })

    it('should scroll body node when html is not scrollable', () => {
        Object.defineProperty(mockHtmlNode, 'scrollHeight', { value: 500 })
        const yPosition = 100
        scrollToPosition(yPosition)

        expect(mockBodyNode.scrollTop).toBe(yPosition)
    })

    it('should scroll document.scrollingElement when neither html nor body is scrollable', () => {
        Object.defineProperty(mockHtmlNode, 'scrollHeight', { value: 500 })
        Object.defineProperty(mockBodyNode, 'scrollHeight', { value: 500 })
        const yPosition = 100
        scrollToPosition(yPosition)

        expect(mockScrollingElement.scrollTop).toBe(yPosition)
    })

    it('should fallback to documentElement when scrollingElement is not available', () => {
        Object.defineProperty(mockHtmlNode, 'scrollHeight', { value: 500 })
        Object.defineProperty(mockBodyNode, 'scrollHeight', { value: 500 })
        Object.defineProperty(global.document, 'scrollingElement', { value: null })
        const yPosition = 100
        scrollToPosition(yPosition)

        expect(mockHtmlNode.scrollTop).toBe(yPosition)
    })

    it('should verify scroll position after scrolling html node', () => {
        const yPosition = 100
        scrollToPosition(yPosition)

        expect(mockHtmlNode.scrollTop).toBe(yPosition)
    })

    it('should verify scroll position after scrolling body node', () => {
        Object.defineProperty(mockHtmlNode, 'scrollHeight', { value: 500 })
        const yPosition = 100
        scrollToPosition(yPosition)

        expect(mockBodyNode.scrollTop).toBe(yPosition)
    })
})
