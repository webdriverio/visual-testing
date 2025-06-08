import type { ElementPosition } from './elementPosition.interfaces.js'

/**
 * Get the position of the element to the top of the DOM
 */
export default function getElementPositionTopDom(element: HTMLElement): ElementPosition {
    return {
        height: element.offsetHeight,
        width: element.offsetWidth,
        x: element.offsetLeft,
        y: element.offsetTop,
    }
}
