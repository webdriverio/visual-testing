import { join } from 'node:path'
import type { DeviceOrientation } from '../types/types.ts'

export function lambdaTestIosSimWeb({ buildName }: { buildName: string }) {
    const mobileSpecs = join(process.cwd(), './tests/specs/mobile.web.spec.ts')
    const iOSDevices = [
        {
            appiumVersion: '3.0.2',
            deviceName: 'iPhone 14 Pro',
            platformVersion: '17.5',
        },
        {
            appiumVersion: '3.0.2',
            deviceName: 'iPhone 15 Pro Max',
            platformVersion: '18.5',
        },
        {
            deviceName: 'iPhone 17 Pro Max',
            platformVersion: '26.2',
        }
    ]

    return [
        ...([
            'landscape',
            'portrait'
        ] as DeviceOrientation[])
            .map((orientation) => iOSDevices
                .map(({ appiumVersion, deviceName, platformVersion }) => ({
                    'lt:options': {
                        ...(appiumVersion ? { appiumVersion } : {}),
                        deviceName,
                        platformName: 'ios',
                        platformVersion,
                        build:buildName,
                        deviceOrientation:orientation,
                        w3c: true,
                        queueTimeout: 900,
                    },
                    'wdio-ics:options': {
                        logName: `${deviceName
                            .split(' ')
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join('')}${orientation.charAt(0).toUpperCase() + orientation.slice(1).toLowerCase()}${platformVersion.split('.')[0]}`
                            .replace(/(\s+|\(+|\)+|Simulator)/g, ''),
                        commands: ['checkScreen', 'checkElement', 'checkFullPageScreen'],
                    },
                    specs: [mobileSpecs],
                }))
            )
            .flat(1),
    ]
}

