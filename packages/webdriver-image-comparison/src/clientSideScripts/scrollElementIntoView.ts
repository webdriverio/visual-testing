/**
 * Scroll the element into the top of the viewport
 */
export default function scrollElementIntoView(element: HTMLElement, addressBarShadowPadding: number): number {
    let currentPosition = 0
    // Determine the current scroll position
    const htmlNode = document.querySelector('html')!
    const bodyNode = document.querySelector('body')!
    // If could be that we can't calculate the scroll position on the html but on the body node
    if (htmlNode.scrollTop > 0) {
        currentPosition = htmlNode.scrollTop
    }
    if (bodyNode.scrollTop > 0) {
        currentPosition = bodyNode.scrollTop
    }

    const { top } = element.getBoundingClientRect()
    // Add the extra padding for the address bar
    const yPosition = top - addressBarShadowPadding

    // Now scroll to the top of the screen
    if (htmlNode.scrollHeight > htmlNode.clientHeight) {
        htmlNode.scrollTop = yPosition
        // Did we scroll to the right position?
        if (htmlNode.scrollTop === yPosition) {
            return currentPosition
        }
    }

    // If not then try the body
    if (bodyNode.scrollHeight > bodyNode.clientHeight) {
        bodyNode.scrollTop = yPosition
        // Did we scroll to the right position?
        if (bodyNode.scrollTop === yPosition) {
            return currentPosition
        }
    }

    return currentPosition
}
