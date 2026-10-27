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
    function getFrameScale(frameEl: Element, fr: DOMRect, parentWin: Window): { scaleX: number, scaleY: number } {
        const htmlFrame = frameEl as HTMLElement
        let scaleX = 1
        let scaleY = 1
        let curEl: Element | null = frameEl

        while (curEl) {
            const cs = parentWin.getComputedStyle(curEl)
            const inlineTransform = (curEl as HTMLElement).style?.transform || ''
            const transform = (cs.transform && cs.transform !== 'none') ? cs.transform : inlineTransform

            if (transform && transform !== 'none') {
                const matrix3dMatch = transform.match(/matrix3d\(\s*([^)]+)\)/)
                const matrixMatch = !matrix3dMatch && transform.match(/matrix\(\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)/)
                if (matrix3dMatch) {
                    const vals = matrix3dMatch[1].split(',').map((v) => parseFloat(v.trim()))
                    if (vals.length >= 6) {
                        const sx = Math.hypot(vals[0], vals[1], vals[2])
                        const sy = Math.hypot(vals[4], vals[5], vals[6] || 0)
                        if (sx > 0) {
                            scaleX *= sx
                        }
                        if (sy > 0) {
                            scaleY *= sy
                        }
                    }
                } else if (matrixMatch) {
                    const sx = Math.hypot(parseFloat(matrixMatch[1]), parseFloat(matrixMatch[2]))
                    const sy = Math.hypot(parseFloat(matrixMatch[3]), parseFloat(matrixMatch[4]))
                    if (sx > 0) {
                        scaleX *= sx
                    }
                    if (sy > 0) {
                        scaleY *= sy
                    }
                } else {
                    const scaleMatch = transform.match(/scale\(\s*([+-]?\d*\.?\d+)(?:\s*,\s*([+-]?\d*\.?\d+))?\s*\)/)
                    if (scaleMatch) {
                        const sx = parseFloat(scaleMatch[1])
                        const sy = scaleMatch[2] !== undefined ? parseFloat(scaleMatch[2]) : sx
                        if (sx > 0) {
                            scaleX *= sx
                        }
                        if (sy > 0) {
                            scaleY *= sy
                        }
                    } else {
                        const scaleXMatch = transform.match(/scaleX\(\s*([+-]?\d*\.?\d+)\s*\)/)
                        const scaleYMatch = transform.match(/scaleY\(\s*([+-]?\d*\.?\d+)\s*\)/)
                        if (scaleXMatch && parseFloat(scaleXMatch[1]) > 0) {
                            scaleX *= parseFloat(scaleXMatch[1])
                        }
                        if (scaleYMatch && parseFloat(scaleYMatch[1]) > 0) {
                            scaleY *= parseFloat(scaleYMatch[1])
                        }
                    }
                }
            }

            const inlineScale = (curEl as HTMLElement).style?.scale || ''
            const scaleProp = (cs.scale && cs.scale !== 'none') ? cs.scale : inlineScale
            if (scaleProp && scaleProp !== 'none') {
                const parts = scaleProp.trim().split(/\s+/)
                if (parts.length >= 1) {
                    const rawX = parts[0]
                    const rawY = parts.length >= 2 ? parts[1] : rawX
                    const sx = rawX.endsWith('%') ? parseFloat(rawX) / 100 : parseFloat(rawX)
                    const sy = rawY.endsWith('%') ? parseFloat(rawY) / 100 : parseFloat(rawY)
                    if (sx > 0) {
                        scaleX *= sx
                    }
                    if (sy > 0) {
                        scaleY *= sy
                    }
                }
            }

            const csZoom = (cs as unknown as { zoom?: string }).zoom || ''
            const inlineZoom = (curEl as HTMLElement).style?.zoom || ''
            const zoomProp = (csZoom && csZoom !== 'normal' && csZoom !== '1') ? csZoom : inlineZoom
            if (zoomProp && zoomProp !== 'normal' && zoomProp !== '1') {
                const z = zoomProp.endsWith('%') ? parseFloat(zoomProp) / 100 : parseFloat(zoomProp)
                if (z > 0) {
                    scaleX *= z
                    scaleY *= z
                }
            }

            curEl = curEl.parentElement
        }

        // Fallback when scale is only reflected in bounding rect vs layout size:
        // ignore <= 0.5px differences caused by integer rounding of offsetWidth/offsetHeight on unscaled fractional frames.
        if (htmlFrame.offsetWidth > 0 && fr.width > 0 && Math.abs(fr.width - htmlFrame.offsetWidth * scaleX) > 0.5) {
            scaleX = fr.width / htmlFrame.offsetWidth
        }
        if (htmlFrame.offsetHeight > 0 && fr.height > 0 && Math.abs(fr.height - htmlFrame.offsetHeight * scaleY) > 0.5) {
            scaleY = fr.height / htmlFrame.offsetHeight
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
        const { scaleX, scaleY } = getFrameScale(frameEl, fr, win.parent)
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
