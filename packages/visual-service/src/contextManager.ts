import logger from '@wdio/logger'
import type { DeviceRectangles } from 'webdriver-image-comparison'
import { DEVICE_RECTANGLES } from 'webdriver-image-comparison'

const log = logger('@wdio/visual-service:ContextManager')

export class ContextManager {
    #browser: WebdriverIO.Browser
    #needsUpdate = false
    private cachedViewport: DeviceRectangles = DEVICE_RECTANGLES

    constructor(browser: WebdriverIO.Browser) {
        this.#browser = browser
        this.#browser.on('result', this.#onCommandResult.bind(this))
    }

    getViewportContext(): DeviceRectangles {
        return this.cachedViewport
    }

    setViewPortContext(viewport: DeviceRectangles): void {
        this.cachedViewport = viewport
        this.#needsUpdate = false
    }

    get browser(): WebdriverIO.Browser {
        return this.#browser
    }

    get needsUpdate(): boolean {
        return this.#needsUpdate
    }

    markForUpdate(): void {
        this.#needsUpdate = true
    }

    async #onCommandResult(event: { command: string, body: unknown, result: unknown }) {
        if (event.command === 'setOrientation') {
            const { body: { orientation }, result } = event as { body: { orientation: string }, result: unknown }
            // Check if result exists and is not an error object
            // @ts-expect-error
            const isSuccess = result && !result.error && typeof result === 'object'

            if (isSuccess) {
                log.info(`Device rotation to ${orientation} detected, context will need recalculation.`)
                this.markForUpdate()
            } else {
                log.warn('Orientation set failed: \n', result, '\nWe could not recalibrate the context')
            }
        }
    }
}
