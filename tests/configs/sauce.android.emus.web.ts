import { join } from 'node:path'
import type { Capabilities } from '@wdio/types'
import type { DeviceOrientation, ExtendedSauceLabsCapabilities, SauceWebDeviceOrientation } from '../types/types.ts'

export function sauceAndroidEmusWeb({ buildName }: { buildName: string }) {
    const mobileSpecs = join(process.cwd(), './tests/specs/mobile.web.spec.ts')
    const chromeDriverPhones = (
        ['LANDSCAPE', 'PORTRAIT'] as SauceWebDeviceOrientation[]
    )
        .map((orientation) =>
            ['10.0', '11.0', '12.0', '13.0', '14.0'].map(
                (platformVersion) =>
                    createCaps({
                        deviceName: 'Android GoogleAPI Emulator',
                        platformVersion: platformVersion,
                        orientation: orientation,
                        mobileSpecs,
                        sauceOptions: {
                            build: buildName,
                            deviceOrientation: orientation,
                        },
                    })
            )
        )
        .flat(1)
    const nativeWebScreenshotPhones = (
        ['LANDSCAPE', 'PORTRAIT'] as SauceWebDeviceOrientation[]
    )
        .map((orientation) =>
            ['10.0', '11.0', '12.0', '13.0', '14.0'].map(
                (platformVersion) =>
                    createCaps({
                        deviceName: 'Android GoogleAPI Emulator',
                        platformVersion: platformVersion,
                        orientation: orientation,
                        mobileSpecs,
                        nativeWebScreenshot: true,
                        sauceOptions: {
                            build: buildName,
                            deviceOrientation: orientation
                        },
                        // @TODO: There are issues to get element screenshots with nativeWebScreenshot in LANDSCAPE mode
                        // The Android menu is not abstracted away and:
                        // - is visible in a full page screenshot
                        // - is not abstracted away in an element screenshot
                        wdioIcsCommands:
                            orientation === 'LANDSCAPE' ? ['checkScreen'] : [],
                    })
            )
        )
        .flat(1)
    const chromeDriverTablets = (
        ['LANDSCAPE', 'PORTRAIT'] as SauceWebDeviceOrientation[]
    )
        .map((orientation) =>
            ['10.0', '11.0', '12.0', '13.0'].map(
                (platformVersion) => {
                    const tabletTypesByVersion: Record<string, string> = {
                        '10.0': 'S3',
                        '11.0': 'S7 Plus',
                        '12.0': 'S7 Plus',
                        '13.0': 'S7 Plus',
                    }

                    const tabletType =
                        tabletTypesByVersion[platformVersion] || ''

                    return createCaps({
                        deviceName: `Galaxy Tab ${tabletType} GoogleAPI Emulator`,
                        platformVersion: platformVersion,
                        orientation: orientation,
                        mobileSpecs,
                        sauceOptions: {
                            build: buildName,
                            deviceOrientation: orientation,
                        },
                    })
                }
            )
        )
        .flat(1)
    // There is no Android 10 for Tablets
    const nativeWebScreenshotTablets = (['LANDSCAPE', 'PORTRAIT'] as SauceWebDeviceOrientation[])
        .map((orientation) =>
            ['10.0', '11.0', '12.0', '13.0'].map((platformVersion) => {
                const tabletTypesByVersion: Record<string, string> = {
                    '10.0': 'S3',
                    '11.0': 'S7 Plus',
                    '12.0': 'S7 Plus',
                    '13.0': 'S7 Plus',
                }

                const tabletType = tabletTypesByVersion[platformVersion] || ''

                return createCaps({
                    deviceName: `Galaxy Tab ${tabletType} GoogleAPI Emulator`,
                    platformVersion: platformVersion,
                    orientation: orientation,
                    mobileSpecs,
                    nativeWebScreenshot: true,
                    sauceOptions: {
                        build: buildName,
                        deviceOrientation: orientation,
                    },
                    // @TODO: There are issues to get certain screenshots with nativeWebScreenshot in LANDSCAPE mode
                    // - element screenshots are not perfect
                    // - Fullpage screenshots have the address bar in the screenshot
                    wdioIcsCommands: ['checkScreen'],
                })
            })
        )
        .flat(1)

    return [
        /**
         * Android phones
         */
        ...chromeDriverPhones,
        ...nativeWebScreenshotPhones,

        /**
         * Android Tablets
         */
        ...chromeDriverTablets,
        ...nativeWebScreenshotTablets,
    ]
}

function createCaps({
    // The commands that need to be executed, none means all,
    // otherwise an array of strings with the commands that
    // need to be executed
    wdioIcsCommands = [],
    deviceName,
    mobileSpecs,
    nativeWebScreenshot = false,
    orientation,
    platformVersion,
    sauceOptions,
}: {
    wdioIcsCommands?: string[];
    deviceName: string;
    mobileSpecs: string;
    nativeWebScreenshot?: boolean;
    orientation: string;
    platformVersion: string;
    sauceOptions: ExtendedSauceLabsCapabilities;
}): {
    browserName: string;
    platformName: string;
    'appium:deviceName': string;
    'appium:platformVersion': string;
    'appium:orientation': string;
    'appium:automationName': string;
    'wdio-ics:options': {
        logName: string;
        commands: string[];
    };
    'sauce:options': Capabilities.SauceLabsCapabilities;
    'wdio:specs': string[];
} {
    const driverScreenshotType = nativeWebScreenshot
        ? 'NativeWebScreenshot'
        : 'ChromeDriver'
    return {
        browserName: 'chrome',
        platformName: 'Android',
        'appium:deviceName': deviceName,
        'appium:platformVersion': platformVersion,
        'appium:orientation': orientation,
        ...(nativeWebScreenshot ? { 'appium:nativeWebScreenshot': true } : {}),
        'appium:automationName': 'UIAutomator2',
        'wdio-ics:options': {
            logName: `Emulator${deviceName.replace(
                /(\s+|\(+|\)+|Emulator)/g,
                ''
            )}${orientation.charAt(0).toUpperCase()}${orientation
                .slice(1)
                .toLowerCase()}${driverScreenshotType}${platformVersion}`,
            commands: wdioIcsCommands,
        },
        'sauce:options': {
            ...sauceOptions,
            // Sauce Labs uses lowercase values, `appium:orientation` uses uppercase values
            deviceOrientation: sauceOptions.deviceOrientation?.toLowerCase() as DeviceOrientation | undefined,
            // Sauce Labs has no Appium 3 for these devices (2026-10-04), so this is the newest Appium 2 version they support
            appiumVersion: '2.11.0',
        },
        'wdio:specs': [mobileSpecs],
        // @ts-ignore
        'wdio:enforceWebDriverClassic': true
    }
}
