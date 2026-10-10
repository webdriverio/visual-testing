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
    const { x, y, width, height } = element.getBoundingClientRect()

    return { x, y, width, height }
}
