/**
 * Scroll the element into the top of the viewport
 */
export default function scrollElementIntoView(element: HTMLElement, addressBarShadowPadding: number): number {
    let currentPosition = 0
    const htmlNode = document.documentElement
    const bodyNode = document.body

    // Apply new global style
    const styleTag = document.createElement('style')
    styleTag.innerHTML = '* { scroll-behavior: unset !important; }'
    document.head.appendChild(styleTag)

    // Determine the current scroll position
    if (htmlNode.scrollTop > 0) {
        currentPosition = htmlNode.scrollTop
    } else if (bodyNode.scrollTop > 0) {
        currentPosition = bodyNode.scrollTop
    }

    const { top } = element.getBoundingClientRect()
    const yPosition = top - addressBarShadowPadding

    // Scroll to the position
    if (htmlNode.scrollHeight > htmlNode.clientHeight) {
        htmlNode.scrollTop = yPosition
    } else if (bodyNode.scrollHeight > bodyNode.clientHeight) {
        bodyNode.scrollTop = yPosition
    }

    // Remove the injected style
    document.head.removeChild(styleTag)

    return currentPosition
}
