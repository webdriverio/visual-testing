import type { DeviceRectangles } from '../methods/rectangles.interfaces.js'
import { DEVICE_RECTANGLES } from './constants.js'

export class ViewportContextManager {
    private static instance: ViewportContextManager
    private cachedViewport: DeviceRectangles

    private constructor() {
        this.cachedViewport = DEVICE_RECTANGLES
    }

    static getInstance(): ViewportContextManager {
        if (!ViewportContextManager.instance) {
            ViewportContextManager.instance = new ViewportContextManager()
        }
        return ViewportContextManager.instance
    }

    get(): DeviceRectangles {
        console.log('get viewport = ', this.cachedViewport)
        return this.cachedViewport
    }

    set(viewport: DeviceRectangles): void {
        console.log('set viewport = ', viewport)
        this.cachedViewport = viewport
    }
}
