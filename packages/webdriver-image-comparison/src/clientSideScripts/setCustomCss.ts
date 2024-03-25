import type { CssOptions } from './customCss.interfaces.js'

/**
 * Set some default css
 */
export default function setCustomCss(cssOptions: CssOptions): void {
    if (!document.head) {
        return
    }
    // disabling CSS animations for everything including pseudo elements
    const disableTransformationsTransitionsAnimations = `
*, *::before, *::after {
    -o-transition-property: none !important;
    -moz-transition-property: none !important;
    -ms-transition-property: none !important;
    -webkit-transition-property: none !important;
    transition-property: none !important;
    -webkit-animation: none !important;
    -moz-animation: none !important;
    -o-animation: none !important;
    -ms-animation: none !important;
    animation: none !important;
    caret-color: transparent !important;
}`
    const { addressBarPadding, disableCSSAnimation, id, toolBarPadding } = cssOptions
    const bodyTopPadding = addressBarPadding === 0 ? '' : `body{padding-top:${addressBarPadding}px !important}`
    const bodyBottomPadding = toolBarPadding === 0 ? '' : `body{padding-bottom:${toolBarPadding}px !important}`
    const css = (disableCSSAnimation ? disableTransformationsTransitionsAnimations : '') + bodyTopPadding + bodyBottomPadding
    const head = document.head
    const style = document.createElement('style')

    style.id = id
    style.appendChild(document.createTextNode(css))
    head.appendChild(style)
}
