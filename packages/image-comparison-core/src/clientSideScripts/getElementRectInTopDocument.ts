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
    function getFrameScale(frameEl: Element, fr: DOMRect, style: CSSStyleDeclaration): { scaleX: number, scaleY: number } {
        const htmlFrame = frameEl as HTMLElement
        let scaleX = 1
        let scaleY = 1
        if (htmlFrame.offsetWidth > 0 && fr.width > 0) {
            scaleX = fr.width / htmlFrame.offsetWidth
        } else if (frameEl.clientWidth > 0 && fr.width > 0) {
            const borderX = (parseFloat(style.borderLeftWidth) || frameEl.clientLeft || 0) + (parseFloat(style.borderRightWidth) || 0)
            scaleX = fr.width / (frameEl.clientWidth + borderX)
        }
        if (htmlFrame.offsetHeight > 0 && fr.height > 0) {
            scaleY = fr.height / htmlFrame.offsetHeight
        } else if (frameEl.clientHeight > 0 && fr.height > 0) {
            const borderY = (parseFloat(style.borderTopWidth) || frameEl.clientTop || 0) + (parseFloat(style.borderBottomWidth) || 0)
            scaleY = fr.height / (frameEl.clientHeight + borderY)
        }
        const transform = style.transform || htmlFrame.style?.transform || ''
        if (scaleX === 1 && scaleY === 1 && transform && transform !== 'none') {
            const scaleMatch = transform.match(/scale\(\s*([+-]?\d*\.?\d+)(?:\s*,\s*([+-]?\d*\.?\d+))?\s*\)/)
            if (scaleMatch) {
                const sx = parseFloat(scaleMatch[1])
                const sy = scaleMatch[2] !== undefined ? parseFloat(scaleMatch[2]) : sx
                if (sx > 0) {
                    scaleX = sx
                }
                if (sy > 0) {
                    scaleY = sy
                }
            } else {
                const scaleXMatch = transform.match(/scaleX\(\s*([+-]?\d*\.?\d+)\s*\)/)
                const scaleYMatch = transform.match(/scaleY\(\s*([+-]?\d*\.?\d+)\s*\)/)
                if (scaleXMatch && parseFloat(scaleXMatch[1]) > 0) {
                    scaleX = parseFloat(scaleXMatch[1])
                }
                if (scaleYMatch && parseFloat(scaleYMatch[1]) > 0) {
                    scaleY = parseFloat(scaleYMatch[1])
                }
                const matrixMatch = transform.match(/matrix\(\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)/)
                if (matrixMatch) {
                    const sx = Math.hypot(parseFloat(matrixMatch[1]), parseFloat(matrixMatch[2]))
                    const sy = Math.hypot(parseFloat(matrixMatch[3]), parseFloat(matrixMatch[4]))
                    if (sx > 0) {
                        scaleX = sx
                    }
                    if (sy > 0) {
                        scaleY = sy
                    }
                }
            }
        }
        return { scaleX, scaleY }
    }

    const r = element.getBoundingClientRect()
    let x = r.left
    let y = r.top
    let width = r.width
    let height = r.height
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
        const { scaleX, scaleY } = getFrameScale(frameEl, fr, style)
        const paddingLeft = parseFloat(style.paddingLeft) || 0
        const paddingTop = parseFloat(style.paddingTop) || 0
        x = fr.left + (frameEl.clientLeft + paddingLeft + x) * scaleX
        y = fr.top + (frameEl.clientTop + paddingTop + y) * scaleY
        width *= scaleX
        height *= scaleY
        win = win.parent
    }
    // 'document' origin: add the scroll of the top-level page. 'viewport' origin: no scroll.
    return origin === 'document' && win
        ? { x: x + win.scrollX, y: y + win.scrollY, width, height }
        : { x, y, width, height }
}
