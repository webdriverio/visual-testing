import { describe, it, expect, vi, beforeEach } from 'vitest'
import scrollElementIntoView from './scrollElementIntoView.js'

describe('scrollElementIntoView', () => {
    let mockElement: HTMLElement
    let mockHtmlNode: HTMLElement
    let mockBodyNode: HTMLElement
    let mockStyleTag: HTMLStyleElement
    let mockHead: HTMLElement

    beforeEach(() => {
        mockElement = {
            getBoundingClientRect: vi.fn().mockReturnValue({ top: 100 }),
        } as unknown as HTMLElement

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

        mockStyleTag = {
            innerHTML: '',
        } as unknown as HTMLStyleElement

        mockHead = {
            appendChild: vi.fn(),
            removeChild: vi.fn(),
        } as unknown as HTMLElement

        global.document = {
            documentElement: mockHtmlNode,
            body: mockBodyNode,
            createElement: vi.fn().mockReturnValue(mockStyleTag),
            head: mockHead,
        } as unknown as Document
    })

    it('should scroll element into view when html node is scrollable', () => {
        const addressBarShadowPadding = 10
        const result = scrollElementIntoView(mockElement, addressBarShadowPadding)

        expect(result).toBe(0)
        expect(mockHtmlNode.scrollTop).toBe(90)
        expect(mockHead.appendChild).toHaveBeenCalledWith(mockStyleTag)
        expect(mockHead.removeChild).toHaveBeenCalledWith(mockStyleTag)
    })

    it('should scroll element into view when body node is scrollable', () => {
        Object.defineProperty(mockHtmlNode, 'scrollHeight', { value: 500 })
        const addressBarShadowPadding = 10
        const result = scrollElementIntoView(mockElement, addressBarShadowPadding)

        expect(result).toBe(0)
        expect(mockBodyNode.scrollTop).toBe(90)
        expect(mockHead.appendChild).toHaveBeenCalledWith(mockStyleTag)
        expect(mockHead.removeChild).toHaveBeenCalledWith(mockStyleTag)
    })

    it('should return current scroll position when html node has scroll', () => {
        mockHtmlNode.scrollTop = 50
        const addressBarShadowPadding = 10
        const result = scrollElementIntoView(mockElement, addressBarShadowPadding)

        expect(result).toBe(50)
        expect(mockHtmlNode.scrollTop).toBe(90)
    })

    it('should return current scroll position when body node has scroll', () => {
        mockHtmlNode.scrollTop = 0
        mockBodyNode.scrollTop = 50
        Object.defineProperty(mockHtmlNode, 'scrollHeight', { value: 500 })
        const addressBarShadowPadding = 10
        const result = scrollElementIntoView(mockElement, addressBarShadowPadding)

        expect(result).toBe(50)
        expect(mockBodyNode.scrollTop).toBe(90)
    })

    it('should not scroll when neither html nor body is scrollable', () => {
        Object.defineProperty(mockHtmlNode, 'scrollHeight', { value: 500 })
        Object.defineProperty(mockBodyNode, 'scrollHeight', { value: 500 })
        const addressBarShadowPadding = 10
        const result = scrollElementIntoView(mockElement, addressBarShadowPadding)

        expect(result).toBe(0)
        expect(mockHtmlNode.scrollTop).toBe(0)
        expect(mockBodyNode.scrollTop).toBe(0)
    })
})
