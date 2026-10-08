import { DEVICE_RECTANGLES } from '@wdio/image-comparison-core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as utilsModule from '../src/utils.js'
import { wrapWithContext } from '../src/wrapWithContext.js'

describe('wrapWithContext', () => {
    let mockCommand: any
    let mockContextManager: any
    let mockBrowser: WebdriverIO.Browser

    beforeEach(() => {
        mockCommand = vi.fn()
        mockContextManager = {
            needsUpdate: false,
            getViewportContext: vi.fn(() => DEVICE_RECTANGLES),
            setViewPortContext: vi.fn(),
            isNativeContext: false,
        }
        mockBrowser = {} as WebdriverIO.Browser
    })

    it('should call command directly when no update is needed', async () => {
        const wrapper = wrapWithContext({
            browserInstance: mockBrowser,
            command: mockCommand,
            contextManager: mockContextManager,
            getArgs: () => ['arg1']
        })

        await wrapper.call(mockBrowser)
        expect(mockCommand).toHaveBeenCalledWith('arg1')
        expect(mockContextManager.setViewPortContext).not.toHaveBeenCalled()
    })

    it('should fetch new instanceData and update context when needed', async () => {
        mockContextManager.needsUpdate = true
        const updatedRectangles = {
            ...DEVICE_RECTANGLES,
            screenSize: { height: 900, width: 450 }
        }

        const getInstanceDataMock = vi.spyOn(utilsModule, 'getInstanceData').mockResolvedValue({
            deviceRectangles: updatedRectangles,
            devicePixelRatio: 3,
        } as any)

        const wrapper = wrapWithContext({
            browserInstance: mockBrowser,
            command: mockCommand,
            contextManager: mockContextManager,
            getArgs: () => ['arg2']
        })

        await wrapper.call(mockBrowser)

        expect(getInstanceDataMock).toHaveBeenCalled()
        expect(mockContextManager.setViewPortContext).toHaveBeenCalledWith(updatedRectangles)
        expect(mockCommand).toHaveBeenCalledWith('arg2')

        getInstanceDataMock.mockRestore()
    })

    it('should activate a browsing context in a background tab before the command', async () => {
        const calls: string[] = []
        const activateMock = vi.spyOn(utilsModule, 'activateHiddenBrowsingContext').mockImplementation(async () => {
            calls.push('activate')
        })
        mockCommand.mockImplementation(() => calls.push('command'))

        const wrapper = wrapWithContext({
            browserInstance: mockBrowser,
            command: mockCommand,
            contextManager: mockContextManager,
            getArgs: () => ['arg3']
        })

        await wrapper.call(mockBrowser)

        expect(activateMock).toHaveBeenCalledWith(mockBrowser, false)
        expect(calls).toEqual(['activate', 'command'])

        activateMock.mockRestore()
    })
})
