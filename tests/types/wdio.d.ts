declare namespace WebdriverIO {
    interface MultiRemoteBrowser {
        chromeBrowserOne: WebdriverIO.Browser;
        chromeBrowserTwo: WebdriverIO.Browser;
    }
    interface Capabilities {
        specs?: string[];
    }
}
