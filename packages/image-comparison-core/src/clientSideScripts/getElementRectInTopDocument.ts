
import type { RectanglesOutput } from '../methods/rectangles.interfaces.js'

/**
 * Get the element position relative to the top-level document or viewport.
 *
 * Adds the position of each parent iframe to the element's coordinates.
 * Returns null when a cross-origin boundary prevents accessing the parent frame.
 */
export default function getElementRectInTopDocument(
    element: HTMLElement,
    origin: 'document' | 'viewport' = 'document'
): RectanglesOutput | null {
    try {
        const rect = element.getBoundingClientRect()
        let x = rect.left
        let y = rect.top

        let win: Window | null = element.ownerDocument.defaultView

        if (!win) {
            return null
        }

        while (win !== win.top) {
            const frameElement = win.frameElement

            if (!frameElement) {
                return null
            }

            const frameRect = frameElement.getBoundingClientRect()
            const parentWindow: Window = win.parent
            const style = parentWindow.getComputedStyle(frameElement)

            x += frameRect.left + frameElement.clientLeft + parseFloat(style.paddingLeft || '0')
            y += frameRect.top + frameElement.clientTop + parseFloat(style.paddingTop || '0')

            win = parentWindow
        }

        if (origin === 'document') {
            x += win.scrollX
            y += win.scrollY
        }

        return {
            x,
            y,
            width: rect.width,
            height: rect.height,
        }
    } catch {
        return null
    }
}
