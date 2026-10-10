/**
 * Scroll a scroll container to y = position, without a smooth scroll animation of the page, and return the position
 * that the container has after the scroll (the browser stops at the end of the content)
 */
export default function scrollContainerTo(container: HTMLElement, yPosition: number): number {
    const value = container.style.getPropertyValue('scroll-behavior')
    const priority = container.style.getPropertyPriority('scroll-behavior')
    // An inline `!important` value wins over every value of the page
    container.style.setProperty('scroll-behavior', 'auto', 'important')
    container.scrollTop = yPosition
    const scrollTop = container.scrollTop
    if (value) {
        container.style.setProperty('scroll-behavior', value, priority)
    } else {
        container.style.removeProperty('scroll-behavior')
    }

    return scrollTop
}
