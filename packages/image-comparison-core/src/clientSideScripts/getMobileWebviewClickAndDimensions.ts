import type { RectanglesOutput } from '../methods/rectangles.interfaces.js'

/**
 * Get the click and dimensions of the mobile webview and remove the overlay
 */
export function getMobileWebviewClickAndDimensions(overlaySelector: string):RectanglesOutput {
    const overlay = document.querySelector(overlaySelector) as HTMLElement | null
    const defaultValue = { y: 0, x: 0, width: 0, height: 0 }

    if (!overlay || !overlay.dataset.icsWebviewData) {
        return defaultValue
    }

    overlay.remove()

    try {
        return JSON.parse(overlay.dataset.icsWebviewData)
    } catch {
        return defaultValue
    }
}
