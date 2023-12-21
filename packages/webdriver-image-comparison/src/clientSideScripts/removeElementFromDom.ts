/**
 * Remove a DOM element from the DOM
 */
export default function removeElementFromDom(id: string): void {
    const elem = document.querySelector(`#${id}`)
    if (elem) {
        elem.parentNode!.removeChild(elem)
    }
}
