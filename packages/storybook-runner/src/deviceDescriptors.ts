import type { EmulatedDeviceType } from './types.js'

// This is a reflection of what the Chromium Devtools provides for device emulation
// https://source.chromium.org/chromium/chromium/src/+/main:out/fuchsia-Debug/gen/third_party/devtools-frontend/src/front_end/models/emulation/emulation.js?q=%22iPhone%204%22&ss=chromium
export const deviceDescriptors: EmulatedDeviceType[]= [
    {
        'name': 'iPad Mini',
        'screen': {
            'dpr': 2,
            'width': 1024,
            'height': 768
        },
        'userAgent': 'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    },
    {
        'name': 'iPad',
        'screen': {
            'dpr': 2,
            'width': 1024,
            'height': 768
        },
        'userAgent': 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1'
    },
    {
        'name': 'iPad Pro',
        'screen': {
            'dpr': 2,
            'width': 1366,
            'height': 1024
        },
        'userAgent': 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1'
    },
    {
        'name': 'iPhone SE',
        'screen': {
            'dpr': 2,
            'width': 320,
            'height': 568
        },
        'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/17.4 Mobile/14E304 Safari/602.1'
    },
    {
        'name': 'iPhone X',
        'screen': {
            'dpr': 3,
            'width': 375,
            'height': 812
        },
        'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/17.4 Mobile/15A372 Safari/604.1'
    },
    {
        'name': 'iPhone XR',
        'screen': {
            'dpr': 3,
            'width': 414,
            'height': 896
        },
        'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
    },
    {
        'name': 'iPhone 13',
        'screen': {
            'dpr': 3,
            'width': 390,
            'height': 844
        },
        'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
    },
    {
        'name': 'iPhone 14 Plus',
        'screen': {
            'dpr': 3,
            'width': 428,
            'height': 926
        },
        'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
    },
    {
        'name': 'iPhone 14 Pro',
        'screen': {
            'dpr': 3,
            'width': 393,
            'height': 852
        },
        'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
    },
    {
        'name': 'iPhone 14 Pro Max',
        'screen': {
            'dpr': 3,
            'width': 430,
            'height': 932
        },
        'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
    },
    {
        'name': 'Pixel 2',
        'screen': {
            'dpr': 2.625,
            'width': 411,
            'height': 731,
        },
        'userAgent': 'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36'
    },
    {
        'name': 'Pixel 2 XL',
        'screen': {
            'dpr': 3.5,
            'width': 411,
            'height': 823,
        },
        'userAgent': 'Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36'
    },
    {
        'name': 'Pixel 3',
        'screen': {
            'dpr': 2.75,
            'width': 393,
            'height': 786,
        },
        'userAgent': 'Mozilla/5.0 (Linux; Android 9; Pixel 3 Build/PQ1A.181105.017.A1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.158 Mobile Safari/537.36'
    },
    {
        'name': 'Pixel 4',
        'screen': {
            'dpr': 3,
            'width': 353,
            'height': 745,
        },
        'userAgent': 'Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36'
    },
    {
        'name': 'Pixel 3 XL',
        'screen': {
            'dpr': 2.75,
            'width': 393,
            'height': 786,
        },
        'userAgent': 'Mozilla/5.0 (Linux; Android 11; Pixel 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36'
    },
    {
        'name': 'Pixel 7',
        'screen': {
            'dpr': 2.625,
            'width': 412,
            'height': 915,
        },
        'userAgent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
    },
    {
        'name': 'Samsung Galaxy A51/71',
        'screen': {
            'dpr': 2.625,
            'width': 412,
            'height': 914,
        },
        'userAgent': 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
    },
    {
        'name': 'Samsung Galaxy S8+',
        'screen': {
            'dpr': 4,
            'width': 360,
            'height': 740,
        },
        'userAgent': 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
    },
    {
        'name': 'Galaxy Z Fold 5',
        'screen': {
            'dpr': 2.625,
            'width': 344,
            'height': 882,
        },
        'userAgent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36'
    },
    {
        'name': 'Galaxy S8',
        'screen': {
            'dpr': 3,
            'width': 360,
            'height': 740,
        },
        'userAgent': 'Mozilla/5.0 (Linux; Android 7.0; SM-G950U Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36'
    },
    {
        'name': 'Galaxy S9+',
        'screen': {
            'dpr': 4.5,
            'width': 320,
            'height': 658,
        },
        'userAgent': 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G965U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.111 Mobile Safari/537.36'
    },
    {
        'name': 'Galaxy Tab S4',
        'screen': {
            'dpr': 2.25,
            'width': 712,
            'height': 1138,
        },
        'userAgent': 'Mozilla/5.0 (Linux; Android 8.1.0; SM-T837A) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.80 Safari/537.36',
    },
    {
        'name': 'Surface Pro 7',
        'screen': {
            'dpr': 2,
            'height': 912,
            'width': 1368,
        },
        'userAgent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
    },
    {
        'name': 'Surface Duo',
        'screen': {
            'dpr': 2.5,
            'height': 540,
            'width': 720,
        },
        'userAgent': 'Mozilla/5.0 (Linux; Android 11.0; Surface Duo) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36'
    },
]
