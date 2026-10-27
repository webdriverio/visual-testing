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
        // currentPosition (50) + BCR.top (100) - padding (10) = 140
        expect(mockHtmlNode.scrollTop).toBe(140)
    })

    it('should return current scroll position when body node has scroll', () => {
        mockHtmlNode.scrollTop = 0
        mockBodyNode.scrollTop = 50
        Object.defineProperty(mockHtmlNode, 'scrollHeight', { value: 500 })
        const addressBarShadowPadding = 10
        const result = scrollElementIntoView(mockElement, addressBarShadowPadding)

        expect(result).toBe(50)
        // currentPosition (50) + BCR.top (100) - padding (10) = 140
        expect(mockBodyNode.scrollTop).toBe(140)
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

    it('should also scroll the parent document when the element is inside a frame', () => {
        const frameHtmlNode = {
            scrollTop: 20,
            get scrollHeight() { return 600 },
            get clientHeight() { return 300 },
        } as unknown as HTMLElement
        const frameBodyNode = {
            scrollTop: 0,
            get scrollHeight() { return 300 },
            get clientHeight() { return 300 },
        } as unknown as HTMLElement
        const frameHead = {
            appendChild: vi.fn(),
            removeChild: vi.fn(),
        } as unknown as HTMLElement
        const mockFrameEl = {
            getBoundingClientRect: vi.fn().mockReturnValue({ top: 400 }),
        } as unknown as Element

        mockHtmlNode.scrollTop = 100
        const topWin = {
            document: global.document,
        } as unknown as Window
        ;(topWin as any).top = topWin
        ;(topWin as any).parent = topWin

        const frameDoc = {
            documentElement: frameHtmlNode,
            body: frameBodyNode,
            createElement: vi.fn().mockReturnValue(mockStyleTag),
            head: frameHead,
            defaultView: {
                frameElement: mockFrameEl,
                parent: topWin,
                top: topWin,
            },
        } as unknown as Document

        const elementInFrame = {
            getBoundingClientRect: vi.fn().mockReturnValue({ top: 80 }),
            ownerDocument: frameDoc,
        } as unknown as HTMLElement

        const result = scrollElementIntoView(elementInFrame, 10)

        // Frame document scrolled: 20 + 80 - 10 = 90
        expect(frameHtmlNode.scrollTop).toBe(90)
        // Top-level document scrolled: 100 + 400 - 10 = 490, and returns previous top scroll (100)
        expect(mockHtmlNode.scrollTop).toBe(490)
        expect(result).toBe(100)
    })

    it('should not throw when window.top is cross-origin and rejects custom property access', () => {
        const crossOriginTop = new Proxy({}, {
            get() {
                throw new Error('SecurityError: Blocked a frame with origin from accessing a cross-origin frame.')
            },
            set() {
                throw new Error('SecurityError: Blocked a frame with origin from accessing a cross-origin frame.')
            },
        }) as unknown as Window

        const frameDoc = {
            documentElement: mockHtmlNode,
            body: mockBodyNode,
            createElement: vi.fn().mockReturnValue(mockStyleTag),
            head: mockHead,
            defaultView: {
                frameElement: null,
                parent: crossOriginTop,
                top: crossOriginTop,
            },
        } as unknown as Document

        const elementInCrossOriginFrame = {
            getBoundingClientRect: vi.fn().mockReturnValue({ top: 100 }),
            ownerDocument: frameDoc,
        } as unknown as HTMLElement

        expect(() => scrollElementIntoView(elementInCrossOriginFrame, 10)).not.toThrow()
        expect(mockHtmlNode.scrollTop).toBe(90)
    })
})
