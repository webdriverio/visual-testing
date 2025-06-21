import type { ElementCoordinate } from './drawTabbableOnCanvas.interfaces.js'
import type { CircleOptions, LineOptions, TabbableOptions } from '../commands/tabbable.interfaces.js'

/**
 * This method is based on this blog post
 * https://vivrichards.co.uk/accessibility/automating-page-tab-flows-using-visual-testing-and-javascript
 * by Viv Richards and optimized for using Canvas
 */
export default function drawTabbableOnCanvas(drawOptions: TabbableOptions) {
    // 1. Scroll to top of page
    window.scrollTo(0, 0)

    // 2. Insert canvas
    const width = window.innerWidth
    const height = getDocumentScrollHeight()
    const canvasNode = `<canvas id="wic-tabbable-canvas" width="${width}" height="${height}" style="position:absolute;top:0;left:0;z-index:999999;">`
    document.body.insertAdjacentHTML('afterbegin', canvasNode)

    // 3. Get all the elements
    const accessibleElements = tabbable()

    // 4a. Iterate over all accessibleElements and get the coordinates
    const elementCoordinates: ElementCoordinate[] = accessibleElements.map((node) => {
        const currentElement = node.getBoundingClientRect()

        return {
            x: currentElement.left + currentElement.width / 2,
            y: currentElement.top + currentElement.height / 2,
        }
    })
    // 4b. Add the starting coordinates
    elementCoordinates.unshift({ x: 0, y: 0 })
    // 4c. Iterate over all coordinates and draw lines and circles
    elementCoordinates.forEach((elementCoordinate, i) => {
        if (i === 0) {
            return
        }

        drawLine(drawOptions.line!, elementCoordinates[i - 1], elementCoordinate)
        drawCircleAndNumber(drawOptions.circle!, elementCoordinate, i)
    })

    /**
   * Draw a line
   */
    function drawLine(options: LineOptions, start: ElementCoordinate, end: ElementCoordinate): void {
        const tabbableCanvasContext = (<HTMLCanvasElement>document.getElementById('wic-tabbable-canvas')).getContext('2d')

        if (!tabbableCanvasContext) {
            return
        }

        // Draw the line
        tabbableCanvasContext.beginPath()
        tabbableCanvasContext.globalCompositeOperation = 'destination-over'
        tabbableCanvasContext.lineWidth = options.width!
        tabbableCanvasContext.strokeStyle = options.color!
        tabbableCanvasContext.moveTo(start.x, start.y)
        tabbableCanvasContext.lineTo(end.x, end.y)
        tabbableCanvasContext.stroke()
    }

    /**
   * Draw a circle
   */
    function drawCircleAndNumber(options: CircleOptions, position: ElementCoordinate, i: number): void {
        const tabbableCanvasContext = (<HTMLCanvasElement>document.getElementById('wic-tabbable-canvas')).getContext('2d')

        if (!tabbableCanvasContext) {
            return
        }

        // Draw circle
        tabbableCanvasContext.beginPath()
        tabbableCanvasContext.globalCompositeOperation = 'source-over'
        tabbableCanvasContext.fillStyle = options.backgroundColor!
        tabbableCanvasContext.arc(position.x, position.y, options.size!, 0, Math.PI * 2, true)
        tabbableCanvasContext.fill()
        // Draw border
        tabbableCanvasContext.lineWidth = options.borderWidth!
        tabbableCanvasContext.strokeStyle = options.borderColor!
        tabbableCanvasContext.stroke()

        if (options.showNumber) {
            // Set the text
            tabbableCanvasContext.font = `${options.fontSize}px ${options.fontFamily}`
            tabbableCanvasContext.textAlign = 'center'
            tabbableCanvasContext.textBaseline = 'middle'
            tabbableCanvasContext.fillStyle = options.fontColor!
            tabbableCanvasContext.fillText(i.toString(), position.x, position.y)
        }
    }

    /**
   * Below code is coming from https://github.com/davidtheclark/tabbable
   * and is modified a bit to work inside the browser.
   * The original module couldn't be used for injection and didn't support TypeScript
   */

    /**
   * Get all tabbable elements based on tabindex and then regular dom order
   */
    function tabbable(): HTMLElement[] {
        const regularTabbables = []
        const orderedTabbables = []
        const candidateSelectors = [
            'input',
            'select',
            'textarea',
            'a[href]',
            'button',
            '[tabindex]',
            'audio[controls]',
            'video[controls]',
            '[contenteditable]:not([contenteditable="false"])',
        ].join(',')
        const candidates: NodeListOf<HTMLElement> = document.querySelectorAll(candidateSelectors)

        for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i]

            if (!isNodeMatchingSelectorTabbable(candidate)) {
                continue
            }

            const candidateTabindex = getTabindex(candidate)

            if (candidateTabindex === 0) {
                regularTabbables.push(candidate)
            } else {
                orderedTabbables.push({
                    documentOrder: i,
                    tabIndex: candidateTabindex,
                    node: candidate,
                })
            }
        }

        return Array.prototype.slice.call(
            orderedTabbables
                .sort(<any>sortOrderedTabbables)
                .map((a) => a.node)
                .concat(regularTabbables),
        )
    }

    /**
   * Is the node tabbable
   */
    function isNodeMatchingSelectorTabbable(node: HTMLElement): boolean {
        return !(!isNodeMatchingSelectorFocusable(node) || isNonTabbableRadio(node) || getTabindex(node) < 0)
    }

    /**
   * Check if the node has a focused state
   */
    function isNodeMatchingSelectorFocusable(node: HTMLElement): boolean {
        return !(node.hasAttribute('disabled') || node.getAttribute('disabled') || isHiddenInput(node) || isHidden(node))
    }

    /**
   * Get the tab index of the node
   */
    function getTabindex(node: HTMLElement): number {
        const tabindexAttr = parseInt(node.getAttribute('tabindex')!, 10)

        if (!isNaN(tabindexAttr)) {
            return tabindexAttr
        }
        // Browsers do not return `tabIndex` correctly for contentEditable nodes;
        // so if they don't have a tabindex attribute specifically set, assume it's 0.
        // TODO: Lines 173-174 are currently untestable with the current setup
        // The radio input with no name case is hard to test through the public API
        if (isContentEditable(node)) {
            return 0
        }

        return node.tabIndex
    }

    /**
   * Return ordered tabbable nodes
   */
    function sortOrderedTabbables(nodeA: HTMLElement, nodeB: HTMLElement): number {
        // TODO: Lines 187-191 are currently untestable with the current setup
        // The findHighestNode function is hard to test through the public API
        return nodeA.tabIndex === nodeB.tabIndex
            ? // This is so bad :(, fix this!
            (<any>nodeA).documentOrder - (<any>nodeB).documentOrder
            : nodeA.tabIndex - nodeB.tabIndex
    }

    /**
   * Is the content editable
   */
    function isContentEditable(node: HTMLElement): boolean {
        return node.contentEditable === 'true'
    }

    /**
   * Is the node an input
   */
    function isInput(node: HTMLElement): boolean {
        return node.tagName === 'INPUT'
    }

    /**
   * Is the input hidden
   */
    function isHiddenInput(node: HTMLElement): boolean {
        return isInput(node) && (<HTMLInputElement>node).type === 'hidden'
    }

    /**
   * Is the node a radio input
   */
    function isRadio(node: HTMLElement): boolean {
        return isInput(node) && (<HTMLInputElement>node).type === 'radio'
    }

    /**
   * Is the node a radio input and can it be tabbed
   */
    function isNonTabbableRadio(node: HTMLElement): boolean {
        return isRadio(node) && !isTabbableRadio(<HTMLInputElement>node)
    }

    /**
   * Get the checked radio input
   */
    // @ts-ignore
    function getCheckedRadio(nodes: HTMLInputElement[]) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].checked) {
                return nodes[i]
            }
        }
    }

    /**
   * Is the radio input tabbable
   */
    function isTabbableRadio(node: HTMLInputElement): boolean {
        if (!node.name) {
            return true
        }
        // This won't account for the edge case where you have radio groups with the same
        // in separate forms on the same page.
        // This is bad :(, but don't know how to fix this typing
        const radioSet = (<any>node.ownerDocument).querySelectorAll(`input[type="radio"][name="${node.name}"]`)
        const checked = getCheckedRadio(radioSet)

        return !checked || checked === node
    }

    /**
   * Is the node hidden
   */
    function isHidden(node: HTMLElement): boolean {
        // offsetParent being null will allow detecting cases where an element is invisible or inside an invisible element,
        // as long as the element does not use position: fixed. For them, their visibility has to be checked directly as well.
        return node.offsetParent === null || getComputedStyle(node).visibility === 'hidden'
    }

    /**
   * Get the document scroll height
   */
    function getDocumentScrollHeight(): number {
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

        // TODO: Lines 288-293 are currently untestable with the current setup
        if (bodyScrollHeight === scrollHeight && bodyScrollHeight === viewPortHeight) {
            findHighestNode(document.documentElement.childNodes)

            // There could be some elements above this largest element,
            // add that on top
            return pageHeight + largestNodeElement?.getBoundingClientRect().top!
        }

        // The scrollHeight is good enough
        return scrollHeight

        /**
        * Find the largest html element on the page
        */
        // This is so bad :(, fix the typings!!!
        function findHighestNode(nodesList: any) {
            // TODO: Lines 304-319 are currently untestable with the current setup
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
}
