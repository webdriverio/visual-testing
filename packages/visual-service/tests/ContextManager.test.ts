import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DEVICE_RECTANGLES } from '@wdio/image-comparison-core'
import { ContextManager } from '../src/contextManager.js'

vi.mock('../src/utils', async () => {
    return {
        getNativeContext: vi.fn().mockReturnValue(true),
    }
})

describe('ContextManager', () => {
    let browserMock: WebdriverIO.Browser
    let eventHandlers: Record<string, Function>

    beforeEach(() => {
        eventHandlers = {}
        browserMock = {
            capabilities: {},
            isMobile: true,
            on: vi.fn((event: string, handler: Function) => {
                eventHandlers[event] = handler
            })
        } as unknown as WebdriverIO.Browser
    })

    it('should initialize with default values and attach event listener', () => {
        const cm = new ContextManager(browserMock)
        expect(cm.getViewportContext()).toEqual(DEVICE_RECTANGLES)
        expect(cm.needsUpdate).toBe(false)
        expect(browserMock.on).toHaveBeenCalledWith('result', expect.any(Function))
    })

    it('should update the viewport context and reset the needsUpdate flag', () => {
        const cm = new ContextManager(browserMock)
        const newRects = {
            ...DEVICE_RECTANGLES,
            screenSize: { height: 100, width: 200 },
        }
        cm.setViewPortContext(newRects)
        expect(cm.getViewportContext()).toEqual(newRects)
        expect(cm.needsUpdate).toBe(false)
    })

    it('should mark for update', () => {
        const cm = new ContextManager(browserMock)
        cm.markForUpdate()
        expect(cm.needsUpdate).toBe(true)
    })

    it('should handle orientation change command', async () => {
        const cm = new ContextManager(browserMock)
        const event = {
            command: 'setOrientation',
            body: { orientation: 'LANDSCAPE' },
            result: {},
        }
        // @ts-ignore
        await eventHandlers.result(event)
        expect(cm.needsUpdate).toBe(true)
    })

    it('should not mark for update if orientation fails', async () => {
        const cm = new ContextManager(browserMock)
        const event = {
            command: 'setOrientation',
            body: { orientation: 'PORTRAIT' },
            result: { error: 'some error' }
        }
        // @ts-ignore
        await eventHandlers.result(event)
        expect(cm.needsUpdate).toBe(false)
    })

    it('should not mark for update on invalid command', async () => {
        const cm = new ContextManager(browserMock)
        const event = {
            command: 'unknownCommand',
            body: {},
            result: {},
        }
        // @ts-ignore
        await eventHandlers.result(event)
        expect(cm.needsUpdate).toBe(false)
    })

    it('should handle context change command (switchAppiumContext)', async () => {
        const cm = new ContextManager(browserMock)
        const event = {
            command: 'switchAppiumContext',
            body: { name: 'WEBVIEW_1' },
            result: {},
        }
        // @ts-ignore
        await eventHandlers.result(event)
        expect(await cm.getCurrentContext()).toBe('WEBVIEW_1')
        expect(cm.needsUpdate).toBe(true)
    })

    it('should handle context change command (switchContext)', async () => {
        const cm = new ContextManager(browserMock)
        const event = {
            command: 'switchContext',
            body: { name: 'NATIVE_APP' },
            result: {},
        }
        // @ts-ignore
        await eventHandlers.result(event)
        expect(await cm.getCurrentContext()).toBe('NATIVE_APP')
        expect(cm.needsUpdate).toBe(false)
    })
})
