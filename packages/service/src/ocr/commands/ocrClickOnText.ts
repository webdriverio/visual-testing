import ocrGetElementPositionByText from './ocrGetElementPositionByText.js'
import { determineClickPoint } from '../utils/index.js'
import type { OcrClickOnTextOptions } from '../types.js'

export default async function ocrClickOnText(options: OcrClickOnTextOptions): Promise<void> {
    const element = await ocrGetElementPositionByText(options)
    const { x, y } = determineClickPoint({ rectangles: element.dprPosition })
    const actionType = browser.isMobile ? 'touch' : 'mouse'
    const clickDuration = options.clickDuration ? options.clickDuration : 500

    await browser
        .action('pointer', {
            parameters: { pointerType: actionType }
        })
        .move({ duration: 0, x, y })
        .down({ button: 0 })
        .pause(clickDuration as number)
        .up({ button: 0 })
        .perform()
}
