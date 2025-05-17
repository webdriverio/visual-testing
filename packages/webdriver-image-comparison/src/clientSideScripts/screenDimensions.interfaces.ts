export interface ScreenDimensions {
    dimensions: {
        body: {
            /**
             * Mobile & Desktop: Total scrollable height of the body element, including content not visible on screen.
             * Includes padding but not border, margin or horizontal scrollbar.
             * Equal to clientHeight if no vertical scrolling is needed.
             */
            scrollHeight?: number;
            /**
             * Mobile & Desktop: Height of body element including padding and borders, but not margins.
             * For document.body, represents total linear content height.
             * Floated elements extending below other linear content are ignored.
             */
            offsetHeight?: number;
        };
        html: {
            /**
             * Mobile & Desktop: Viewport width excluding scrollbars.
             * Includes padding but not borders, margins, or vertical scrollbars.
             */
            clientWidth?: number;
            /**
             * Mobile & Desktop: Total scrollable width including overflow content.
             * Includes padding but not borders, margins, or vertical scrollbars.
             * Equal to clientWidth if no horizontal scrolling is needed.
             */
            scrollWidth?: number;
            /**
             * Mobile & Desktop: Viewport height excluding scrollbars.
             * Includes padding but not borders, margins, or horizontal scrollbars.
             */
            clientHeight?: number;
            /**
             * Mobile & Desktop: Total scrollable height including overflow content.
             * Includes padding but not borders, margins, or horizontal scrollbars.
             * Equal to clientHeight if no vertical scrolling is needed.
             */
            scrollHeight?: number;
            /**
             * Mobile & Desktop: Height of html element including padding and borders.
             * For document.documentElement, represents total rendered height including overflow.
             * Floated elements extending below other linear content are ignored.
             */
            offsetHeight?: number;
        };
        window: {
            /**
             * Mobile: Viewport width (changes with zoom)
             * Desktop: Viewport width including vertical scrollbar
             */
            innerWidth?: number;
            /**
             * Mobile: Viewport height (changes with zoom)
             * Desktop: Viewport height including horizontal scrollbar
             */
            innerHeight?: number;
            /**
             * Mobile: True if device is in landscape orientation
             * Desktop: Based on viewport aspect ratio using matchMedia
             */
            isLandscape: boolean;
            /**
             * Mobile: Full browser width including UI elements
             * Desktop: Browser window width including window chrome/borders
             */
            outerWidth?: number;
            /**
             * Mobile: Full browser height including UI elements
             * Desktop: Browser window height including window chrome/borders
             */
            outerHeight?: number;
            /**
             * Mobile: Physical pixel ratio (typically >1 for high DPI screens)
             * Desktop: Usually 1, or higher for high DPI displays
             */
            devicePixelRatio?: number;
            /**
             * Mobile: Physical screen width in CSS pixels
             * Desktop: Monitor width in pixels
             */
            screenWidth?: number;
            /**
             * Mobile: Physical screen height in CSS pixels
             * Desktop: Monitor height in pixels
             */
            screenHeight?: number;
        };
    };
}
