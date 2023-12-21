/**
 * Get the document scroll height, this means the actual height of the page from the top to the bottom of the DOM
 */
export default function getDocumentScrollHeight(): number {
    const viewPortHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    const scrollHeight = document.documentElement.scrollHeight
    const bodyScrollHeight = document.body.scrollHeight

    // In some situations the default scrollheight can be equal to the viewport height
    // but the body scroll height can be different, then return that one
    if (viewPortHeight === scrollHeight && bodyScrollHeight > scrollHeight) {
        return bodyScrollHeight
    }

    // In some cases we can have a challenge determining the height of the page
    // due to for example a `vh` property on the body element.
    // If that is the case we need to walk over all the elements and determine the highest element
    // this is a very time consuming thing, so our last hope :(
    let pageHeight = 0
    let largestNodeElement = document.querySelector('body')

    if (bodyScrollHeight === scrollHeight && bodyScrollHeight === viewPortHeight) {
        findHighestNode(document.documentElement.childNodes)

        // There could be some elements above this largest element,
        // add that on top
        /* istanbul ignore next */
        return pageHeight + largestNodeElement.getBoundingClientRect().top
    }

    // The scrollHeight is good enough
    return scrollHeight

    /**
   * Find the largest html element on the page
   * @param nodesList
   */
    function findHighestNode(nodesList: any) {
        for (let i = nodesList.length - 1; i >= 0; i--) {
            const currentNode = nodesList[i]

            /* istanbul ignore next */
            if (currentNode.scrollHeight && currentNode.clientHeight) {
                const elHeight = Math.max(currentNode.scrollHeight, currentNode.clientHeight)
                pageHeight = Math.max(elHeight, pageHeight)
                if (elHeight === pageHeight) {
                    largestNodeElement = currentNode
                }
            }

            if (currentNode.childNodes.length) {
                findHighestNode(currentNode.childNodes)
            }
        }
    }
}
