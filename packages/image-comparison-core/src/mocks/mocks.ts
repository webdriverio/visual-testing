import type { BeforeScreenshotOptions } from '../helpers/beforeScreenshot.interfaces.js'
import type { InternalSaveMethodOptions } from '../commands/save.interfaces.js'

export const BEFORE_SCREENSHOT_OPTIONS: BeforeScreenshotOptions = {
    instanceData: {
        appName: 'chrome-app',
        browserName: 'chrome',
        browserVersion: '75.0.1',
        deviceName: '',
        devicePixelRatio: 1,
        initialDevicePixelRatio: 1,
        deviceRectangles: {
            statusBar: { y: 0, x: 0, width: 0, height: 0 },
            homeBar: { y: 0, x: 0, width: 0, height: 0 },
            screenSize: { height: 0, width: 0 },
            statusBarAndAddressBar: { y: 0, x: 0, width: 0, height: 0 },
            viewport: { y: 0, x: 0, width: 0, height: 0 },
            bottomBar: { y: 0, x: 0, width: 0, height: 0 },
            leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
            rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
        },
        isAndroid: false,
        isIOS: false,
        isMobile: false,
        logName: 'chrome-latest',
        name: 'chrome-name',
        nativeWebScreenshot: true,
        platformName: 'Windows 10',
        platformVersion: '1234',
    },
    addressBarShadowPadding: 6,
    disableBlinkingCursor: true,
    disableCSSAnimation: true,
    enableLayoutTesting: false,
    noScrollBars: true,
    toolBarShadowPadding: 6,
    hideElements: [<HTMLElement>(<any>'<div></div>')],
    removeElements: [<HTMLElement>(<any>'<div></div>')],
    waitForFontsLoaded: true,
}
export const CONFIGURABLE = {
    writable: true,
    configurable: true,
}
export const NAVIGATOR_APP_VERSIONS = {
    ANDROID: {
        7: '5.0 (Linux; Android 7.1.1; Android SDK built for x86 Build/NYC) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.91 Mobile Safari/537.3',
        8: '5.0 (Linux; Android 8.1; Android SDK built for x86 Build/NYC) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.91 Mobile Safari/537.3',
        9: '5.0 (Linux; Android 9; Android SDK built for x86 Build/NYC) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.91 Mobile Safari/537.3',
        10: '5.0 (Linux; Android 10; Android SDK built for x86 Build/NYC) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.91 Mobile Safari/537.3',
        11: '5.0 (Linux; Android 11; Android SDK built for x86 Build/NYC) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.91 Mobile Safari/537.3',
    },
    IOS: {
        10: '5.0 (iPhone; CPU iPhone OS 10_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/10.0 Mobile/15E148 Safari/604.1',
        11: '5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1',
        12: '5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
        13: '5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1',
        14: '5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        15: '5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    },
    IPADOS: {
        13: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Safari/605.1.15',
        14: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
        15: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
    },
}
export const ANDROID_DEVICES = {
    NEXUS_5X: {
        height: 732,
        width: 412,
        innerHeight: 604,
        innerWidth: 412,
    },
    NEXUS_5X_INNER_HEIGHT: {
        height: 732,
        width: 412,
        innerHeight: 800,
        innerWidth: 412,
    },
    TABLET_WIDTH: {
        height: 768,
        width: 1024,
        innerHeight: 604,
        innerWidth: 412,
    },
}
export const IOS_DEVICES = {
    IPHONE: {
        height: 667,
        width: 375,
        innerHeight: 553,
        innerWidth: 375,
        scrollWidth: 375,
        sideBar: 0,
    },
    IPHONE_X: {
        height: 812,
        width: 375,
        innerHeight: 635,
        innerWidth: 375,
        scrollWidth: 375,
        sideBar: 0,
    },
    IPHONE_HEIGHT: {
        height: 896,
        width: 1024,
        innerHeight: 719,
        innerWidth: 414,
        scrollWidth: 414,
        sideBar: 0,
    },
    IPHONE_11: {
        height: 896,
        width: 375,
        innerHeight: 635,
        innerWidth: 375,
        scrollWidth: 375,
        sideBar: 0,
    },
    IPAD: {
        height: 1366,
        width: 1024,
        innerHeight: 1292,
        innerWidth: 1024,
        scrollWidth: 1024,
        sideBar: 0,
    },
    IPAD_LANDSCAPE: {
        height: 1366,
        width: 1024,
        innerHeight: 746,
        innerWidth: 1046,
        scrollWidth: 1046,
        sideBar: 320,
    },
    IPAD_BIG_SIZE: {
        height: 5432,
        width: 9876,
        innerHeight: 5324,
        innerWidth: 9768,
        scrollWidth: 9768,
        sideBar: 108,
    },
    IPAD_PRO_LANDSCAPE: {
        height: 1366,
        width: 1024,
        innerHeight: 954,
        innerWidth: 1046,
        scrollWidth: 1046,
        sideBar: 320,
    },
}
export const BASE_CHECK_OPTIONS = {
    wic: {
        addressBarShadowPadding: 6,
        autoElementScroll: true,
        addIOSBezelCorners: false,
        autoSaveBaseline: false,
        clearFolder: false,
        userBasedFullPageScreenshot: false,
        enableLegacyScreenshotMethod: false,
        formatImageName: '{tag}-{logName}-{width}x{height}-dpr-{dpr}',
        isHybridApp: false,
        savePerInstance: true,
        toolBarShadowPadding: 6,
        disableBlinkingCursor: false,
        disableCSSAnimation: false,
        enableLayoutTesting: false,
        fullPageScrollTimeout: 1500,
        hideScrollBars: true,
        waitForFontsLoaded: true,
        compareOptions: {
            ignoreAlpha: false,
            ignoreAntialiasing: false,
            ignoreColors: false,
            ignoreLess: false,
            ignoreNothing: false,
            rawMisMatchPercentage: false,
            returnAllCompareData: false,
            saveAboveTolerance: 0,
            scaleImagesToSameSize: false,
            blockOutSideBar: false,
            blockOutStatusBar: false,
            blockOutToolBar: false,
            createJsonReportFiles: false,
            diffPixelBoundingBoxProximity: 5,
        },
        tabbableOptions: {
            circle: {
                backgroundColor: 'rgba(255, 0, 0, 0.4)',
                borderColor: 'rgba(255, 0, 0, 1)',
                borderWidth: 1,
                fontColor: 'rgba(0, 0, 0, 1)',
                fontFamily: 'Arial',
                fontSize: 10,
                size: 10,
            },
            line: {
                color: 'rgba(255, 0, 0, 1)',
                width: 1,
            },
        }
    },
    instanceData: {
        appName: 'TestApp',
        browserName: 'Chrome',
        browserVersion: '118.0.0.0',
        deviceName: 'iPhone 14',
        devicePixelRatio: 2,
        deviceRectangles: {
            bottomBar: { y: 800, x: 0, width: 390, height: 0 },
            homeBar: { x: 0, y: 780, width: 390, height: 34 },
            leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
            rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
            screenSize: { height: 844, width: 390 },
            statusBar: { x: 0, y: 0, width: 390, height: 47 },
            statusBarAndAddressBar: { y: 0, x: 0, width: 390, height: 47 },
            viewport: { y: 47, x: 0, width: 390, height: 733 }
        },
        initialDevicePixelRatio: 2,
        isAndroid: false,
        isIOS: true,
        isMobile: true,
        logName: 'test-log',
        name: 'test-device',
        nativeWebScreenshot: false,
        platformName: 'iOS',
        platformVersion: '17.0'
    },
    folders: {
        actualFolder: '/test/actual',
        baselineFolder: '/test/baseline',
        diffFolder: '/test/diff'
    },
    testContext: {
        commandName: 'checkScreen',
        framework: 'vitest',
        parent: 'test suite',
        title: 'test title',
        tag: 'test-tag',
        instanceData: {
            browser: { name: 'Chrome', version: '118.0.0.0' },
            deviceName: 'iPhone 14',
            platform: { name: 'iOS', version: '17.0' },
            app: 'TestApp',
            isMobile: true,
            isAndroid: false,
            isIOS: true
        }
    }
}
export const BEFORE_SCREENSHOT_MOCK = {
    browserName: 'chrome',
    browserVersion: '120.0.0',
    deviceName: 'desktop',
    dimensions: {
        body: {
            scrollHeight: 1000,
            offsetHeight: 1000
        },
        html: {
            clientWidth: 1200,
            scrollWidth: 1200,
            clientHeight: 900,
            scrollHeight: 1000,
            offsetHeight: 1000
        },
        window: {
            devicePixelRatio: 2,
            innerHeight: 900,
            innerWidth: 1200,
            isEmulated: false,
            isLandscape: false,
            outerHeight: 1000,
            outerWidth: 1200,
            screenHeight: 1080,
            screenWidth: 1920,
        },
    },
    isAndroid: false,
    isAndroidChromeDriverScreenshot: false,
    isAndroidNativeWebScreenshot: false,
    isIOS: false,
    isMobile: false,
    isTestInBrowser: true,
    isTestInMobileBrowser: false,
    addressBarShadowPadding: 0,
    toolBarShadowPadding: 0,
    appName: '',
    logName: 'chrome',
    name: 'chrome',
    platformName: 'desktop',
    platformVersion: '120.0.0',
    devicePixelRatio: 2,
    deviceRectangles: {
        bottomBar: { height: 0, width: 0, x: 0, y: 0 },
        homeBar: { height: 0, width: 0, x: 0, y: 0 },
        leftSidePadding: { height: 0, width: 0, x: 0, y: 0 },
        rightSidePadding: { height: 0, width: 0, x: 0, y: 0 },
        screenSize: { height: 0, width: 0 },
        statusBar: { height: 0, width: 0, x: 0, y: 0 },
        statusBarAndAddressBar: { height: 0, width: 0, x: 0, y: 0 },
        viewport: { height: 0, width: 0, x: 0, y: 0 }
    },
    initialDevicePixelRatio: 2,
    nativeWebScreenshot: false
}
export const AFTER_SCREENSHOT_MOCK = {
    devicePixelRatio: 2,
    fileName: 'test-screen.png'
}
export const COMMON_METHOD_OPTIONS = {
    disableBlinkingCursor: false,
    disableCSSAnimation: false,
    enableLayoutTesting: false,
    enableLegacyScreenshotMethod: false,
    hideScrollBars: true,
    hideElements: [],
    removeElements: [],
    waitForFontsLoaded: true,
}
export const createBeforeScreenshotMock = (overrides = {}) => ({
    ...BEFORE_SCREENSHOT_MOCK,
    ...overrides
})
export const createAfterScreenshotMock = (overrides = {}) => ({
    ...AFTER_SCREENSHOT_MOCK,
    ...overrides
})
export const createMethodOptions = (overrides = {}) => ({
    ...COMMON_METHOD_OPTIONS,
    ...overrides
})
export const createBaseOptions = (type: 'screen' | 'element', overrides = {}) => {
    const baseOptions = {
        browserInstance: {
            isAndroid: false,
            isMobile: false
        } as any,
        folders: BASE_CHECK_OPTIONS.folders,
        instanceData: BASE_CHECK_OPTIONS.instanceData,
        tag: `test-${type}`
    }

    if (type === 'screen') {
        return {
            ...baseOptions,
            saveScreenOptions: {
                wic: BASE_CHECK_OPTIONS.wic,
                method: COMMON_METHOD_OPTIONS
            },
            ...overrides
        }
    }

    return {
        ...baseOptions,
        saveElementOptions: {
            wic: BASE_CHECK_OPTIONS.wic,
            method: COMMON_METHOD_OPTIONS
        },
        ...overrides
    }
}

