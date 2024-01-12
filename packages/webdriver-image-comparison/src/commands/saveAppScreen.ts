import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'

/**
 * Saves an image of the viewport of the screen
 */
export default async function saveAppScreen(): Promise<ScreenshotOutput> {
    console.log('\n\nNATIVE SAVE SCREEN SCREENSHOT\n\n')

    return {
        devicePixelRatio: 1,
        fileName: 'filename',
        isLandscape: false,
        path: 'path',
    }
}
