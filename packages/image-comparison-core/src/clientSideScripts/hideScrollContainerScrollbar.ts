/**
 * Hide or show the scrollbar of a scroll container, as `hideScrollBars` does for the page
 */
export default function hideScrollContainerScrollbar(container: HTMLElement, hide: boolean): void {
    const attribute = 'data-wic-scroll-container'
    const styleId = 'wic-scroll-container-style'

    if (!hide) {
        container.removeAttribute(attribute)
        document.getElementById(styleId)?.remove()
        return
    }

    container.setAttribute(attribute, '')
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style')
        style.id = styleId
        style.textContent = `[${attribute}] { scrollbar-width: none !important; } [${attribute}]::-webkit-scrollbar { display: none !important; }`
        document.head.appendChild(style)
    }
}
