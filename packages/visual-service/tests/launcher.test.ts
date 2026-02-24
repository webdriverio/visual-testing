import { rmSync } from 'node:fs'
import { join } from 'node:path'
import type { Services } from '@wdio/types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import VisualLauncher from '../src/launcher.js'
import * as storybookHooks from '../src/storybook/hooks.js'

vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))
vi.mock('fs')

vi.mock('../src/storybook/hooks.js', () => ({
    prepareStorybook: vi.fn(),
    cleanupStorybook: vi.fn(),
}))

vi.mock('../src/reporter.js', () => ({
    default: vi.fn().mockImplementation(() => ({ generate: vi.fn() })),
}))

describe('VisualLauncher', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('onPrepare - clearRuntimeFolder (issue #683)', () => {
        it('should clear runtime folders once in onPrepare when clearRuntimeFolder is true', async () => {
            const rmSyncMock = vi.mocked(rmSync)
            rmSyncMock.mockClear()

            const launcher = new VisualLauncher({ clearRuntimeFolder: true })
            rmSyncMock.mockClear()

            const config = { runner: 'local', framework: 'mocha' } as WebdriverIO.Config
            await launcher.onPrepare!(config, [{}])

            expect(rmSyncMock).toHaveBeenCalledTimes(2)
        })

        it('should not clear runtime folders in onPrepare when clearRuntimeFolder is false', async () => {
            const rmSyncMock = vi.mocked(rmSync)
            rmSyncMock.mockClear()

            const launcher = new VisualLauncher({ clearRuntimeFolder: false })
            rmSyncMock.mockClear()

            const config = { runner: 'local', framework: 'mocha' } as WebdriverIO.Config
            await launcher.onPrepare!(config, [{}])

            expect(rmSyncMock).not.toHaveBeenCalled()
        })
    })

    describe('onPrepare - storybook delegation', () => {
        it('should delegate to prepareStorybook', async () => {
            const launcher = new VisualLauncher({})
            const config = { runner: 'local', framework: 'mocha' } as WebdriverIO.Config
            const caps = [{}]

            await launcher.onPrepare!(config, caps)

            expect(vi.mocked(storybookHooks.prepareStorybook)).toHaveBeenCalledWith(
                config,
                caps,
                expect.any(Object),
                expect.objectContaining({
                    actualFolder: expect.any(String),
                    baselineFolder: expect.any(String),
                    diffFolder: expect.any(String),
                }),
            )
        })
    })

    describe('onComplete', () => {
        it('should delegate to cleanupStorybook', async () => {
            const launcher = new VisualLauncher({}) as Services.ServiceInstance

            // @ts-ignore
            await launcher.onComplete!()

            expect(vi.mocked(storybookHooks.cleanupStorybook)).toHaveBeenCalledOnce()
        })

        it('should generate visual report when createJsonReportFiles is true', async () => {
            const generateVisualReport = (await import('../src/reporter.js')).default
            const launcher = new VisualLauncher({ createJsonReportFiles: true }) as Services.ServiceInstance

            // @ts-ignore
            await launcher.onComplete!()

            expect(generateVisualReport).toHaveBeenCalled()
        })

        it('should not generate visual report when createJsonReportFiles is false', async () => {
            const generateVisualReport = (await import('../src/reporter.js')).default
            vi.mocked(generateVisualReport).mockClear()
            const launcher = new VisualLauncher({ createJsonReportFiles: false }) as Services.ServiceInstance

            // @ts-ignore
            await launcher.onComplete!()

            expect(generateVisualReport).not.toHaveBeenCalled()
        })
    })
})
