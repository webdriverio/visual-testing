import type { EmulatedDeviceType } from './Types.js'

export const deviceDescriptors: EmulatedDeviceType[]= [
    {
        name: 'iPhone 12 Pro',
        screen: {
            dpr: 3,
            width: 390,
            height: 844
        },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    },
    {
        name: 'iPhone 14 Pro Max',
        screen: {
            dpr: 3,
            width: 430,
            height: 932
        },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    },
    {
        name: 'iPhone 14',
        screen: {
            dpr: 3,
            width: 430,
            height: 932
        },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    },
    {
        name: 'Pixel 7',
        screen: {
            dpr: 2.625,
            width: 412,
            height: 915
        },
        userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
    }
]
