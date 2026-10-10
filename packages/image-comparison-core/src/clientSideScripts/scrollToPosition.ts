/**
 * Scroll to y = variable position in the screen.
 * Returns the scroll position before the scroll, so the caller can scroll back to it.
 */
/* istanbul ignore next */
export default function scrollToPosition(yPosition: number): number {
    const htmlNode = document.querySelector('html')!
    const bodyNode = document.querySelector('body')!
    const scrollingElement = document.scrollingElement || document.documentElement
    // Only the element that scrolls has a position, the others stay at 0
    const previousPosition = Math.max(htmlNode.scrollTop, bodyNode.scrollTop, scrollingElement.scrollTop)

    if (htmlNode.scrollHeight > htmlNode.clientHeight) {
        htmlNode.scrollTop = yPosition
        // Did we scroll to the right position?
        if (htmlNode.scrollTop === yPosition) {
            return previousPosition
        }
    }

    // If not then try the body
    if (bodyNode.scrollHeight > bodyNode.clientHeight) {
        bodyNode.scrollTop = yPosition
        // Did we scroll to the right position?
        if (bodyNode.scrollTop === yPosition) {
            return previousPosition
        }
    }

    // If not then try the document
    scrollingElement.scrollTop = yPosition

    return previousPosition
}
