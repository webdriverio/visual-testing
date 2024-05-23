
import { describe, it, expect, vi, beforeEach } from 'vitest'
import sendKeys from '../../src/utils/sendKeys.js'
import { Key } from 'webdriverio'

// This mock doesn't really replicate the action API, but when I mock it like it should ths mocks are not registered
// and spies won't work, now it works
global.browser = {
    isIOS: false,
    action: vi.fn().mockReturnThis(),
    down: vi.fn().mockReturnThis(),
    pause: vi.fn().mockReturnThis(),
    up: vi.fn().mockReturnThis(),
    perform: vi.fn().mockResolvedValue(null)
} as any as WebdriverIO.Browser

describe('sendKeys', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should send text with the correct action calls for a non iOS device ', async() => {
        await sendKeys('test input', false)

        expect(global.browser.action).toHaveBeenCalledWith('key')
        // @ts-ignore, see above
        expect(global.browser.down).toHaveBeenCalledTimes(10)
        // @ts-ignore, see above
        expect(global.browser.up).toHaveBeenCalledTimes(10)
        // @ts-ignore, see above
        expect(global.browser.pause).not.toHaveBeenCalled()
        // @ts-ignore, see above
        expect(global.browser.perform).toHaveBeenCalled()
    })

    it('should send and submit text with the correct action calls for a non iOS device ', async () => {
        await sendKeys('test input', true)

        expect(global.browser.action).toHaveBeenCalledWith('key')
        // @ts-ignore, see above
        expect(global.browser.down).toHaveBeenCalledTimes(11)
        // @ts-ignore, see above
        expect(global.browser.up).toHaveBeenCalledTimes(11)
        // @ts-ignore, see above
        expect(global.browser.pause).toHaveBeenCalledWith(50)
        // @ts-ignore, see above
        expect(global.browser.down).toHaveBeenCalledWith(Key.Enter)
        // @ts-ignore, see above
        expect(global.browser.up).toHaveBeenCalledWith(Key.Enter)
        // @ts-ignore, see above
        expect(global.browser.perform).toHaveBeenCalled()
    })

    it('should send and submit text with the correct action calls for an iOS device ', async () => {
        global.browser.isIOS = true
        await sendKeys('test input', true)

        expect(global.browser.action).toHaveBeenCalledWith('key')
        // @ts-ignore, see above
        expect(global.browser.down).toHaveBeenCalledTimes(11)
        // @ts-ignore, see above
        expect(global.browser.up).toHaveBeenCalledTimes(11)
        // @ts-ignore, see above
        expect(global.browser.pause).not.toHaveBeenCalled()
        // @ts-ignore, see above
        expect(global.browser.down).toHaveBeenCalledWith(Key.Enter)
        // @ts-ignore, see above
        expect(global.browser.up).toHaveBeenCalledWith(Key.Enter)
        // @ts-ignore, see above
        expect(global.browser.perform).toHaveBeenCalled()
    })
})
