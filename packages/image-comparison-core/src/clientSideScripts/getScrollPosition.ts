/**
 * Get the vertical scroll position of the element that `scrollToPosition` scrolls:
 * the `html` node when it can scroll, else the `body` node when it can scroll, else the scrolling element
 */
/* istanbul ignore next */
export default function getScrollPosition(): number {
    const htmlNode = document.querySelector('html')!
    const bodyNode = document.querySelector('body')!

    if (htmlNode.scrollHeight > htmlNode.clientHeight) {
        return htmlNode.scrollTop
    }

    if (bodyNode.scrollHeight > bodyNode.clientHeight) {
        return bodyNode.scrollTop
    }

    return (document.scrollingElement || document.documentElement).scrollTop
}
