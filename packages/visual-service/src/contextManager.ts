import logger from '@wdio/logger'
import type { DeviceRectangles } from 'webdriver-image-comparison'
import { DEVICE_RECTANGLES } from 'webdriver-image-comparison'
import { getNativeContext } from './utils.js'

const log = logger('@wdio/visual-service:ContextManager')

export class ContextManager {
    #browser: WebdriverIO.Browser
    #needsUpdate = false
    #currentContext?: string
    #isNativeContext: boolean
    private cachedViewport: DeviceRectangles = DEVICE_RECTANGLES

    constructor(browser: WebdriverIO.Browser) {
        this.#browser = browser
        const capabilities = this.#browser.requestedCapabilities
        this.#isNativeContext = getNativeContext({ capabilities, isMobile: this.#browser.isMobile })
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

    setCurrentContext(context: string) {
        this.#currentContext = context
        if (this.#browser.isMobile) {
            this.#isNativeContext = context ? context === 'NATIVE_APP' : this.#isNativeContext
        }
    }

    async getCurrentContext () {
        return this.#currentContext
    }

    get isNativeContext() {
        return this.#isNativeContext
    }

    async #onCommandResult(event: { command: string, body: unknown, result: unknown }) {
        const commands = ['switchAppiumContext', 'switchContext', 'setOrientation']
        if (commands.includes(event.command)) {
            const { body: { name, orientation }, result } = event as { body: { name?: string; orientation?: string }, result: unknown }
            // Check if result exists and is not an error object
            // @ts-expect-error
            const isSuccess = result && !result.error && typeof result === 'object'
            if (isSuccess) {
                if (event.command === 'setOrientation') {
                    log.info(`Device rotation to "${orientation}" detected, context will need recalculation.`)
                    this.markForUpdate()
                } else {
                    if (name && name !== 'NATIVE_APP') {
                        log.info(`Context changed to "${name}", context will need recalculation.`)
                        this.markForUpdate()
                    }
                    // Set the context to the current context
                    this.setCurrentContext(name as string)
                }
            } else {
                log.warn('Orientation set failed: \n', result, '\nWe could not recalibrate the context')
            }
        }
    }
}
