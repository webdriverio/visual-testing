
import { describe, it, expect, vi, beforeEach } from 'vitest'
import sendKeys from '../../src/utils/sendKeys.js'
import { Key } from 'webdriverio'

vi.mock('@wdio/globals', () => {
    return {
        browser: {
            isIOS: false,
            action: vi.fn().mockReturnThis(),
            down: vi.fn().mockReturnThis(),
            pause: vi.fn().mockReturnThis(),
            up: vi.fn().mockReturnThis(),
            perform: vi.fn().mockResolvedValue(null),
        },
    }
})

describe('sendKeys', () => {
    let mockBrowser

    beforeEach(async() => {
        vi.clearAllMocks()

        const { browser } = vi.mocked(await import('@wdio/globals'))
        mockBrowser = browser
    })

    it('should send text with the correct action calls for a non iOS device', async () => {
        await sendKeys(mockBrowser, 'test input', false)

        expect(mockBrowser.action).toHaveBeenCalledWith('key')
        expect(mockBrowser.down).toHaveBeenCalledTimes(10)
        expect(mockBrowser.up).toHaveBeenCalledTimes(10)
        expect(mockBrowser.pause).not.toHaveBeenCalled()
        expect(mockBrowser.perform).toHaveBeenCalled()
    })

    it('should send and submit text with the correct action calls for a non iOS device', async () => {
        await sendKeys(mockBrowser, 'test input', true)

        expect(mockBrowser.action).toHaveBeenCalledWith('key')
        expect(mockBrowser.down).toHaveBeenCalledTimes(11)
        expect(mockBrowser.up).toHaveBeenCalledTimes(11)
        expect(mockBrowser.pause).toHaveBeenCalledWith(50)
        expect(mockBrowser.down).toHaveBeenCalledWith(Key.Enter)
        expect(mockBrowser.up).toHaveBeenCalledWith(Key.Enter)
        expect(mockBrowser.perform).toHaveBeenCalled()
    })

    it('should send and submit text with the correct action calls for an iOS device', async () => {
        mockBrowser.isIOS = true
        await sendKeys(mockBrowser, 'test input', true)

        expect(mockBrowser.action).toHaveBeenCalledWith('key')
        expect(mockBrowser.down).toHaveBeenCalledTimes(11)
        expect(mockBrowser.up).toHaveBeenCalledTimes(11)
        expect(mockBrowser.pause).not.toHaveBeenCalled()
        expect(mockBrowser.down).toHaveBeenCalledWith(Key.Enter)
        expect(mockBrowser.up).toHaveBeenCalledWith(Key.Enter)
        expect(mockBrowser.perform).toHaveBeenCalled()
    })
})
