import { join } from 'node:path'
import type { DeviceOrientation } from '../types/types.ts'

export function lambdaTestIosSimWeb({ buildName }: { buildName: string }) {
    const mobileSpecs = join(process.cwd(), './tests/specs/mobile.web.spec.ts')
    const iOSDevices = [
        {
            // 812
            deviceName: 'iPhone 13 mini',
            platformVersion: '17.5',
        },
        {
            // 844
            deviceName: 'iPhone 13 Pro',
            platformVersion: '16.0',
        },
        {
            // 852
            deviceName: 'iPhone 14 Pro',
            platformVersion: '17.5',
        },
        {
            // 932
            deviceName: 'iPhone 15 Pro Max',
            platformVersion: '18.0',
        }
    ]

    return [
        ...(['landscape', 'portrait'] as DeviceOrientation[])
            .map((orientation) => iOSDevices
                .map(({ deviceName, platformVersion }) => ({
                    'lt:options': {
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

