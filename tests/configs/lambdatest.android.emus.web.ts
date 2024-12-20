import { join } from 'node:path'
import type { DeviceOrientation } from '../types/types.ts'

export function lambdaTestAndroidEmusWeb({ buildName }: { buildName: string }) {
    const mobileSpecs = join(process.cwd(), './tests/specs/mobile.web.spec.ts')
    const nativeWebScreenshotPhones = (['landscape', 'portrait'] as DeviceOrientation[])
        .map((orientation) =>
            ['11', '12', '13', '14', '15'].map(
                (platformVersion) =>
                    createCaps({
                        platformVersion: platformVersion,
                        mobileSpecs,
                        build: buildName,
                        deviceOrientation: orientation,
                        // @TODO: There are issues to get certain screenshots with nativeWebScreenshot in LANDSCAPE mode
                        // There is also a small issue with out of bound offsets with landscape mode on Pixel 4 Android 14.
                        // So we limit it to portrait mode
                        // Error: The value of "offset" is out of range. It must be >= 0 and <= 9849596. Received 9849600 => this 4 is coming from Jimp
                        // @TODO: investigate the issue with out of bound offsets in landscape mode
                        wdioIcsCommands: [
                            'checkScreen',
                            'checkElement',
                            platformVersion !== '14' && platformVersion !== '11' ? 'checkFullPageScreen' : ''
                        ],
                    })
            )
        )
        .flat(1)
    // We limit it to the latest 2 versions of Android Tablets that LT supports
    const nativeWebScreenshotTablets = (['landscape', 'portrait'] as DeviceOrientation[])
        .map((orientation) =>
            ['13', '14'].map((platformVersion) => {
                return createCaps({
                    deviceName: 'Galaxy Tab S8',
                    platformVersion: platformVersion,
                    mobileSpecs,
                    build: buildName,
                    deviceOrientation: orientation,
                    // @TODO: There are issues to get certain screenshots with nativeWebScreenshot in LANDSCAPE mode
                    // - element screenshots are not perfect
                    // - Fullpage screenshots have the address bar in the screenshot
                    wdioIcsCommands: [
                        'checkScreen',
                        orientation !== 'landscape' ? 'checkElement' : '',
                        // @TODO: navigation bar and so on are not set properly, not only in landscape but also portrait mode
                        // orientation !== 'landscape' ? 'checkFullPageScreen' : ''
                    ],
                })
            })
        )
        .flat(1)

    return [
        /**
         * Android phones
         * 20241216: LT doesn't have the option to take a ChromeDriver screenshot,
         * so if it's Android it's always native
         */
        ...nativeWebScreenshotPhones,

        // /**
        //  * Android Tablets
        //  * 20241216: LT doesn't have the option to take a ChromeDriver screenshot,
        //  * so if it's Android it's always native
        //  */
        ...nativeWebScreenshotTablets,
    ]
}

function createCaps({
    // The commands that need to be executed, none means all,
    // otherwise an array of strings with the commands that
    // need to be executed
    wdioIcsCommands = [],
    deviceName = '',
    mobileSpecs,
    platformVersion,
    build,
    deviceOrientation,
}: {
    wdioIcsCommands?: string[];
    deviceName?: string;
    platformVersion: string;
    mobileSpecs: string;
    build: string;
    deviceOrientation: DeviceOrientation;

}): {
    'lt:options': {
        deviceName: string,
        platformName: string,
        platformVersion: string,
        deviceOrientation: DeviceOrientation,
        build: string,
        w3c: boolean,
        queueTimeout: number,
    },
    specs: string[];
    'wdio-ics:options': {
        logName: string;
        commands: string[];
    };
    'wdio:enforceWebDriverClassic': boolean;
    } {
    const driverScreenshotType = 'NativeWebScreenshot'
    const adjustedDeviceName = deviceName !== '' ?
        deviceName :
        Number(platformVersion) < 14 ? 'Pixel 4' : 'Pixel 9 Pro'

    return {
        'lt:options': {
            deviceName: adjustedDeviceName,
            platformName: 'android',
            platformVersion,
            deviceOrientation,
            build,
            w3c: true,
            queueTimeout: 900,
        },
        specs: [mobileSpecs],
        'wdio-ics:options': {
            logName: `Emulator${adjustedDeviceName.replace(
                /(\s+|\(+|\)+|Emulator)/g,
                ''
            )}${deviceOrientation.charAt(0).toUpperCase()}${deviceOrientation
                .slice(1)
                .toLowerCase()}${driverScreenshotType}${platformVersion}`,
            commands: wdioIcsCommands,
        },
        'wdio:enforceWebDriverClassic': true
    }
}
