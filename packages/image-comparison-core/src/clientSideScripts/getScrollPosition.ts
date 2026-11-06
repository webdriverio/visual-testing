/**
 * Get the vertical scroll position of the element that `scrollToPosition` scrolls:
 * the `html` node when it can scroll, else the `body` node when it can scroll, else the scrolling element.
 * When executed inside a same-origin frame, also saves the scroll position of each accessible ancestor
 * document so `scrollBackToPosition` can restore every document scrolled during `scrollElementIntoView`.
 */
/* istanbul ignore next */
export default function getScrollPosition(): number {
    function readDocumentScrollPosition(doc: Document): number {
        const htmlNode = doc.querySelector('html') ?? doc.documentElement
        const bodyNode = doc.querySelector('body') ?? doc.body

        if (htmlNode && htmlNode.scrollHeight > htmlNode.clientHeight) {
            return htmlNode.scrollTop
        }

        if (bodyNode && bodyNode.scrollHeight > bodyNode.clientHeight) {
            return bodyNode.scrollTop
        }

        return (doc.scrollingElement || doc.documentElement).scrollTop
    }

    const currentPosition = readDocumentScrollPosition(document)

    const savedDocs: Array<{ doc: Document, position: number }> = []
    let win: Window | null = typeof window !== 'undefined' ? window : null
    while (win && win !== win.top) {
        let frameEl: Element | null = null
        try {
            frameEl = win.frameElement
        } catch {
            break
        }
        if (!frameEl || !win.parent) {
            break
        }
        try {
            const parentDoc = win.parent.document
            savedDocs.push({ doc: parentDoc, position: readDocumentScrollPosition(parentDoc) })
        } catch {
            break
        }
        win = win.parent
    }

    if (typeof window !== 'undefined') {
        type WindowWithSavedScrolls = { __wdioSavedScrollDocs?: Array<{ doc: Document, position: number }> }
        const winStore = window as unknown as WindowWithSavedScrolls
        winStore.__wdioSavedScrollDocs = savedDocs
        try {
            if (window.top) {
                (window.top as unknown as WindowWithSavedScrolls).__wdioSavedScrollDocs = [...savedDocs]
            }
        } catch {
            // Cross-origin top window
        }
    }

    return currentPosition
}
