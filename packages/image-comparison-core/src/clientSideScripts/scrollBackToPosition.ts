/**
 * Scroll back to y = position after a screenshot, in the same way as `scrollToPosition`,
 * but the scroll ignores `scroll-behavior: smooth` of the page: the page is at the position when the script returns,
 * and is not still moving when the next command runs
 */
export default function scrollBackToPosition(yPosition: number): void {
    const htmlNode = document.querySelector('html')!
    const bodyNode = document.querySelector('body')!
    const nodes = [htmlNode, bodyNode]
    const inlineValues = nodes.map((node) => ({
        value: node.style.getPropertyValue('scroll-behavior'),
        priority: node.style.getPropertyPriority('scroll-behavior'),
    }))
    // An inline `!important` value wins over every value of the page
    nodes.forEach((node) => node.style.setProperty('scroll-behavior', 'auto', 'important'))

    try {
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
    } finally {
        nodes.forEach((node, index) => {
            const { value, priority } = inlineValues[index]
            if (value) {
                node.style.setProperty('scroll-behavior', value, priority)
            } else {
                node.style.removeProperty('scroll-behavior')
            }
        })
    }
}
