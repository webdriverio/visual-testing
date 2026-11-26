import type { ElementCoordinate } from './drawTabbableOnCanvas.interfaces.js'
import type { CircleOptions, LineOptions, TabbableOptions } from '../commands/tabbable.interfaces.js'

/**
 * This method is based on this blog post
 * https://vivrichards.co.uk/accessibility/automating-page-tab-flows-using-visual-testing-and-javascript
 * by Viv Richards and optimized for using Canvas
 */
export default function drawTabbableOnCanvas(drawOptions: TabbableOptions) {
    // Browsers do not agree on some tab stops (scroll containers, modal dialogs, editable pages), and no API tells which
    // rule a browser uses, so these rules use the engine of the browser
    const engine = getEngine()
    // With a modal dialog, the rest of the page is inert: only the top modal dialog can get the focus
    const topModalDialog = getTopModalDialog()

    // 1. Scroll to top of page
    window.scrollTo(0, 0)

    // 2. Insert canvas
    const width = window.innerWidth
    const height = getDocumentScrollHeight()
    const canvasNode = `<canvas id="wic-tabbable-canvas" width="${width}" height="${height}" style="position:absolute;top:0;left:0;z-index:999999;">`
    document.body.insertAdjacentHTML('afterbegin', canvasNode)
    if (topModalDialog) {
        // A modal dialog is in the top layer, above every z-index: the drawing must be in the top layer too
        moveCanvasToTopLayer(width, height)
    }

    // 3. Get all the elements
    const accessibleElements = tabbable()

    // 4a. Iterate over all accessibleElements and get the coordinates
    const elementCoordinates: ElementCoordinate[] = accessibleElements.map((node) => getStopCenter(node))
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
   * Put the canvas in the top layer (as a popover) above the modal dialog. It stays at the top of the page, so it
   * scrolls with the page as before. Browsers without popovers keep the canvas where it is.
   */
    function moveCanvasToTopLayer(canvasWidth: number, canvasHeight: number): void {
        const canvas = document.getElementById('wic-tabbable-canvas')
        if (!(canvas instanceof HTMLCanvasElement) || typeof canvas.showPopover !== 'function') {
            return
        }

        canvas.setAttribute('popover', 'manual')
        // Remove the default popover styles (fixed in the center, with a border, a padding and a background)
        Object.assign(canvas.style, {
            position: 'absolute', inset: 'auto', top: '0', left: '0', margin: '0', border: '0', padding: '0',
            background: 'transparent', overflow: 'visible', width: `${canvasWidth}px`, height: `${canvasHeight}px`,
        })
        canvas.showPopover()
    }

    /**
   * Get the center of a tab stop, where its number is drawn. An area of an image map has no box of its own: it is on
   * its image.
   */
    function getStopCenter(node: FocusableElement): ElementCoordinate {
        const image = node instanceof HTMLAreaElement ? getAreaImage(node) : undefined
        if (node instanceof HTMLAreaElement && image) {
            return getAreaCenter(node, image)
        }
        const rect = node.getBoundingClientRect()

        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    }

    /**
   * Get the center of the shape of an area on its image. The coords are CSS pixels from the top left corner of the
   * border box of the image (as Chrome hit-tests them), and they follow the scale of the image (a CSS transform, also on
   * an ancestor). A rotation is not taken into account.
   */
    function getAreaCenter(area: HTMLAreaElement, image: HTMLImageElement): ElementCoordinate {
        const rect = image.getBoundingClientRect()
        const scaleX = image.offsetWidth > 0 ? rect.width / image.offsetWidth : 1
        const scaleY = image.offsetHeight > 0 ? rect.height / image.offsetHeight : 1
        const point = (x: number, y: number): ElementCoordinate => ({ x: rect.left + x * scaleX, y: rect.top + y * scaleY })
        const coords = (area.getAttribute('coords') ?? '').split(/[\s,]+/).filter((value) => value !== '').map(Number)
        const shape = (area.getAttribute('shape') ?? 'rect').toLowerCase()
        const imageCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }

        if (coords.some((value) => isNaN(value))) {
            return imageCenter
        }
        if ((shape === 'rect' || shape === 'rectangle') && coords.length >= 4) {
            return point((coords[0] + coords[2]) / 2, (coords[1] + coords[3]) / 2)
        }
        if ((shape === 'circle' || shape === 'circ') && coords.length >= 3) {
            return point(coords[0], coords[1])
        }
        if ((shape === 'poly' || shape === 'polygon') && coords.length >= 6) {
            const points = Math.floor(coords.length / 2)
            const sum = { x: 0, y: 0 }
            for (let i = 0; i < points; i++) {
                sum.x += coords[i * 2]
                sum.y += coords[i * 2 + 1]
            }
            return point(sum.x / points, sum.y / points)
        }

        // `default` and incomplete coords: the whole image
        return imageCenter
    }

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
   * read from the page, so it is not included. Where browsers do not agree, it follows Chrome, except for the rules that
   * differ per engine: scroll containers, open dialogs, and editable `html`, `body` and design mode pages.
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
        // A page in design mode is edited as a whole: Chrome stops only at the body, Firefox and Safari nowhere
        if (document.designMode === 'on') {
            const body = document.body
            const isBodyStop = engine === 'blink' && body && !isInert(document.documentElement) && !isInert(body) && !isHidden(body)

            return isBodyStop ? [body] : []
        }

        // Start at the top modal dialog, or at the html element: the html and body elements can be tab stops too (for
        // example with a tabindex), and an inert html or body element makes the page inert
        return keepOneRadioPerGroup(sortByTabOrder(getCandidates([topModalDialog ?? document.documentElement])))
    }

    /**
   * Get the browser engine
   */
    function getEngine(): 'blink' | 'gecko' | 'webkit' {
        const { userAgent } = navigator
        if (/(?:Chrome|Chromium)\/\d/.test(userAgent)) {
            return 'blink'
        }
        if (/Firefox\/\d/.test(userAgent)) {
            return 'gecko'
        }

        // Safari, and every browser on iOS
        return 'webkit'
    }

    /**
   * Get the top modal dialog, also in open shadow roots. With more than one, only the top one is not inert: a hit
   * test in its center finds it.
   */
    function getTopModalDialog(): HTMLDialogElement | undefined {
        const dialogs = getModalDialogs(document)

        return dialogs.length > 1 ? (dialogs.find((dialog) => isHitInCenter(dialog)) ?? dialogs[dialogs.length - 1]) : dialogs[0]
    }

    /**
   * Get the open modal dialogs of a document or shadow root, and of the open shadow roots in it
   */
    function getModalDialogs(root: Document | ShadowRoot): HTMLDialogElement[] {
        const dialogs: HTMLDialogElement[] = []
        for (const element of Array.from(root.querySelectorAll('*'))) {
            if (element instanceof HTMLDialogElement && element.open && isModal(element)) {
                dialogs.push(element)
            }
            if (element.shadowRoot) {
                dialogs.push(...getModalDialogs(element.shadowRoot))
            }
        }

        return dialogs
    }

    /**
   * Is the dialog modal (`showModal()`)
   */
    function isModal(dialog: HTMLDialogElement): boolean {
        try {
            return dialog.matches(':modal')
        } catch {
            // A browser without `:modal`
            return false
        }
    }

    /**
   * Does a hit test in the center of the element (in the viewport) find the element or an element in it
   */
    function isHitInCenter(element: Element): boolean {
        const root = element.getRootNode()
        if (!(root instanceof Document || root instanceof ShadowRoot) || typeof root.elementFromPoint !== 'function') {
            return false
        }
        const rect = element.getBoundingClientRect()
        const x = Math.min(Math.max(rect.left + rect.width / 2, 0), window.innerWidth - 1)
        const y = Math.min(Math.max(rect.top + rect.height / 2, 0), window.innerHeight - 1)
        const hit = root.elementFromPoint(x, y)

        return hit !== null && element.contains(hit)
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
                // The assigned elements, or the fallback content of the slot when nothing is assigned. A slot with a
                // negative tabindex is skipped with its content
                if (!hasNegativeTabindexAttribute(element)) {
                    const assigned = element.assignedElements({ flatten: true })
                    candidates.push(createScope(element, assigned.length > 0 ? assigned : Array.from(element.children)))
                }
                continue
            }

            const content = getContentCandidates(element)
            if (isFocusableKind(element) && (isTabbable(element) || isScrollContainerStop(element, content))) {
                candidates.push(element)
            }
            candidates.push(...content)
        }

        return candidates
    }

    /**
   * Get the tabbable elements and the scopes in the element: its shadow tree, the summary and content of a details
   * element, or its children
   */
    function getContentCandidates(element: Element): TabbableCandidate[] {
        if (element.shadowRoot) {
            // A shadow host with a negative tabindex is skipped with its shadow tree
            return hasNegativeTabindexAttribute(element) ? [] : [createScope(element, Array.from(element.shadowRoot.children))]
        }
        if (element instanceof HTMLDetailsElement) {
            // Browsers render a details element like a shadow host with a slot for its summary and a slot for its
            // other content, which is only rendered when the details element is open
            if (hasNegativeTabindexAttribute(element)) {
                return []
            }
            const summary = getSummary(element)
            const content = element.open ? Array.from(element.children).filter((child) => child !== summary) : []

            return [{
                tabIndex: getScopeTabindex(element),
                candidates: [createScope(null, summary ? [summary] : []), createScope(null, content)],
            }]
        }

        return getCandidates(Array.from(element.children))
    }

    /**
   * Is the element a scroll container that the browser makes a tab stop, so the keyboard can scroll it: in Chrome
   * (version 130 and newer) when no tab stop is in it, in Firefox always, in Safari never. With a tabindex attribute,
   * the tabindex decides.
   */
    function isScrollContainerStop(node: FocusableElement, content: TabbableCandidate[]): boolean {
        const blinkVersion = Number(/(?:Chrome|Chromium)\/(\d+)/.exec(navigator.userAgent)?.[1] ?? 0)
        if (engine === 'webkit' || (engine === 'blink' && blinkVersion < 130)) {
            return false
        }
        if (node === document.documentElement || node === document.body || getTabindexAttribute(node) !== null) {
            return false
        }
        // A disabled control (for example a textarea) can not get the focus, also when it can scroll
        if (node.matches(':disabled')) {
            return false
        }
        if (!isScrollContainer(node) || isHidden(node)) {
            return false
        }

        return engine === 'gecko' || !hasTabStop(content)
    }

    /**
   * Can the user scroll the element: it has more content than its box in a direction that is `auto` or `scroll`
   */
    function isScrollContainer(node: Element): boolean {
        const canScrollY = node.scrollHeight > node.clientHeight
        const canScrollX = node.scrollWidth > node.clientWidth
        if (!canScrollY && !canScrollX) {
            return false
        }
        const style = getComputedStyle(node)
        const isScrollable = (value: string) => value === 'auto' || value === 'scroll' || value === 'overlay'

        return (canScrollY && isScrollable(style.overflowY)) || (canScrollX && isScrollable(style.overflowX))
    }

    /**
   * Is a tab stop in the candidates, also in their scopes
   */
    function hasTabStop(candidates: TabbableCandidate[]): boolean {
        return candidates.some((candidate) => candidate instanceof Element || hasTabStop(candidate.candidates))
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
   * A radio group is the radio inputs with the same name and the same form owner (also with the form attribute), or
   * without a form owner in the same tree (document or shadow root). A form owner is always in the tree of its radio
   * inputs, so the form owner or else the tree is the key of the groups.
   */
    function keepOneRadioPerGroup(elements: FocusableElement[]): FocusableElement[] {
        const groups = new Map<Node, Map<string, HTMLInputElement[]>>()

        for (const element of elements) {
            if (isGroupedRadio(element)) {
                const owner = element.form ?? element.getRootNode()
                const groupsByName = groups.get(owner) ?? new Map<string, HTMLInputElement[]>()
                groups.set(owner, groupsByName)
                const group = groupsByName.get(element.name)
                if (group) {
                    group.push(element)
                } else {
                    groupsByName.set(element.name, [element])
                }
            }
        }

        const radioStops = new Set<Element>()
        for (const groupsByName of groups.values()) {
            for (const group of groupsByName.values()) {
                radioStops.add(group.find((radio) => radio.checked) ?? group[0])
            }
        }

        return elements.filter((element) => !isGroupedRadio(element) || radioStops.has(element))
    }

    /**
   * Is the element a radio input with a name, so in a radio group
   */
    function isGroupedRadio(node: Element): node is HTMLInputElement {
        return node instanceof HTMLInputElement && node.type === 'radio' && node.name !== ''
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
            'area[href]',
            'button',
            '[tabindex]',
            'audio[controls]',
            'video[controls]',
            'details > summary:first-of-type',
            'details',
        ].join(',')

        return (node.matches(candidateSelectors) || isSvgLink(node) || isEditingHostStop(node) || isDialogStop(node))
            && !node.matches(':disabled')
            // A details element with a summary is reached through its summary, unless it has its own tabindex
            && !(node instanceof HTMLDetailsElement && getSummary(node) && getTabindexAttribute(node) === null)
            && !isLinkInEditableContent(node)
            // An area has no box: it is rendered when a rendered image uses its image map
            && (node instanceof HTMLAreaElement ? getAreaImage(node) !== undefined : !isHidden(node))
    }

    /**
   * Is the element editable: in an element with contenteditable, or in a page in design mode
   */
    function isEditable(node: Element): boolean {
        if (node instanceof HTMLElement && typeof node.isContentEditable === 'boolean') {
            return node.isContentEditable
        }
        // Without `isContentEditable` (jsdom), the nearest element with a valid contenteditable value decides
        for (let element: Element | null = node; element; element = element.parentElement) {
            const value = element.getAttribute('contenteditable')?.toLowerCase()
            if (value === '' || value === 'true' || value === 'plaintext-only') {
                return true
            }
            if (value === 'false') {
                return false
            }
        }

        return false
    }

    /**
   * Is the element the root of an editable region (an editing host), which is a tab stop. An editable element in
   * an editable parent is part of the region of its parent. Editable html and body elements are tab stops in Chrome and
   * Safari, not in Firefox.
   */
    function isEditingHostStop(node: FocusableElement): boolean {
        if (!isEditable(node)) {
            return false
        }
        if (node === document.documentElement || node === document.body) {
            return engine !== 'gecko'
        }

        return !node.parentElement || !isEditable(node.parentElement)
    }

    /**
   * Is the element a link without a tabindex in editable content: the user edits its text, so it is not a tab stop
   */
    function isLinkInEditableContent(node: FocusableElement): boolean {
        return node instanceof HTMLAnchorElement
            && getTabindexAttribute(node) === null
            && isEditable(node)
            && !isEditingHostStop(node)
    }

    /**
   * Is the element an open dialog (modal or not), which is a tab stop itself in Firefox and Safari
   */
    function isDialogStop(node: FocusableElement): boolean {
        return engine !== 'blink' && node instanceof HTMLDialogElement && node.open
    }

    /**
   * Get the first rendered image that uses the image map of the area. Without one, the area is not rendered.
   */
    function getAreaImage(area: HTMLAreaElement): HTMLImageElement | undefined {
        const map = area.closest('map')
        const root = area.getRootNode()
        if (!map || !(root instanceof Document || root instanceof ShadowRoot)) {
            return undefined
        }
        const names = [map.name, map.id].filter((name) => name !== '')

        return Array.from(root.querySelectorAll('img[usemap]')).find((image): image is HTMLImageElement =>
            image instanceof HTMLImageElement
            && names.includes((image.getAttribute('usemap') ?? '').replace(/^#/, ''))
            && !isHidden(image))
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
        // Browsers do not return `tabIndex` correctly for editing hosts, details elements, open dialogs (Firefox and
        // Safari stop at them) and audio and video elements with controls (Safari), so if they don't have a tabindex
        // attribute specifically set, assume it's 0.
        if (isEditingHostStop(node) || node instanceof HTMLDetailsElement || isDialogStop(node) || node.matches('audio[controls], video[controls]')) {
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
