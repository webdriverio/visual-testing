/**
 * Prepare a scroll container for the screenshots of a full page screenshot, or put it back as it was (#125):
 * - turn off scroll snap, so that the container stops at the scroll position of each screenshot (an inline
 *   `!important` value wins over every value of the page),
 * - hide its scrollbar, as `hideScrollBars` does for the page.
 */
export default function prepareScrollContainer(container: HTMLElement, prepare: boolean, hideScrollbar: boolean): void {
    const scrollbarAttribute = 'data-wic-scroll-container'
    const snapAttribute = 'data-wic-scroll-snap-type'
    const styleId = 'wic-scroll-container-style'

    if (!prepare) {
        const saved = container.getAttribute(snapAttribute)
        if (saved !== null) {
            const [value, priority] = JSON.parse(saved)
            if (value) {
                container.style.setProperty('scroll-snap-type', value, priority)
            } else {
                container.style.removeProperty('scroll-snap-type')
            }
            container.removeAttribute(snapAttribute)
        }
        if (hideScrollbar) {
            container.removeAttribute(scrollbarAttribute)
            document.getElementById(styleId)?.remove()
        }
        return
    }

    container.setAttribute(snapAttribute, JSON.stringify([
        container.style.getPropertyValue('scroll-snap-type'),
        container.style.getPropertyPriority('scroll-snap-type'),
    ]))
    container.style.setProperty('scroll-snap-type', 'none', 'important')

    if (hideScrollbar) {
        container.setAttribute(scrollbarAttribute, '')
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style')
            style.id = styleId
            style.textContent = `[${scrollbarAttribute}] { scrollbar-width: none !important; } [${scrollbarAttribute}]::-webkit-scrollbar { display: none !important; }`
            document.head.appendChild(style)
        }
    }
}