export function createTestOptions<T extends InternalSaveMethodOptions>(
    baseOptions: T,
    overrides: Partial<T> = {}
): T {
    const result = {
        ...baseOptions,
        ...overrides
    } as T

    if ('saveScreenOptions' in baseOptions && 'saveScreenOptions' in result) {
        const baseScreenOptions = baseOptions.saveScreenOptions as any
        const overrideScreenOptions = (overrides as any).saveScreenOptions || {}
        result.saveScreenOptions = {
            ...baseScreenOptions,
            ...overrideScreenOptions,
            wic: {
                ...BASE_CHECK_OPTIONS.wic,
                ...(baseScreenOptions?.wic || {}),
                ...(overrideScreenOptions?.wic || {})
            }
        } as any
    }

    if ('saveElementOptions' in baseOptions && 'saveElementOptions' in result) {
        const baseElementOptions = baseOptions.saveElementOptions as any
        const overrideElementOptions = (overrides as any).saveElementOptions || {}
        result.saveElementOptions = {
            ...baseElementOptions,
            ...overrideElementOptions,
            wic: {
                ...BASE_CHECK_OPTIONS.wic,
                ...(baseElementOptions?.wic || {}),
                ...(overrideElementOptions?.wic || {})
            }
        } as any
    }

    return result
}
