import { join } from 'node:path'
import type { DeviceOrientation, ExtendedSauceLabsCapabilities } from '../types/types.ts'

export function sauceAndroidEmusApp({ buildName }: { buildName: string }) {
    const mobileSpecs = join(process.cwd(), './tests/specs/mobile.app.spec.ts')
    const emulators = (
        ['PORTRAIT'] as DeviceOrientation[]
    )
        .map((orientation) =>
            ['8.1', '9.0', '10.0', '11.0', '12.0', '13.0', '14.0'].map(
                (platformVersion) =>
                    createCaps({
                        deviceName: 'Android GoogleAPI Emulator',
                        platformVersion: platformVersion,
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
    'sauce:options': ExtendedSauceLabsCapabilities;
    specs: string[];
} {
    const driverScreenshotType = nativeWebScreenshot
        ? 'NativeWebScreenshot'
        : 'ChromeDriver'
    return {
        platformName: 'Android',
        'appium:app': 'https://github.com/webdriverio/native-demo-app/releases/download/v1.0.8/android.wdio.native.app.v1.0.8.apk',
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
            appiumVersion: '2.0.0',
        },
        specs: [mobileSpecs],
    }
}
