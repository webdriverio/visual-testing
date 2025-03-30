import type { DeviceRectangles } from 'webdriver-image-comparison'

export const V6_CLIP_SELECTOR = '#root > :first-child:not(script):not(style)'
export const CLIP_SELECTOR = '#storybook-root > :first-child:not(script):not(style)'
export const NUM_SHARDS = 1
export const PAGE_OPTIONS_MAP: { [key: string]: string } = {
    'saveScreen': 'saveScreenOptions',
    'saveFullPageScreen': 'saveFullPageOptions',
    'saveTabbablePage': 'saveTabbableOptions',
    'checkScreen': 'checkScreenOptions',
    'checkFullPageScreen': 'checkFullPageOptions',
    'checkTabbablePage': 'checkTabbableOptions'
}
export const DEVICE_RECTANGLES: DeviceRectangles = {
    bottomBar: { y: 0, x: 0, width: 0, height: 0 },
    homeBar: { y: 0, x: 0, width: 0, height: 0 },
    leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
    rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
    statusBar: { y: 0, x: 0, width: 0, height: 0 },
    statusBarAndAddressBar: { y: 0, x: 0, width: 0, height: 0 },
    viewport: { y: 0, x: 0, width: 0, height: 0 },
}
