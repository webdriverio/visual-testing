/**
 * Get the position and size of the element in the viewport, in CSS pixels and not rounded.
 * WebDriver `getElementRect` returns the position on the page (it adds the scroll position), so it can not be used
 * for a clip with the `viewport` origin
 */
export default function getElementViewportRect(element: HTMLElement): { x: number, y: number, width: number, height: number } {
    const { x, y, width, height } = element.getBoundingClientRect()

    return { x, y, width, height }
}
