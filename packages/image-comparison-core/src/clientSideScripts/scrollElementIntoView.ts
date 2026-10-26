/**
 * Scroll the element into the top of the viewport
 */
export default function scrollElementIntoView(element: HTMLElement, addressBarShadowPadding: number): number {
    type SavedScrollEntry = { doc: Document, position: number }
    type WindowWithSavedScrolls = { __wdioSavedScrollDocs?: SavedScrollEntry[] }

    function rememberDocumentScrollPosition(doc: Document, position: number): void {
        const stores: WindowWithSavedScrolls[] = []
        if (typeof window !== 'undefined') {
            stores.push(window as unknown as WindowWithSavedScrolls)
            try {
                if (window.top && window.top !== window) {
                    stores.push(window.top as unknown as WindowWithSavedScrolls)
                }
            } catch {
                // Cross-origin top window
            }
        }
        const docWin = doc.defaultView
        if (docWin) {
            stores.push(docWin as unknown as WindowWithSavedScrolls)
            try {
                if (docWin.top && docWin.top !== docWin) {
                    stores.push(docWin.top as unknown as WindowWithSavedScrolls)
                }
            } catch {
                // Cross-origin top window
            }
        }
        for (const store of stores) {
            store.__wdioSavedScrollDocs ??= []
            if (!store.__wdioSavedScrollDocs.some((entry) => entry.doc === doc)) {
                store.__wdioSavedScrollDocs.push({ doc, position })
            }
        }
    }

    function scrollTargetInDocument(doc: Document, target: Element, padding: number): number {
        let currentPosition = 0
        const htmlNode = doc.documentElement
        const bodyNode = doc.body

        // Apply new global style
        const styleTag = doc.createElement('style')
        styleTag.innerHTML = '* { scroll-behavior: unset !important; }'
        doc.head.appendChild(styleTag)

        // Determine the current scroll position
        if (htmlNode.scrollTop > 0) {
            currentPosition = htmlNode.scrollTop
        } else if (bodyNode.scrollTop > 0) {
            currentPosition = bodyNode.scrollTop
        }

        rememberDocumentScrollPosition(doc, currentPosition)

        const { top } = target.getBoundingClientRect()
        // BCR.top is viewport-relative, so the element's document position is
        // currentPosition + top. Scroll there (minus padding) to place the
        // element at the viewport top.
        const yPosition = currentPosition + top - padding

        // Scroll to the position
        if (htmlNode.scrollHeight > htmlNode.clientHeight) {
            htmlNode.scrollTop = yPosition
        } else if (bodyNode.scrollHeight > bodyNode.clientHeight) {
            bodyNode.scrollTop = yPosition
        }

        // Remove the injected style
        doc.head.removeChild(styleTag)

        return currentPosition
    }

    const doc = element.ownerDocument ?? document
    let currentPosition = scrollTargetInDocument(doc, element, addressBarShadowPadding)

    // When the element is inside a frame, also scroll each ancestor frame into view
    // so the top-level page shows the iframe.
    let win: Window | null = doc.defaultView
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
        currentPosition = scrollTargetInDocument(win.parent.document, frameEl, addressBarShadowPadding)
        win = win.parent
    }

    return currentPosition
}
