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

    return {
        top: rect.top + container.clientTop,
        left: rect.left + container.clientLeft,
        width: container.clientWidth,
        height: container.clientHeight,
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
        viewportWidth: document.documentElement.clientWidth || window.innerWidth,
        viewportHeight: window.innerHeight,
    }
}
