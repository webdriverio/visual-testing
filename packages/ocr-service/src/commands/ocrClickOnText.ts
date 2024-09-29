import ocrGetElementPositionByText from './ocrGetElementPositionByText.js'
import { determineClickPoint } from '../utils/index.js'
import type { OcrClickOnTextOptions } from '../types.js'
import { drawTarget } from '../utils/imageProcessing.js'

export default async function ocrClickOnText(this: WebdriverIO.Browser, options: OcrClickOnTextOptions): Promise<void> {
    const element = await ocrGetElementPositionByText.bind(this)(options)
    let { x, y } = determineClickPoint({ rectangles: element.dprPosition })
    const { relativePosition } = options

    // Adjust the x and y coordinates based on the relative position
    if (relativePosition) {
        const { above = 0, below = 0, left = 0, right = 0 } = relativePosition
        x = x - left + right
        y = y - above + below
    }

    // Draw a target on the image so a user can see where the click will happen
    await drawTarget({ filePath: element.filePath, targetX: x, targetY: y })

    const actionType = this.isMobile ? 'touch' : 'mouse'
    const clickDuration = options.clickDuration ? options.clickDuration : 500

    await this
        .action('pointer', {
            parameters: { pointerType: actionType }
        })
        .move({ duration: 0, x, y })
        .down({ button: 0 })
        .pause(clickDuration as number)
        .up({ button: 0 })
        .perform()
}
