import { rmdirSync } from 'node:fs'
import { join } from 'node:path'
import logger from '@wdio/logger'
import type { Capabilities, Options, Services } from '@wdio/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import VisualLauncher from '../../src/storybook/launcher.js'
import type { ClassOptions } from 'webdriver-image-comparison'
import * as storybookUtils from '../../src/storybook/utils.js'

const log = logger('test')
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))
vi.mock('fs')

vi.mock('../../src/storybook/utils.js', ()=>({
    isStorybookMode: vi.fn(() => true),
    isCucumberFramework: vi.fn(() => false),
    scanStorybook: vi.fn(() => ({
        storiesJson: {},
        storybookUrl: 'storybookUrl',
        tempDir: 'tempDir',
    })),
    getArgvValue: vi.fn(),
    parseSkipStories: vi.fn(() => []),
    createTestFiles: vi.fn(),
    createStorybookCapabilities: vi.fn(),
}))

describe('Visual Launcher for Storybook', () => {
    describe('onPrepare', () => {
        let options: ClassOptions,
            caps: Capabilities.DesiredCapabilities[],
            config: Options.Testrunner,
            Launcher: Services.ServiceInstance

        beforeEach(() => {

            options = {}
            caps = [{}]
            config = {
                framework: 'mocha'
            } as Options.Testrunner
            Launcher = new VisualLauncher(options)

            vi.clearAllMocks()
        })

        it('should process all default data', async () => {
            if (!Launcher.onPrepare) {
                throw new Error('onPrepare method is not defined on Launcher')
            }

            const logInfoMock = vi.spyOn(log, 'info')

            await Launcher!.onPrepare(config, caps)

            expect(vi.mocked(storybookUtils.isStorybookMode)).toHaveBeenCalledOnce()
            expect(vi.mocked(storybookUtils.isCucumberFramework)).toHaveBeenCalledOnce()
            expect(logInfoMock.mock.calls[0][0]).toMatchSnapshot()
            expect(logInfoMock.mock.calls[1][0]).toMatchSnapshot()
            expect(vi.mocked(storybookUtils.getArgvValue)).toHaveBeenCalledTimes(5)
            expect(vi.mocked(storybookUtils.parseSkipStories)).toHaveBeenCalledWith([])
            expect(vi.mocked(storybookUtils.createTestFiles)).toHaveBeenCalled()
            expect(vi.mocked(storybookUtils.createStorybookCapabilities)).toHaveBeenCalled()
        })

        it('should process all process.argv data', async () => {
            if (!Launcher.onPrepare) {
                throw new Error('onPrepare method is not defined on Launcher')
            }
            vi.mocked(storybookUtils.getArgvValue)
                .mockReturnValueOnce(6) // --version
                .mockReturnValueOnce(2) // --numShards
                .mockReturnValueOnce(false) // --clip
                .mockReturnValueOnce(undefined) // --clipSelector
                .mockReturnValueOnce(['foo-bar-foo']) // --skipStories

            await Launcher.onPrepare(config, caps)

            expect(vi.mocked(storybookUtils.getArgvValue)).toHaveBeenCalledTimes(5)
            expect(vi.mocked(storybookUtils.parseSkipStories)).toHaveBeenCalledWith(['foo-bar-foo'])
        })

        it('should process all options data', async () => {
            if (!Launcher.onPrepare) {
                throw new Error('onPrepare method is not defined on Launcher')
            }

            options.storybook = { version: 7, numShards: 16, clip: false, clipSelector: 'clipSelector', skipStories: 'skipStories' }

            await Launcher.onPrepare(config, caps)

            expect(vi.mocked(storybookUtils.getArgvValue)).toHaveBeenCalledTimes(5)
            expect(vi.mocked(storybookUtils.parseSkipStories)).toHaveBeenCalledWith('skipStories')
        })

        it('should throw an error for storybook and cucumber', async () => {
            if (!Launcher.onPrepare) {
                throw new Error('onPrepare method is not defined on Launcher')
            }

            const logInfoMock = vi.spyOn(log, 'info')
            vi.mocked(storybookUtils.isCucumberFramework).mockReturnValueOnce(true)

            let error
            try {
                await Launcher.onPrepare(config, caps)
            } catch (e) {
                error = e
            }

            expect(error).toBeDefined()
            expect((error as Error).message).toMatchSnapshot()
            expect(vi.mocked(storybookUtils.isStorybookMode)).toHaveBeenCalledOnce()
            expect(vi.mocked(storybookUtils.isCucumberFramework)).toHaveBeenCalledOnce()
            expect(logInfoMock).not.toHaveBeenCalled()
            // Ensure other mocks were not called
            expect(vi.mocked(storybookUtils.getArgvValue)).not.toHaveBeenCalled()
            expect(vi.mocked(storybookUtils.parseSkipStories)).not.toHaveBeenCalled()
            expect(vi.mocked(storybookUtils.createTestFiles)).not.toHaveBeenCalled()
            expect(vi.mocked(storybookUtils.createStorybookCapabilities)).not.toHaveBeenCalled()
        })

        it('should throw an error for storybook multiremote', async () => {
            if (!Launcher.onPrepare) {
                throw new Error('onPrepare method is not defined on Launcher')
            }

            const logInfoMock = vi.spyOn(log, 'info')
            const multiremoteCaps = {
                myChromeBrowser: {
                    capabilities: {
                        browserName: 'chrome'
                    }
                },
                myFirefoxBrowser: {
                    capabilities: {
                        browserName: 'firefox'
                    }
                }
            }
            let error
            try {
                await Launcher.onPrepare(config, multiremoteCaps)
            } catch (e) {
                error = e
            }

            expect(error).toBeDefined()
            expect((error as Error).message).toMatchSnapshot()
            expect(logInfoMock).toHaveBeenCalledOnce()
            // Ensure other mocks were not called
            expect(vi.mocked(storybookUtils.getArgvValue)).not.toHaveBeenCalled()
            expect(vi.mocked(storybookUtils.parseSkipStories)).not.toHaveBeenCalled()
            expect(vi.mocked(storybookUtils.createTestFiles)).not.toHaveBeenCalled()
            expect(vi.mocked(storybookUtils.createStorybookCapabilities)).not.toHaveBeenCalled()
        })
    })

    describe('onComplete', () => {
        let Launcher: Services.ServiceInstance

        beforeEach(() => {
            vi.clearAllMocks()
            Launcher = new VisualLauncher({})
        })

        afterEach(() => {
        // Clean up environment variables
            delete process.env.VISUAL_STORYBOOK_TEMP_SPEC_FOLDER
        })

        it('should remove temporary folder and log success', async () => {
            if (!Launcher.onComplete) {
                throw new Error('onComplete method is not defined on Launcher')
            }
            process.env.VISUAL_STORYBOOK_TEMP_SPEC_FOLDER = 'path/to/tempDir'
            const logInfoSpy = vi.spyOn(log, 'info')
            const rmdirSyncMock = vi.mocked(rmdirSync)

            // @ts-ignore
            await Launcher.onComplete()

            expect(rmdirSyncMock).toHaveBeenCalledWith('path/to/tempDir', { recursive: true })
            expect(logInfoSpy).toHaveBeenCalledWith(expect.stringContaining('Temporary folder for storybook specs has been removed'))
            expect(process.env.VISUAL_STORYBOOK_TEMP_SPEC_FOLDER).toBeUndefined()
        })

        it('should log error if temporary folder removal fails', async () => {
            if (!Launcher.onComplete) {
                throw new Error('onComplete method is not defined on Launcher')
            }
            process.env.VISUAL_STORYBOOK_TEMP_SPEC_FOLDER = 'path/to/tempDir'
            const logErrorSpy = vi.spyOn(log, 'error')
            vi.mocked(rmdirSync).mockImplementationOnce(() => {
                throw new Error('Deletion Failed')
            })

            // @ts-ignore
            await Launcher.onComplete()

            expect(logErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to remove temporary folder for storybook specs'))
        })

        it('should do nothing if temp directory is not set', async () => {
            if (!Launcher.onComplete) {
                throw new Error('onComplete method is not defined on Launcher')
            }
            const rmdirSyncMock = vi.mocked(rmdirSync)
            const logInfoSpy = vi.spyOn(log, 'info')

            // @ts-ignore
            await Launcher.onComplete()

            expect(rmdirSyncMock).not.toHaveBeenCalled()
            expect(logInfoSpy).not.toHaveBeenCalled()
        })
    })
})
