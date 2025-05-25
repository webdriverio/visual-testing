import type { ScreenDimensions } from './screenDimensions.interfaces.js'

/**
 * Get all the screen dimensions
 */
export default function getScreenDimensions(isMobile: boolean): ScreenDimensions {
    // We need to determine if the screen is emulated, because that would return different values
    const width = window.innerWidth
    const height = window.innerHeight
    const dpr = window.devicePixelRatio || 1
    const minEdge = Math.min(width, height)
    const maxEdge = Math.max(width, height)
    const isLikelyEmulated =
        !isMobile &&              // Only check for emulated on desktop
        dpr >= 2 &&               // High-DPI signal
        minEdge <= 800 &&         // Catch phones/tablets in portrait/landscape
        maxEdge <= 1280 &&        // Conservative max for emulated tablet sizes
        width > 0 && height > 0   // Sanity check

    // Other checks
    const body = document.body
    const html = document.documentElement
    const bodyDimensions = {
        // On mobile & desktop: Total scrollable height of the body element, including content not visible on screen
        scrollHeight: !body ? 0 : body.scrollHeight,
        // On mobile & desktop: Height of body element including padding but not margin
        offsetHeight: !body ? 0 : body.offsetHeight,
    }
    const htmlDimensions = {
        /** On mobile & desktop: Viewport height excluding scrollbars */
        clientHeight: !html ? 0 : html.clientHeight,
        /** On mobile & desktop: Viewport width excluding scrollbars */
        clientWidth: !html ? 0 : html.clientWidth,
        /** On mobile & desktop: Total scrollable height including overflow */
        scrollHeight: !html ? 0 : html.scrollHeight,
        /** On mobile & desktop: Total scrollable width including overflow */
        scrollWidth: !html ? 0 : html.scrollWidth,
        /** On mobile & desktop: Height including padding and border */
        offsetHeight: !html ? 0 : html.offsetHeight,
    }

    const windowDimensions = {
        /**
         * Mobile: Viewport width (changes with zoom)
         * Desktop: Viewport width including scrollbars
         */
        innerWidth: window.innerWidth,
        /**
         * Mobile: Viewport height (changes with zoom)
         * Desktop: Viewport height including scrollbars
         */
        innerHeight: window.innerHeight,
        /**
         * Mobile: True if device is in landscape orientation
         * Desktop: Based on viewport aspect ratio
         */
        isLandscape: window.matchMedia('(orientation: landscape)').matches,
        /**
         * Mobile: Full browser height including UI elements
         * Desktop: Browser window height including toolbars/status bar
         * Emulated: It will be the same as window.innerHeight
         */
        outerHeight: isLikelyEmulated && window.outerHeight > 0?
            window.innerHeight :
            window.outerHeight === 0 ?
                htmlDimensions.clientHeight :
                window.outerHeight,
        /**
         * Mobile: Full browser width
         * Desktop: Browser window width
         * Emulated: It will be the same as window.innerWidth
         */
        outerWidth: isLikelyEmulated && window.outerWidth > 0 ?
            window.innerWidth :
            window.outerWidth === 0 ?
                htmlDimensions.clientWidth :
                window.outerWidth,
        /**
         * Mobile: Physical pixel ratio (typically >1 for high DPI)
         * Desktop: Usually 1, or 2 for high DPI displays
         */
        devicePixelRatio: window.devicePixelRatio,
        /**
         * Mobile: Always false
         * Desktop: Always false
         * Emulated: Always true
         */
        isEmulated: isLikelyEmulated,
        /**
         * Mobile: Physical screen width in CSS pixels
         * Desktop: Monitor width in pixels
         * Emulated: It will be the same as window.innerWidth
         */
        screenWidth: isLikelyEmulated ? window.innerWidth : window.screen.width,
        /**
         * Mobile: Physical screen height in CSS pixels
         * Desktop: Monitor height in pixels
         * Emulated: It will be the same as window.innerHeight
         */
        screenHeight: isLikelyEmulated ? window.innerHeight : window.screen.height,
    }

    return {
        dimensions: {
            body: bodyDimensions,
            html: htmlDimensions,
            window: windowDimensions,
        },
    }
}
