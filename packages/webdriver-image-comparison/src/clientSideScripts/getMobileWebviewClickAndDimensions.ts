import type { DeviceRectangleBound } from '../methods/instanceData.interfaces.js'

/**
 * Get the click and dimensions of the mobile webview and remove the overlay
 */
export function getMobileWebviewClickAndDimensions(overlaySelector: string):DeviceRectangleBound {
    const overlay = document.querySelector(overlaySelector) as HTMLElement | null
    const defaultValue = { top: 0, left: 0, width: 0, height: 0 }

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
