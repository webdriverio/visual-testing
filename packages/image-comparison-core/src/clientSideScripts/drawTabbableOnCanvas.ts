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
   * read from the page, so it is not included. Where browsers do not agree, it follows Chrome.
   */
    type FocusableElement = HTMLElement | SVGElement | MathMLElement
    interface TabbableScope {
        // The tab index of the host, details element or slot of the scope: the scope is sorted at its place
        tabIndex: number
        candidates: TabbableCandidate[]
    }
    type TabbableCandidate = FocusableElement | TabbableScope

    /**
   * Get all tabbable elements in the order of the Tab key
   */
    function tabbable(): FocusableElement[] {
        const body = document.body
        // Nothing can get the focus in an inert page
        if (!body || isInert(document.documentElement) || isInert(body)) {
            return []
        }

        return keepOneRadioPerGroup(sortByTabOrder(getCandidates(Array.from(body.children))))
    }

    /**
   * Get the tabbable elements and the scopes (open shadow roots, details elements and slots) in tree order
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
                candidates.push(createScope(element, assigned.length > 0 ? assigned : Array.from(element.children)))
                continue
            }

            if (isFocusableKind(element) && isTabbable(element)) {
                candidates.push(element)
            }

            const shadowRoot = element.shadowRoot
            if (shadowRoot) {
                // A shadow host with a negative tabindex is skipped with its shadow tree
                if (!hasNegativeTabindexAttribute(element)) {
                    candidates.push(createScope(element, Array.from(shadowRoot.children)))
                }
            } else if (element instanceof HTMLDetailsElement) {
                // Browsers render a details element like a shadow host with a slot for its summary and a slot for its
                // other content, which is only rendered when the details element is open
                if (!hasNegativeTabindexAttribute(element)) {
                    const summary = getSummary(element)
                    const content = element.open ? Array.from(element.children).filter((child) => child !== summary) : []
                    candidates.push({
                        tabIndex: getScopeTabindex(element),
                        candidates: [createScope(null, summary ? [summary] : []), createScope(null, content)],
                    })
                }
            } else {
                candidates.push(...getCandidates(Array.from(element.children)))
            }
        }

        return candidates
    }

    /**
   * Create the scope of a host, details element or slot (sorted with its tab index), or a scope without its own
   * element (sorted like tabindex 0)
   */
    function createScope(scopeParent: Element | null, elements: Element[]): TabbableScope {
        return { tabIndex: scopeParent ? getScopeTabindex(scopeParent) : 0, candidates: getCandidates(elements) }
    }

    /**
   * Get the tab index that a scope is sorted with
   */
    function getScopeTabindex(scopeParent: Element): number {
        return isFocusableKind(scopeParent) ? Math.max(getTabindex(scopeParent), 0) : 0
    }

    /**
   * Sort the candidates of one scope: positive tabindex first (in tree order for the same value), then the others in
   * tree order. A scope is sorted at the place of its host, details element or slot.
   */
    function sortByTabOrder(candidates: TabbableCandidate[]): FocusableElement[] {
        const regular: FocusableElement[] = []
        const ordered: { documentOrder: number, tabIndex: number, content: FocusableElement[] }[] = []

        candidates.forEach((candidate, documentOrder) => {
            const isElement = candidate instanceof Element
            const content = isElement ? [candidate] : sortByTabOrder(candidate.candidates)
            const tabIndex = isElement ? Math.max(getTabindex(candidate), 0) : candidate.tabIndex

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
   * Keep one radio input per radio group: the checked radio input. When no radio input of the group is checked, or
   * when the checked radio input is not a tab stop, the first radio input of the group in the tab order.
   */
    function keepOneRadioPerGroup(elements: FocusableElement[]): FocusableElement[] {
        return elements.filter((element) => {
            if (!isGroupedRadio(element)) {
                return true
            }
            const group = elements.filter((other): other is HTMLInputElement => isGroupedRadio(other) && isSameRadioGroup(element, other))

            return (group.find((radio) => radio.checked) ?? group[0]) === element
        })
    }

    /**
   * Is the element a radio input with a name, so in a radio group
   */
    function isGroupedRadio(node: Element): node is HTMLInputElement {
        return node instanceof HTMLInputElement && node.type === 'radio' && node.name !== ''
    }

    /**
   * Are the radio inputs in the same group: the same tree (document or shadow root), the same form owner (also with
   * the form attribute) and the same name
   */
    function isSameRadioGroup(radio: HTMLInputElement, other: HTMLInputElement): boolean {
        return radio.name === other.name && radio.form === other.form && radio.getRootNode() === other.getRootNode()
    }

    /**
   * Is the element of a kind that can get the focus: HTML, SVG and MathML elements
   */
    function isFocusableKind(node: Element): node is FocusableElement {
        return node instanceof HTMLElement
            || node instanceof SVGElement
            || (typeof MathMLElement === 'function' && node instanceof MathMLElement)
    }

    /**
   * Is the element a tab stop
   */
    function isTabbable(node: FocusableElement): boolean {
        return isFocusableCandidate(node)
            && getTabindex(node) >= 0
            // A shadow host that delegates the focus is not a tab stop, the elements in its shadow tree are
            && !node.shadowRoot?.delegatesFocus
    }

    /**
   * Can the element get the focus: a focusable kind of element that is not disabled and is rendered
   */
    function isFocusableCandidate(node: FocusableElement): boolean {
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

        return (node.matches(candidateSelectors) || isSvgLink(node))
            && !node.matches(':disabled')
            // A details element with a summary is reached through its summary, unless it has its own tabindex
            && !(node instanceof HTMLDetailsElement && getSummary(node) && getTabindexAttribute(node) === null)
            && !isHidden(node)
    }

    /**
   * Is the element an SVG link, also with the old `xlink:href` attribute
   */
    function isSvgLink(node: FocusableElement): boolean {
        return node instanceof SVGElement
            && node.localName === 'a'
            && (node.hasAttribute('href') || node.hasAttributeNS('http://www.w3.org/1999/xlink', 'href'))
    }

    /**
   * Get the tab index of the node
   */
    function getTabindex(node: FocusableElement): number {
        const tabindexAttr = getTabindexAttribute(node)

        if (tabindexAttr !== null) {
            return tabindexAttr
        }
        // Browsers do not return `tabIndex` correctly for contentEditable nodes and details elements,
        // so if they don't have a tabindex attribute specifically set, assume it's 0.
        if ((node instanceof HTMLElement && node.contentEditable === 'true') || node instanceof HTMLDetailsElement) {
            return 0
        }

        return node.tabIndex
    }

    /**
   * Get the value of a valid tabindex attribute, or null
   */
    function getTabindexAttribute(node: Element): number | null {
        const tabindexAttr = parseInt(node.getAttribute('tabindex') ?? '', 10)

        return isNaN(tabindexAttr) ? null : tabindexAttr
    }

    /**
   * Has the element a negative tabindex attribute
   */
    function hasNegativeTabindexAttribute(node: Element): boolean {
        const tabindexAttr = getTabindexAttribute(node)

        return tabindexAttr !== null && tabindexAttr < 0
    }

    /**
   * Is the element inert: the element and its subtree can not get the focus, so the subtree is skipped
   */
    function isInert(node: Element): boolean {
        return node.hasAttribute('inert')
    }

    /**
   * Get the summary of the details element: its first summary child
   */
    function getSummary(node: HTMLDetailsElement): Element | undefined {
        return Array.from(node.children).find((child) => child.tagName === 'SUMMARY')
    }

    /**
   * Is the node hidden: not rendered (also in a hidden ancestor or in a `content-visibility: hidden` subtree, like the
   * content of a closed details element), or `visibility: hidden`.
   * Not `offsetParent`, which is also `null` for elements with `position: fixed`
   */
    function isHidden(node: Element): boolean {
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
