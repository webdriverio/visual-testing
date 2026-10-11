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
    // screenshot. An ancestor clips the element only when it is in the chain of containing blocks of the element: an
    // absolute element escapes the static ancestors below its positioned ancestor, a fixed element escapes all
    // ancestors below one with a transform (or a filter, contain, ...). The body and the root element pass their
    // overflow to the viewport, so they are not used
    const isNone = (value: string) => !value || value === 'none' || value === 'normal'
    // The properties that make an element the containing block of its absolute and fixed descendants
    const containsFixed = (style: CSSStyleDeclaration) => ['transform', 'translate', 'rotate', 'scale', 'perspective', 'filter', 'backdrop-filter', 'container-type']
        .some((name) => !isNone(style.getPropertyValue(name)))
        || /paint|layout|strict|content/.test(style.getPropertyValue('contain'))
        || /auto|hidden/.test(style.getPropertyValue('content-visibility'))
        || /transform|translate|rotate|scale|perspective|filter/.test(style.getPropertyValue('will-change'))
    let position = getComputedStyle(element).position
    for (let ancestor = element.parentElement; ancestor && ancestor !== document.body && ancestor !== document.documentElement; ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor)
        const isContainingBlock = position === 'fixed'
            ? containsFixed(style)
            : position === 'absolute'
                ? style.position !== 'static' || containsFixed(style)
                : true
        if (!isContainingBlock) {
            continue
        }
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
        position = style.position
    }
    if (right <= left || bottom <= top) {
        return null
    }

    return { x: left, y: top, width: right - left, height: bottom - top }
}
