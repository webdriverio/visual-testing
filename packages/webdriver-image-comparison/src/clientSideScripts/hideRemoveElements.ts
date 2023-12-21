import type { WebElement } from 'selenium-webdriver'

/**
 * Hide or remove elements on the page
 */
export default function hideRemoveElements(
    hideRemoveElements: {
    hide: (HTMLElement | HTMLElement[] | WebElement | WebElement[])[];
    remove: (HTMLElement | HTMLElement[])[];
  },
    hideRemove: boolean,
): any {
    const visitedSelectors: Record<string, boolean> = {}
    hideRemoveElements.hide.forEach((element) => {
        if (Array.isArray(element)) {
            return element.forEach((singleElement: HTMLElement | WebElement) => hideRemoveEl(singleElement, 'visibility', hideRemove))
        }
        hideRemoveEl(element, 'visibility', hideRemove)
    })

    hideRemoveElements.remove.forEach((element) => {
        if (Array.isArray(element)) {
            return element.forEach((singleElement: HTMLElement | WebElement) => hideRemoveEl(singleElement, 'display', hideRemove))
        }
        hideRemoveEl(element, 'display', hideRemove)
    })

    function hideRemoveEl(el: HTMLElement | WebElement, prop: string, hideRemove: boolean) {
    // @ts-ignore
        if (el.style) {
            // Here we get the HTMLElement
            // @ts-ignore
            setPropertyToElement(el, prop, hideRemove)
        } else {
            // Here we have the WebElement, with the web element we can have 2 types of selectors
            // css and xpath, transform them into HTML
            // This is an anti pattern, but I don't know how to do this better with XPATH selection
            try {
                // @ts-ignore
                const selector = el.selector

                if (visitedSelectors[selector] == null) {
                    visitedSelectors[selector] = true
                    const elems = document.querySelectorAll(selector)

                    elems.forEach((singleEl) => setPropertyToElement(singleEl, prop, hideRemove))
                }
            } catch (e) {
                // 99.99% sure that we have XPATH here
                // @ts-ignore
                return getElementsByXpath(el.selector).forEach((singleEl) => setPropertyToElement(singleEl, prop, hideRemove))
            }
        }
    }

    function setPropertyToElement(el: HTMLElement, prop: string, hideRemove: boolean) {
        const value = prop === 'visibility' ? 'hidden' : 'none'
        // @ts-ignore
        el.style[prop] = hideRemove ? value : ''
    }

    // Stupid TypeScript =)
    function getElementsByXpath(xpathToExecute: string): any[] {
        const result = []
        const nodesSnapshot = document.evaluate(xpathToExecute, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)

        for (let i = 0; i < nodesSnapshot.snapshotLength; i++) {
            result.push(nodesSnapshot.snapshotItem(i))
        }

        return result
    }
}
