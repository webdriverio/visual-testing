/**
 * Get the position and size of the element in the top-level document (`origin: 'document'`) or
 * top-level viewport (`origin: 'viewport'`), in CSS pixels and not rounded.
 * Walks up parent frames and adds the content-box position of each iframe.
 * Returns `null` when an ancestor frame is cross-origin (`window.frameElement` is `null`).
 */
export default function getElementRectInTopDocument(
    element: Element,
    origin: 'document' | 'viewport',
): { x: number, y: number, width: number, height: number } | null {
    const r = element.getBoundingClientRect()
    let x = r.left
    let y = r.top
    let win: Window | null = element.ownerDocument?.defaultView ?? window
    while (win && win !== win.top) {
        let frameEl: Element | null = null
        try {
            frameEl = win.frameElement
        } catch {
            return null
        }
        if (!frameEl || !win.parent) {
            return null
        }
        const fr = frameEl.getBoundingClientRect()
        const style = win.parent.getComputedStyle(frameEl)
        x += fr.left + frameEl.clientLeft + (parseFloat(style.paddingLeft) || 0)
        y += fr.top + frameEl.clientTop + (parseFloat(style.paddingTop) || 0)
        win = win.parent
    }
    // 'document' origin: add the scroll of the top-level page. 'viewport' origin: no scroll.
    return origin === 'document' && win
        ? { x: x + win.scrollX, y: y + win.scrollY, width: r.width, height: r.height }
        : { x, y, width: r.width, height: r.height }
}
