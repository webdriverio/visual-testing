import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'

/**
 * Saves an image of an element
 */
export default async function saveAppElement(): Promise<ScreenshotOutput> {
    console.log('\n\nNATIVE SAVE ELEMENT SCREENSHOT\n\n')

    return {
        devicePixelRatio: 1,
        fileName: 'filename',
        isLandscape: false,
        path: 'path',
    }
}
