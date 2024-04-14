import { join } from 'node:path'
import logger from '@wdio/logger'
import { describe, expect, it, vi } from 'vitest'
import VisualService from '../src/index.js'

vi.mock('webdriver-image-comparison', () => ({
    BaseClass: class {},
    checkElement: vi.fn(),
    checkFullPageScreen: vi.fn(),
    checkScreen: vi.fn(),
    saveElement: vi.fn(),
    saveFullPageScreen: vi.fn(),
    saveScreen: vi.fn(),
    saveTabbablePage: vi.fn(),
    checkTabbablePage: vi.fn(),
}))
vi.mock('../src/ocr/utils', () => ({
    createOcrDir: vi.fn(() => '/mocked/path')
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
            requestedCapabilities: {}
        } as any as WebdriverIO.Browser
        await service.before({}, [], browser)
        // expect(log.warn).toBeCalledTimes(1)
        expect(logWarnMock.mock.calls[0][0])
            .toContain('Expect package not found. This means that the custom matchers `toMatchScreenSnapshot|toMatchFullPageSnapshot|toMatchElementSnapshot|toMatchTabbablePageSnapshot` are not added and can not be used. Please make sure to add it to your `package.json` if you want to use the Visual custom matchers.')
    })
})
