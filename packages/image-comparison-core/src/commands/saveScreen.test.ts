import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import saveScreen from './saveScreen.js'
import type { InternalSaveScreenMethodOptions } from './save.interfaces.js'
import { createBaseOptions } from '../mocks/mocks.js'

vi.mock('./saveAppScreen.js', () => ({
    default: vi.fn().mockResolvedValue({
        devicePixelRatio: 2,
        fileName: 'test-app-screen.png'
    })
}))
vi.mock('./saveWebScreen.js', () => ({
    default: vi.fn().mockResolvedValue({
        devicePixelRatio: 2,
        fileName: 'test-web-screen.png'
    })
}))

describe('saveScreen', () => {
    let saveAppScreen: any
    let saveWebScreen: any

    const baseOptions = createBaseOptions('screen') as InternalSaveScreenMethodOptions

    beforeEach(async () => {
        saveAppScreen = (await import('./saveAppScreen.js')).default
        saveWebScreen = (await import('./saveWebScreen.js')).default
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should call saveAppScreen when in native context', async () => {
        const options = {
            ...baseOptions,
            isNativeContext: true
        }
        const result = await saveScreen(options)

        expect(result).toMatchSnapshot()
        expect(saveAppScreen).toHaveBeenCalledWith(options)
        expect(saveWebScreen).not.toHaveBeenCalled()
    })

    it('should call saveWebScreen when not in native context', async () => {
        const options = {
            ...baseOptions,
            isNativeContext: false
        }
        const result = await saveScreen(options)

        expect(result).toMatchSnapshot()
        expect(saveWebScreen).toHaveBeenCalledWith(options)
        expect(saveAppScreen).not.toHaveBeenCalled()
    })
})
