import { rmdirSync } from 'node:fs'
import { join } from 'node:path'
import logger from '@wdio/logger'
import type { Capabilities, Options, Services } from '@wdio/types'
import type { Mock } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import VisualLauncher from '../src/launcher.js'
import type { ClassOptions } from 'webdriver-image-comparison'

const log = logger('test')
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))
vi.mock('fs')

interface MockFunctions {
    isStorybookModeFunc: Mock;
    isCucumberFrameworkFunc: Mock;
    scanStorybookFunc: Mock;
    getArgvValueFunc: Mock;
    parseSkipStoriesFunc: Mock;
    createTestFilesFunc: Mock;
    createStorybookCapabilitiesFunc: Mock;
}

describe('Visual Launcher for Storybook', () => {
    describe('onPrepare', () => {
        let mockFunctions:MockFunctions,
            options: ClassOptions,
            caps: Capabilities.DesiredCapabilities[],
            config: Options.Testrunner,
            Launcher: Services.ServiceInstance

        beforeEach(() => {
            mockFunctions = {
                isStorybookModeFunc: vi.fn(() => true),
                isCucumberFrameworkFunc: vi.fn(() => false),
                scanStorybookFunc: vi.fn(() => ({
                    storiesJson: {},
                    storybookUrl: 'storybookUrl',
                    tempDir: 'tempDir',
                })),
                getArgvValueFunc: vi.fn(),
                parseSkipStoriesFunc: vi.fn(() => []),
                createTestFilesFunc: vi.fn(),
                createStorybookCapabilitiesFunc: vi.fn(),
            }

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

            await Launcher!.onPrepare(
                config, caps,
                // @ts-ignore
                ...Object.values(mockFunctions)
            )

            expect(mockFunctions.isStorybookModeFunc).toHaveBeenCalledOnce()
            expect(mockFunctions.isCucumberFrameworkFunc).toHaveBeenCalledOnce()
            expect(logInfoMock.mock.calls[0][0]).toContain('Running `@wdio/visual-service` in Storybook mode.')
            expect(mockFunctions.getArgvValueFunc).toHaveBeenCalledTimes(5)
            expect(mockFunctions.parseSkipStoriesFunc).toHaveBeenCalledWith([], log)
        // other expectations...
        })

        it('should process all process.argv data', async () => {
            if (!Launcher.onPrepare) {
                throw new Error('onPrepare method is not defined on Launcher')
            }
            mockFunctions.getArgvValueFunc.mockReturnValueOnce(6) // --version
                .mockReturnValueOnce(2) // --numShards
                .mockReturnValueOnce(false) // --clip
                .mockReturnValueOnce(undefined) // --clipSelector
                .mockReturnValueOnce(['foo-bar-foo']) // --skipStories

            await Launcher.onPrepare(
                config, caps,
                // @ts-ignore
                ...Object.values(mockFunctions)
            )

            expect(mockFunctions.getArgvValueFunc).toHaveBeenCalledTimes(5)
            expect(mockFunctions.parseSkipStoriesFunc).toHaveBeenCalledWith(['foo-bar-foo'], log)
        // other expectations...
        })

        it('should process all options data', async () => {
            if (!Launcher.onPrepare) {
                throw new Error('onPrepare method is not defined on Launcher')
            }

            options.storybook = { version: 7, numShards: 16, clip: false, clipSelector: 'clipSelector', skipStories: 'skipStories' }

            await Launcher.onPrepare(
                config, caps,
                // @ts-ignore
                ...Object.values(mockFunctions)
            )

            expect(mockFunctions.getArgvValueFunc).toHaveBeenCalledTimes(5)
            expect(mockFunctions.parseSkipStoriesFunc).toHaveBeenCalledWith('skipStories', log)
        // other expectations...
        })

        it('should throw an error for storybook and cucumber', async () => {
            if (!Launcher.onPrepare) {
                throw new Error('onPrepare method is not defined on Launcher')
            }

            const logInfoMock = vi.spyOn(log, 'info')
            mockFunctions.isCucumberFrameworkFunc.mockReturnValue(true)

            let error
            try {
                await Launcher.onPrepare(
                    config, caps,
                    // @ts-ignore
                    ...Object.values(mockFunctions)
                )
            } catch (e) {
                error = e
            }

            expect(error).toBeDefined()
            expect((error as Error).message).toContain('Running Storybook in combination with the cucumber framework adapter is not supported.')
            expect(mockFunctions.isStorybookModeFunc).toHaveBeenCalledOnce()
            expect(mockFunctions.isCucumberFrameworkFunc).toHaveBeenCalledOnce()
            expect(logInfoMock).not.toHaveBeenCalled()
            // Ensure other mocks were not called
            expect(mockFunctions.getArgvValueFunc).not.toHaveBeenCalled()
            expect(mockFunctions.parseSkipStoriesFunc).not.toHaveBeenCalled()
            expect(mockFunctions.createTestFilesFunc).not.toHaveBeenCalled()
            expect(mockFunctions.createStorybookCapabilitiesFunc).not.toHaveBeenCalled()
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
