/**
 * Get the position and size of a visible element in the viewport, in CSS pixels, or null when it is not rendered or
 * hidden (for example a `hideAfterFirstScroll` element). For the ignore regions of a full page screenshot of a page
 * where a container scrolls (#125)
 */
export default function getVisibleElementViewportRect(element: HTMLElement): { x: number, y: number, width: number, height: number } | null {
    const isVisible = typeof element.checkVisibility === 'function'
        ? element.checkVisibility({ visibilityProperty: true, checkVisibilityCSS: true })
        : element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden'
    if (!isVisible) {
        return null
    }
    let { left, top, right, bottom } = element.getBoundingClientRect()
    // The parts of the element outside an ancestor that clips its overflow (the scroll container) are not in the
    // screenshot. The body and the root element pass their overflow to the viewport, and the ancestors of a fixed
    // element do not clip it
    if (getComputedStyle(element).position !== 'fixed') {
        for (let ancestor = element.parentElement; ancestor && ancestor !== document.body && ancestor !== document.documentElement; ancestor = ancestor.parentElement) {
            const style = getComputedStyle(ancestor)
            if (style.overflowX !== 'visible' || style.overflowY !== 'visible') {
                const box = ancestor.getBoundingClientRect()
                if (style.overflowX !== 'visible') {
                    left = Math.max(left, box.left + (parseFloat(style.borderLeftWidth) || 0))
                    right = Math.min(right, box.right - (parseFloat(style.borderRightWidth) || 0))
                }
                if (style.overflowY !== 'visible') {
                    top = Math.max(top, box.top + (parseFloat(style.borderTopWidth) || 0))
                    bottom = Math.min(bottom, box.bottom - (parseFloat(style.borderBottomWidth) || 0))
                }
            }
            if (style.position === 'fixed') {
                break
            }
        }
    }
    if (right <= left || bottom <= top) {
        return null
    }

    return { x: left, y: top, width: right - left, height: bottom - top }
}
