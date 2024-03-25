import type { ElementPosition } from './elementPosition.interfaces.js'

/**
 * Get the position of the element to the top of the window
 */
export default function getElementPositionTopWindow(element: HTMLElement): ElementPosition {
    const rectangles = element.getBoundingClientRect()

    return {
        height: Math.round(rectangles.height),
        width: Math.round(rectangles.width),
        x: Math.round(rectangles.left),
        y: Math.round(rectangles.top),
    }
}
