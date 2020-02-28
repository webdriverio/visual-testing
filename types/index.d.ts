declare module WebdriverIO {
  interface Browser {
    /**
     * Saves an image of an element
     */
    saveElement(
      element: Element,
      tag: string,
      saveElementOptions?: {}
    ): { fileName: string; path: string; devicePixelRatio: number };

    /**
     * Saves an image of a viewport
     */
    saveScreen(tag: string, saveScreenOptions?: {}): { fileName: string; path: string; devicePixelRatio: number };

    /**
     * Saves an image of the complete screen
     */
    saveFullPageScreen(
      tag: string,
      saveFullPageScreenOptions?: {}
    ): { fileName: string; path: string; devicePixelRatio: number };

    /**
     * Saves an image of the complete screen with the tabbable lines and dots
     */
    saveTabbablePage(
      tag: string,
      saveTabbableOptions?: {}
    ): { fileName: string; path: string; devicePixelRatio: number };

    /**
     * Compare an image of an element
     */
    checkElement(
      element: Element,
      tag: string,
      checkElementOptions?: {}
    ): number | { fileName: string; folders: { actual: string; baseline: string }; misMatchPercentage: number };

    /**
     * Compares an image of a viewport
     */
    checkScreen(
      tag: string,
      checkScreenOptions?: {}
    ): number | { fileName: string; folders: { actual: string; baseline: string }; misMatchPercentage: number };

    /**
     * Compares an image of the complete screen
     */
    checkFullPageScreen(
      tag: string,
      checkFullPageOptions?: {}
    ): number | { fileName: string; folders: { actual: string; baseline: string }; misMatchPercentage: number };

    /**
     * Compares an image of the complete screen with the tabbable lines and dots
     */
    checkTabbablePage(
      tag: string,
      checkTabbableOptions?: {}
    ): number | { fileName: string; folders: { actual: string; baseline: string }; misMatchPercentage: number };
  }
}
