
export type TestContext = {
    /** The name of the command being executed */
    commandName: string
    /** The testing framework being used */
    framework: string
    /** The parent test suite or describe block */
    parent: string
    /** The tag associated with the test */
    tag: string
    /** The title of the test */
    title: string
    instanceData: {
        browser: {
            /** The name of the browser */
            name: string
            /** The version of the browser */
            version: string
        }
        /** The name of the device */
        deviceName: string
        platform: {
            /** The name of the platform */
            name: string
            /** The version of the platform */
            version: string
        }
        /** The application identifier */
        app: string
        /** Whether the device is mobile */
        isMobile: boolean
        /** Whether the device is Android */
        isAndroid: boolean
        /** Whether the device is iOS */
        isIOS: boolean
    }
}
