import type { ElementPosition } from './elementPosition.interfaces.js'

/**
 * Get the element position to the top of the webview
 * This method is used for Android nativeWebScreenshots and iOS screenshots
 */
export function getBoundingClientRect(
    element: HTMLElement,
): ElementPosition {
    const { height, width, x, y } = element.getBoundingClientRect()

    return {
        height,
        width,
        x,
        y,
    }
}
