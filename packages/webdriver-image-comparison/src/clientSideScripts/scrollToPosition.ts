/**
 * Scroll to y = variable position in the screen
 */
/* istanbul ignore next */
export default function scrollToPosition(yPosition: number): void {
    const htmlNode = document.querySelector('html')
    const bodyNode = document.querySelector('body')

    if (htmlNode.scrollHeight > htmlNode.clientHeight) {
        htmlNode.scrollTop = yPosition
        // Did we scroll to the right position?
        if (htmlNode.scrollTop === yPosition) {
            return
        }
    }

    // If not then try the body
    if (bodyNode.scrollHeight > bodyNode.clientHeight) {
        bodyNode.scrollTop = yPosition
        // Did we scroll to the right position?
        if (bodyNode.scrollTop === yPosition) {
            return
        }
    }

    // If not then try the document
    (document.scrollingElement || document.documentElement).scrollTop = yPosition
}
