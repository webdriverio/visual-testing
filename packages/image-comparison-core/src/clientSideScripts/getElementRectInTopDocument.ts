
import type { RectanglesOutput } from '../methods/rectangles.interfaces.js'

/**
 * Get the element position relative to the top-level document or viewport.
 *
 * Adds the position of each parent iframe to the element's coordinates.
 * Returns null when a cross-origin boundary prevents accessing the parent frame.
 */
export type ElementRectInTopDocumentOutput = RectanglesOutput & {
    isClippedByIframe?: boolean
}

/**
 * Get the element position relative to the top-level document or viewport.
 *
 * Adds the position of each parent iframe to the element's coordinates,
 * taking into account ancestor frame scaling, borders, and padding.
 * Checks whether the element is clipped by any ancestor iframe's content area.
 * Returns null when a cross-origin boundary prevents accessing the parent frame.
 */
export default function getElementRectInTopDocument(
    element: HTMLElement,
    origin: 'document' | 'viewport' = 'document'
): ElementRectInTopDocumentOutput | null {
    try {
        const rect = element.getBoundingClientRect()
        let x = rect.left
        let y = rect.top
        let width = rect.width
        let height = rect.height
        let isClippedByIframe = false

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

            let scaleX = 1
            let scaleY = 1
            const transform = style.transform

            if (transform && transform !== 'none') {
                const matrixMatch = transform.match(/^matrix\((.+)\)$/)
                if (matrixMatch) {
                    const values = matrixMatch[1].split(',').map((val) => parseFloat(val.trim()))
                    if (values.length >= 4) {
                        const [a, b, c, d] = values
                        const sx = Math.hypot(a, b)
                        const sy = Math.hypot(c, d)
                        if (!isNaN(sx) && sx > 0) {
                            scaleX = sx
                        }
                        if (!isNaN(sy) && sy > 0) {
                            scaleY = sy
                        }
                    }
                } else {
                    const matrix3dMatch = transform.match(/^matrix3d\((.+)\)$/)
                    if (matrix3dMatch) {
                        const values = matrix3dMatch[1].split(',').map((val) => parseFloat(val.trim()))
                        if (values.length >= 16) {
                            const sx = Math.hypot(values[0], values[1], values[2])
                            const sy = Math.hypot(values[4], values[5], values[6])
                            if (!isNaN(sx) && sx > 0) {
                                scaleX = sx
                            }
                            if (!isNaN(sy) && sy > 0) {
                                scaleY = sy
                            }
                        }
                    } else {
                        const scale3dMatch = transform.match(/\bscale3d\(\s*([^,)\s]+)[\s,]+([^,)\s]+)[\s,]+([^)\s]+)\s*\)/)
                        if (scale3dMatch) {
                            const sx = parseFloat(scale3dMatch[1])
                            const sy = parseFloat(scale3dMatch[2])
                            if (!isNaN(sx) && sx > 0) {
                                scaleX = sx
                            }
                            if (!isNaN(sy) && sy > 0) {
                                scaleY = sy
                            }
                        }

                        const scaleMatch = transform.match(/\bscale\(\s*([^,)\s]+)(?:[\s,]+([^)\s]+))?\s*\)/)
                        if (scaleMatch) {
                            const sx = parseFloat(scaleMatch[1])
                            const sy = scaleMatch[2] !== undefined ? parseFloat(scaleMatch[2]) : sx
                            if (!isNaN(sx) && sx > 0) {
                                scaleX = sx
                            }
                            if (!isNaN(sy) && sy > 0) {
                                scaleY = sy
                            }
                        }

                        const scaleXMatch = transform.match(/\bscaleX\(\s*([^)\s]+)\s*\)/)
                        if (scaleXMatch) {
                            const sx = parseFloat(scaleXMatch[1])
                            if (!isNaN(sx) && sx > 0) {
                                scaleX = sx
                            }
                        }

                        const scaleYMatch = transform.match(/\bscaleY\(\s*([^)\s]+)\s*\)/)
                        if (scaleYMatch) {
                            const sy = parseFloat(scaleYMatch[1])
                            if (!isNaN(sy) && sy > 0) {
                                scaleY = sy
                            }
                        }
                    }
                }
            }

            const frameContentWidth = frameElement.clientWidth || (frameRect.width > 0 ? frameRect.width / scaleX : win.innerWidth)
            const frameContentHeight = frameElement.clientHeight || (frameRect.height > 0 ? frameRect.height / scaleY : win.innerHeight)

            if (
                frameContentWidth > 0 &&
                frameContentHeight > 0 &&
                (x < -1 ||
                y < -1 ||
                x + width > frameContentWidth + 1 ||
                y + height > frameContentHeight + 1)
            ) {
                isClippedByIframe = true
            }

            x = frameRect.left + (x + frameElement.clientLeft + parseFloat(style.paddingLeft || '0')) * scaleX
            y = frameRect.top + (y + frameElement.clientTop + parseFloat(style.paddingTop || '0')) * scaleY
            width *= scaleX
            height *= scaleY

            win = parentWindow
        }

        if (origin === 'document') {
            x += win.scrollX
            y += win.scrollY
        }

        const result: ElementRectInTopDocumentOutput = {
            x,
            y,
            width,
            height,
        }

        if (isClippedByIframe) {
            result.isClippedByIframe = true
        }

        return result
    } catch {
        return null
    }
}
