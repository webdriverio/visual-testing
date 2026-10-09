import type { ElementPosition } from './elementPosition.interfaces.js'

export type ElementVisibleRect = ElementPosition & {
    /** The whole element is inside the viewport (a rounding margin of 1 CSS pixel is allowed) */
    isFullyVisible: boolean;
}

/**
 * Get the part of the element that is inside the viewport, in CSS pixels relative to the viewport
 */
export default function getElementVisibleRect(element: HTMLElement): ElementVisibleRect {
    const { top, left, bottom, right } = element.getBoundingClientRect()
    const { innerHeight, innerWidth } = window
    const visibleTop = Math.max(0, top)
    const visibleLeft = Math.max(0, left)
    const visibleBottom = Math.min(innerHeight, bottom)
    const visibleRight = Math.min(innerWidth, right)

    return {
        isFullyVisible: top >= -1 && left >= -1 && bottom <= innerHeight + 1 && right <= innerWidth + 1,
        height: Math.max(0, Math.round(visibleBottom - visibleTop)),
        width: Math.max(0, Math.round(visibleRight - visibleLeft)),
        x: Math.round(visibleLeft),
        y: Math.round(visibleTop),
    }
}
