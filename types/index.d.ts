declare module WebdriverIO {
    interface Browser {
        /**
         * Saves an image of an element
         */
        saveElement(element: Element, tag: string, saveElementOptions?: {}): void;

        /**
         * Saves an image of a viewport
         */
        saveScreen(tag: string, saveScreenOptions?: {}): void;

        /**
         * Saves an image of the complete screen
         */
        saveFullPageScreen(tag: string, saveFullPageScreenOptions?: {}): void;

        /**
         * Saves an image of the complete screen with the tabbable lines and dots
         */
        saveTabbablePage(tag: string, saveTabbableOptions?: {}): void;

        /**
         * Compare an image of an element
         */
        checkElement(element: Element, tag: string, checkElementOptions?: {}): number;

        /**
         * Compares an image of a viewport
         */
        checkScreen(tag: string, checkScreenOptions?: {}): number;

        /**
         * Compares an image of the complete screen
         */
        checkFullPageScreen(tag: string, checkFullPageOptions?: {}): number;

        /**
         * Compares an image of the complete screen with the tabbable lines and dots
         */
        checkTabbablePage(tag: string, checkTabbableOptions?: {}): number;
    }
}
