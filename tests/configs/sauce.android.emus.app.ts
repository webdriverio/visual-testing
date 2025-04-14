import { join } from 'node:path'
import type { DeviceOrientation, SauceDeviceOptions } from '../types/types.ts'

export function sauceAndroidEmusApp({ buildName }: { buildName: string }) {
    const mobileSpecs = join(process.cwd(), './tests/specs/mobile.app.spec.ts')
    const emulators = (
        ['portrait'] as DeviceOrientation[]
    )
        .map((orientation) =>
            [
                { deviceName:'Google Pixel 4 XL GoogleAPI Emulator', platformVersion:'11.0' },
                { deviceName:'Google Pixel 4 XL GoogleAPI Emulator', platformVersion:'12.0' },
                { deviceName:'Google Pixel 4 XL GoogleAPI Emulator', platformVersion:'13.0' },
                { deviceName:'Google Pixel 4 XL GoogleAPI Emulator', platformVersion:'14.0' },
                { deviceName:'Google Pixel 4 XL GoogleAPI Emulator', platformVersion:'15.0' },
            ].map(
                (cap) =>
                    createCaps({
                        deviceName: cap.deviceName,
                        platformVersion: cap.platformVersion,
                        orientation: orientation,
                        mobileSpecs,
                        sauceOptions: {
                            build: buildName,
                            deviceOrientation: orientation
                        },
                    })
            )
        )
        .flat(1)

    return [...emulators]
}

function createCaps({
    // The commands that need to be executed, none means all,
    // otherwise an array of strings with the commands that
    // need to be executed
    wdioIcsCommands = [],
    deviceName,
    mobileSpecs,
    orientation,
    platformVersion,
    sauceOptions,
}: {
    wdioIcsCommands?: string[];
    deviceName: string;
    mobileSpecs: string;
    orientation: string;
    platformVersion: string;
    sauceOptions: SauceDeviceOptions;
}): {
    platformName: string;
    'appium:app': string;
    'appium:deviceName': string;
    'appium:platformVersion': string;
    'appium:orientation': string;
    'appium:automationName': string;
    'wdio-ics:options': {
        logName: string;
        commands: string[];
    };
    'sauce:options': SauceDeviceOptions;
    specs: string[];
} {
    return {
        platformName: 'Android',
        'appium:app': 'https://github.com/webdriverio/native-demo-app/releases/download/v1.0.8/android.wdio.native.app.v1.0.8.apk',
        'appium:deviceName': deviceName,
        'appium:platformVersion': platformVersion,
        'appium:orientation': orientation.toUpperCase(),
        'appium:automationName': 'UIAutomator2',
        // @ts-expect-error
        'appium:nativeWebScreenshot': true,
        'wdio-ics:options': {
            logName: `app-Emulator${deviceName.replace(
                /(\s+|\(+|\)+|Emulator)/g,
                ''
            )}${orientation.charAt(0).toUpperCase()}${orientation
                .slice(1)
                .toLowerCase()}${platformVersion}`,
            commands: wdioIcsCommands,
        },
        'sauce:options': {
            ...sauceOptions,
            appiumVersion: '2.0.0',
        },
        specs: [mobileSpecs],
    }
}
