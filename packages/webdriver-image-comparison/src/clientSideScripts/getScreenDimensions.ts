import type { ScreenDimensions } from './screenDimensions.interfaces'

/**
 * Get all the screen dimensions
 */
export default function getScreenDimensions(): ScreenDimensions {
    const body = document.body
    const html = document.documentElement

    const bodyDimensions = {
        scrollHeight: !body ? 0 : body.scrollHeight,
        offsetHeight: !body ? 0 : body.offsetHeight,
    }

    const htmlDimensions = {
        clientHeight: !html ? 0 : html.clientHeight,
        clientWidth: !html ? 0 : html.clientWidth,
        scrollHeight: !html ? 0 : html.scrollHeight,
        scrollWidth: !html ? 0 : html.scrollWidth,
        offsetHeight: !html ? 0 : html.offsetHeight,
    }

    const windowDimensions = {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        isLandscape: window.matchMedia('(orientation: landscape)').matches,
        outerHeight: window.outerHeight === 0 ? htmlDimensions.clientHeight : window.outerHeight,
        outerWidth: window.outerWidth === 0 ? htmlDimensions.clientWidth : window.outerWidth,
        devicePixelRatio: window.devicePixelRatio,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
    }

    return {
        dimensions: {
            body: bodyDimensions,
            html: htmlDimensions,
            window: windowDimensions,
        },
    }
}
