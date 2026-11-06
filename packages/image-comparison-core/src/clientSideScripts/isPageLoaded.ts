/**
 * Check if the browser shows the page of this url, and if the page is loaded
 */
/* istanbul ignore next */
export function isPageLoaded(url: string): boolean {
    return window.location.href === url && document.readyState === 'complete'
}
