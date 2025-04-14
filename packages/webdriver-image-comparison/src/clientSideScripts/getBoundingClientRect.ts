import type { ElementPosition } from './elementPosition.interfaces.js'

/**
 * Get the element position relative to the viewport
 */
export function getBoundingClientRect(
    element: HTMLElement,
): ElementPosition {
    const { height, width, x, y } = element.getBoundingClientRect()

    return {
        height: Math.round(height),
        width: Math.round(width),
        x: Math.round(x),
        y: Math.round(y),
    }
}
