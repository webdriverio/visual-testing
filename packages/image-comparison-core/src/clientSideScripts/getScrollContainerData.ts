/**
 * Get the visible content box of a scroll container in the viewport (CSS pixels, without borders and scrollbars)
 * and its scroll data, for a full page screenshot of a page where a container scrolls (#125)
 */
export default function getScrollContainerData(container: HTMLElement): {
    top: number
    left: number
    width: number
    height: number
    scrollTop: number
    scrollHeight: number
    viewportWidth: number
    viewportHeight: number
} {
    const rect = container.getBoundingClientRect()
    // `clientTop`, `clientHeight` and the other client values are rounded to whole pixels, the bounding box and the
    // computed borders are not (at DPR 2.625 a 6px border is 5.714px): use them for the exact content box
    const style = getComputedStyle(container)
    const borderTop = parseFloat(style.borderTopWidth) || 0
    const borderRight = parseFloat(style.borderRightWidth) || 0
    const borderBottom = parseFloat(style.borderBottomWidth) || 0
    const borderLeft = parseFloat(style.borderLeftWidth) || 0
    // A scrollbar that takes space (not an overlay scrollbar) has whole pixels; at the left side in a right to left page
    const scrollbarWidth = Math.max(0, container.offsetWidth - container.clientWidth - Math.round(borderLeft) - Math.round(borderRight))
    const scrollbarHeight = Math.max(0, container.offsetHeight - container.clientHeight - Math.round(borderTop) - Math.round(borderBottom))
    const leftScrollbar = Math.max(0, container.clientLeft - Math.round(borderLeft))

    return {
        top: rect.top + borderTop,
        left: rect.left + borderLeft + leftScrollbar,
        width: rect.width - borderLeft - borderRight - scrollbarWidth,
        height: rect.height - borderTop - borderBottom - scrollbarHeight,
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
        viewportWidth: document.documentElement.clientWidth || window.innerWidth,
        viewportHeight: window.innerHeight,
    }
}
