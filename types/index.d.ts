declare module WebdriverIO {
    interface Browser {
        /**
         * Saves an image of an element
         */
        saveElement(element: Element, tag: string, saveElementOptions?: {});

        /**
         * Saves an image of a viewport
         */
        saveScreen(tag: string, saveScreenOptions?: {});

        /**
         * Saves an image of the complete screen
         */
        saveFullPageScreen(tag: string, saveFullPageScreenOptions?: {});

        /**
         * Saves an image of the complete screen with the tabbable lines and dots
         */
        saveTabbablePage(tag: string, saveTabbableOptions?: {});

        /**
         * Compare an image of an element
         */
        checkElement(element: Element, tag: string, checkElementOptions?: {});

        /**
         * Compares an image of a viewport
         */
        checkScreen(tag: string, checkScreenOptions?: {});

        /**
         * Compares an image of the complete screen
         */
        checkFullPageScreen(tag: string, checkFullPageOptions?: {});

        /**
         * Compares an image of the complete screen with the tabbable lines and dots
         */
        checkTabbablePage(tag: string, checkTabbableOptions?: {});
    }
}
