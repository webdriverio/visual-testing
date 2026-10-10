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
   * Below code is based on https://github.com/davidtheclark/tabbable (version 6), and is modified to work inside the
   * browser: the original module can not be injected.
   * It follows the sequential focus navigation of the browser: open shadow roots and slots are own scopes, which are
   * sorted at the place of their host or slot (#515). The content of closed shadow roots and of iframes can not be
   * read from the page, so it is not included.
   */
    interface TabbableScope {
        scopeParent: Element
        candidates: TabbableCandidate[]
    }
    type TabbableCandidate = HTMLElement | TabbableScope

    /**
   * Get all tabbable elements in the order of the Tab key
   */
    function tabbable(): HTMLElement[] {
        return sortByTabOrder(getCandidates(Array.from(document.body?.children ?? [])))
    }

    /**
   * Get the tabbable elements and the scopes (open shadow roots and slots) in tree order
   */
    function getCandidates(elements: Element[]): TabbableCandidate[] {
        const candidates: TabbableCandidate[] = []

        for (const element of elements) {
            // An inert element and its subtree can not be focused
            if (isInert(element)) {
                continue
            }

            if (element instanceof HTMLSlotElement) {
                // The assigned elements, or the fallback content of the slot when nothing is assigned
                const assigned = element.assignedElements({ flatten: true })
                candidates.push({ scopeParent: element, candidates: getCandidates(assigned.length > 0 ? assigned : Array.from(element.children)) })
                continue
            }

            if (element instanceof HTMLElement && isTabbable(element)) {
                candidates.push(element)
            }

            const shadowRoot = element.shadowRoot
            if (shadowRoot) {
                // A shadow host with a negative tabindex is skipped with its shadow tree
                if (!(element instanceof HTMLElement && hasNegativeTabindexAttribute(element))) {
                    candidates.push({ scopeParent: element, candidates: getCandidates(Array.from(shadowRoot.children)) })
                }
            } else if (element instanceof HTMLDetailsElement && !element.open) {
                // The content of a closed details element is not rendered, only its summary
                const summary = Array.from(element.children).find((child) => child.tagName === 'SUMMARY')
                candidates.push(...getCandidates(summary ? [summary] : []))
            } else {
                candidates.push(...getCandidates(Array.from(element.children)))
            }
        }

        return candidates
    }

    /**
   * Sort the candidates of one scope: positive tabindex first (in tree order for the same value), then the others in
   * tree order. A scope is sorted at the place of its host or slot.
   */
    function sortByTabOrder(candidates: TabbableCandidate[]): HTMLElement[] {
        const regular: HTMLElement[] = []
        const ordered: { documentOrder: number, tabIndex: number, content: HTMLElement[] }[] = []

        candidates.forEach((candidate, documentOrder) => {
            const isScope = !(candidate instanceof HTMLElement)
            const element = isScope ? candidate.scopeParent : candidate
            const content = isScope ? sortByTabOrder(candidate.candidates) : [candidate]
            const tabIndex = element instanceof HTMLElement ? Math.max(getTabindex(element), 0) : 0

            if (tabIndex === 0) {
                regular.push(...content)
            } else {
                ordered.push({ documentOrder, tabIndex, content })
            }
        })

        return ordered
            .sort((a, b) => a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex)
            .flatMap(({ content }) => content)
            .concat(regular)
    }

    /**
   * Is the element a tab stop
   */
    function isTabbable(node: HTMLElement): boolean {
        return isFocusableCandidate(node)
            && getTabindex(node) >= 0
            && !isNonTabbableRadio(node)
            // A shadow host that delegates the focus is not a tab stop, the elements in its shadow tree are
            && !node.shadowRoot?.delegatesFocus
    }

    /**
   * Can the element get the focus: a focusable kind of element that is not disabled and is rendered
   */
    function isFocusableCandidate(node: HTMLElement): boolean {
        const candidateSelectors = [
            'input:not([type="hidden"])',
            'select',
            'textarea',
            'a[href]',
            'button',
            '[tabindex]',
            'audio[controls]',
            'video[controls]',
            '[contenteditable]:not([contenteditable="false"])',
            'details > summary:first-of-type',
            'details',
        ].join(',')

        return node.matches(candidateSelectors)
            && !node.matches(':disabled')
            // A details element with a summary is reached through its summary
            && !(node instanceof HTMLDetailsElement && hasSummary(node))
            && !isHidden(node)
    }

    /**
   * Get the tab index of the node
   */
    function getTabindex(node: HTMLElement): number {
        const tabindexAttr = parseInt(node.getAttribute('tabindex') ?? '', 10)

        if (!isNaN(tabindexAttr)) {
            return tabindexAttr
        }
        // Browsers do not return `tabIndex` correctly for contentEditable nodes and details elements,
        // so if they don't have a tabindex attribute specifically set, assume it's 0.
        if (node.contentEditable === 'true' || node instanceof HTMLDetailsElement) {
            return 0
        }

        return node.tabIndex
    }

    /**
   * Has the element a negative tabindex attribute
   */
    function hasNegativeTabindexAttribute(node: HTMLElement): boolean {
        const tabindexAttr = parseInt(node.getAttribute('tabindex') ?? '', 10)

        return !isNaN(tabindexAttr) && tabindexAttr < 0
    }

    /**
   * Is the element inert: the element and its subtree can not get the focus, so the subtree is skipped
   */
    function isInert(node: Element): boolean {
        return node.hasAttribute('inert')
    }

    /**
   * Has the details element a summary
   */
    function hasSummary(node: HTMLDetailsElement): boolean {
        return Array.from(node.children).some((child) => child.tagName === 'SUMMARY')
    }

    /**
   * Is the node a radio input that is not the tab stop of its group: the checked radio input of the group, or every
   * radio input of the group when none is checked
   */
    function isNonTabbableRadio(node: HTMLElement): boolean {
        if (!(node instanceof HTMLInputElement) || node.type !== 'radio' || !node.name) {
            return false
        }
        // The group is in the same form, or else in the same document or shadow root
        const scope = node.form ?? node.getRootNode()
        if (!(scope instanceof HTMLFormElement || scope instanceof Document || scope instanceof ShadowRoot)) {
            return false
        }
        const group = Array.from(scope.querySelectorAll('input[type="radio"]'))
            .filter((radio): radio is HTMLInputElement => radio instanceof HTMLInputElement && radio.name === node.name)
        const checked = group.find((radio) => radio.checked)

        return Boolean(checked) && checked !== node
    }

    /**
   * Is the node hidden: not rendered (also in a hidden ancestor or in a `content-visibility: hidden` subtree, like the
   * content of a closed details element), or `visibility: hidden`.
   * Not `offsetParent`, which is also `null` for elements with `position: fixed`
   */
    function isHidden(node: HTMLElement): boolean {
        if (typeof node.checkVisibility === 'function') {
            return !node.checkVisibility({ visibilityProperty: true, checkVisibilityCSS: true })
        }

        return node.getClientRects().length === 0 || getComputedStyle(node).visibility === 'hidden'
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
            return pageHeight + (largestNodeElement?.getBoundingClientRect().top ?? 0)
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
