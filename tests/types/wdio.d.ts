declare namespace WebdriverIO {
    interface MultiRemoteBrowser {
        chromeBrowserOne: WebdriverIO.Browser;
        chromeBrowserTwo: WebdriverIO.Browser;
    }
    interface Capabilities {
        // Strange thing is that it's not allowed in the default Capabilities interface
        specs?: string[];
        "wdio-ics:options"?: {
            command?: string[];
            logName?: string;
        };
    }
}
