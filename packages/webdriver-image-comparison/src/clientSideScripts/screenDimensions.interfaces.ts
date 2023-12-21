export interface ScreenDimensions {
  dimensions: {
    body: {
      // Minimum height the element would require in order to fit all the content in the viewport without using a vertical scrollbar.
      // The height is measured in the same way as clientHeight: it includes the element's padding, but not its border, margin or
      // horizontal scrollbar (if present). It can also include the height of pseudo-elements such as ::before or ::after.
      // If the element's content can fit without a need for vertical scrollbar, its scrollHeight is equal to clientHeight
      scrollHeight?: number;
      // measurement in pixels of the element's CSS height, including any borders, padding, and horizontal scrollbars (if rendered).
      // It does not include the height of pseudo-elements such as ::before or ::after. For the document body object, the measurement
      // includes total linear content height instead of the element's CSS height. Floated elements extending below other
      // linear content are ignored
      offsetHeight?: number;
    };
    html: {
      // Inner width of an element in pixels. It includes padding but excludes borders, margins, and vertical scrollbars (if present)
      clientWidth?: number;
      // The width is measured in the same way as clientWidth: it includes the element's padding, but not its border, margin or vertical
      // scrollbar (if present). It can also include the width of pseudo-elements such as ::before or ::after. If the element's content
      // can fit without a need for horizontal scrollbar, its scrollWidth is equal to clientWidth
      scrollWidth?: number;
      // Inner height of an element in pixels. It includes padding but excludes borders, margins, and horizontal scrollbars (if present)
      clientHeight?: number;
      // The height is measured in the same way as clientHeight: it includes the element's padding, but not its border, margin or
      // horizontal scrollbar (if present). It can also include the height of pseudo-elements such as ::before or ::after. If the element's
      // content can fit without a need for vertical scrollbar, its scrollHeight is equal to clientHeight
      scrollHeight?: number;
      // Measurement in pixels of the element's CSS height, including any borders, padding, and horizontal scrollbars (if rendered).
      // It does not include the height of pseudo-elements such as ::before or ::after. For the document body object, the measurement
      // includes total linear content height instead of the element's CSS height. Floated elements extending below other linear
      // content are ignored
      offsetHeight?: number;
    };
    window: {
      // Width (in pixels) of the browser window viewport including, if rendered, the vertical scrollbar.
      innerWidth?: number;
      // Height (in pixels) of the browser window viewport including, if rendered, the horizontal scrollbar.
      innerHeight?: number;
      // Determines based on `window.matchMedia` if the screen is in landscape mode
      isLandscape: boolean;
      // Width of the outside of the browser window. It represents the width of the whole browser window including sidebar (if expanded),
      // window chrome and window resizing borders/handles.
      outerWidth?: number;
      // Height in pixels of the whole browser window. It represents the height of the whole browser window including sidebar
      // (if expanded), window chrome and window resizing borders/handles.
      outerHeight?: number;
      // The ratio of the resolution in physical pixels to the resolution in CSS pixels for the current display device.
      devicePixelRatio?: number;
      // The width of the screen
      screenWidth?: number;
      // The height of the screen
      screenHeight?: number;
    };
  };
}
