import { join } from 'node:path'
import logger from '@wdio/logger'
import { describe, expect, it, vi } from 'vitest'
import VisualService from '../src/index.js'

vi.mock('@wdio/image-comparison-core', () => ({
    BaseClass: class {},
    checkElement: vi.fn(),
    checkFullPageScreen: vi.fn(),
    checkScreen: vi.fn(),
    saveElement: vi.fn(),
    saveFullPageScreen: vi.fn(),
    saveScreen: vi.fn(),
    saveTabbablePage: vi.fn(),
    checkTabbablePage: vi.fn(),
    execute: vi.fn(),
    DEFAULT_TEST_CONTEXT: {},
    NOT_KNOWN: 'not_known',
    DEVICE_RECTANGLES: {
        bottomBar: { y: 0, x: 0, width: 0, height: 0 },
        homeBar: { y: 0, x: 0, width: 0, height: 0 },
        leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
        rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
        statusBar: { y: 0, x: 0, width: 0, height: 0 },
        statusBarAndAddressBar: { y: 0, x: 0, width: 0, height: 0 },
        screenSize: { width: 0, height: 0 },
        viewport: { y: 0, x: 0, width: 0, height: 0 },
    }
}))

const log = logger('test')

vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))

describe('@wdio/visual-service', () => {
    it('should not register custom matchers', async () => {
        const logWarnMock = vi.spyOn(log, 'warn')
        const service = new VisualService({}, {}, {} as unknown as WebdriverIO.Config)
        const browser = {
            isMultiremote: false,
            addCommand: vi.fn(),
            capabilities: {},
            requestedCapabilities: {},
            on: vi.fn(),
            execute: vi.fn(),
        } as any as WebdriverIO.Browser
        await service.before({}, [], browser)
        // expect(log.warn).toBeCalledTimes(1)
        expect(logWarnMock.mock.calls[0][0])
            .toContain('Expect package not found. This means that the custom matchers `toMatchScreenSnapshot|toMatchFullPageSnapshot|toMatchElementSnapshot|toMatchTabbablePageSnapshot` are not added and can not be used. Please make sure to add it to your `package.json` if you want to use the Visual custom matchers.')
    })
})
