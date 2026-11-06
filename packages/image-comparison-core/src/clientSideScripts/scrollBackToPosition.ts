/**
 * Scroll back to y = position after a screenshot, in the same way as `scrollToPosition`,
 * but the scroll ignores `scroll-behavior: smooth` of the page: the page is at the position when the script returns,
 * and is not still moving when the next command runs.
 * Also restores any ancestor or frame documents that were scrolled by `scrollElementIntoView`.
 */
export default function scrollBackToPosition(yPosition: number): void {
    function scrollDocumentToPosition(doc: Document, position: number): void {
        const htmlNode = doc.querySelector?.('html') ?? doc.documentElement
        const bodyNode = doc.querySelector?.('body') ?? doc.body
        if (!htmlNode || !bodyNode) {
            return
        }
        const nodes = [htmlNode, bodyNode]
        const inlineValues = nodes.map((node) => ({
            value: node.style?.getPropertyValue('scroll-behavior') ?? '',
            priority: node.style?.getPropertyPriority('scroll-behavior') ?? '',
        }))
        // An inline `!important` value wins over every value of the page
        nodes.forEach((node) => node.style?.setProperty('scroll-behavior', 'auto', 'important'))

        try {
            if (htmlNode.scrollHeight > htmlNode.clientHeight) {
                htmlNode.scrollTop = position
                // Did we scroll to the right position?
                if (htmlNode.scrollTop === position) {
                    return
                }
            }

            // If not then try the body
            if (bodyNode.scrollHeight > bodyNode.clientHeight) {
                bodyNode.scrollTop = position
                // Did we scroll to the right position?
                if (bodyNode.scrollTop === position) {
                    return
                }
            }

            // If not then try the document
            ;(doc.scrollingElement || doc.documentElement).scrollTop = position
        } finally {
            nodes.forEach((node, index) => {
                const { value, priority } = inlineValues[index]
                if (value) {
                    node.style?.setProperty('scroll-behavior', value, priority)
                } else {
                    node.style?.removeProperty('scroll-behavior')
                }
            })
        }
    }

    scrollDocumentToPosition(document, yPosition)

    if (typeof window !== 'undefined') {
        type SavedScrollEntry = { doc: Document, position: number }
        type WindowWithSavedScrolls = { __wdioSavedScrollDocs?: SavedScrollEntry[] }
        const entries: SavedScrollEntry[] = []
        const winStore = window as unknown as WindowWithSavedScrolls
        if (Array.isArray(winStore.__wdioSavedScrollDocs)) {
            entries.push(...winStore.__wdioSavedScrollDocs)
            delete winStore.__wdioSavedScrollDocs
        }
        try {
            if (window.top) {
                const topStore = window.top as unknown as WindowWithSavedScrolls
                if (Array.isArray(topStore.__wdioSavedScrollDocs)) {
                    for (const entry of topStore.__wdioSavedScrollDocs) {
                        if (!entries.some((e) => e.doc === entry.doc)) {
                            entries.push(entry)
                        }
                    }
                    delete topStore.__wdioSavedScrollDocs
                }
            }
        } catch {
            // Cross-origin top window
        }

        for (const { doc, position } of entries) {
            if (doc && doc !== document) {
                scrollDocumentToPosition(doc, position)
            }
        }
    }
}
