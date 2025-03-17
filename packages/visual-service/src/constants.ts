import type { DeviceRectangles } from './types.js'

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
    statusBarAndAddressBar: { top: 0, left: 0, width: 0, height: 0 },
    viewport: { top: 0, left: 0, width: 0, height: 0 },
    bottomBar: { top: 0, left: 0, width: 0, height: 0 },
    leftSidePadding: { top: 0, left: 0, width: 0, height: 0 },
    rightSidePadding: { top: 0, left: 0, width: 0, height: 0 },
}
