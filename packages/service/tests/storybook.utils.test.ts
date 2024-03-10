import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdirSync, writeFileSync } from 'node:fs'
import fetch from 'node-fetch'
import type { Logger } from '@wdio/logger'
import logger from '@wdio/logger'
import type { Mock } from 'vitest'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
    checkStorybookIsRunning,
    createFileData,
    createStorybookCapabilities,
    createTestContent,
    createTestFiles,
    extractCategoryAndComponent,
    getArgvValue,
    getStoriesJson,
    isCucumberFramework,
    isJasmineFramework,
    isMochaFramework,
    isStorybookMode,
    itFunction,
    parseSkipStories,
    sanitizeURL,
    scanStorybook,
    writeTestFile,
} from '../src/storybook.utils.js'
import type { Capabilities, Options } from '@wdio/types'
import type { ScanStorybookReturnData } from '../src/storybookTypes.js'

const log = logger('test')
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))
vi.mock('node-fetch')
vi.mock('node:fs')
vi.mock('node:os')

describe('Storybook utils', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe('isStorybookMode', ()=>{
        afterEach(() => {
            process.argv = process.argv.slice(0, 2)
        })

        it('should return true if story book is provided in the process arguments', () => {
            process.argv.push('--storybook')
            expect(isStorybookMode()).toBe(true)
        })

        it('should return false if story book is not provided in the process arguments', () => {
            process.argv.push('--foobar')
            expect(isStorybookMode()).toBe(false)
        })
    })

    describe('isCucumberFramework', () => {
        it('should return true if cucumber is provided in the framework', () => {
            expect(isCucumberFramework('cucumber')).toBe(true)
        })

        it('should return false if cucumber is not provided in the framework', () => {
            expect(isCucumberFramework('foobar')).toBe(false)
        })
    })

    describe('isJasmineFramework', () => {
        it('should return true if jasmine is provided in the framework', () => {
            expect(isJasmineFramework('jasmine')).toBe(true)
        })

        it('should return false if jasmine is not provided in the framework', () => {
            expect(isJasmineFramework('foobar')).toBe(false)
        })
    })

    describe('isMochaFramework', () => {
        it('should return true if mocha is provided in the framework', () => {
            expect(isMochaFramework('mocha')).toBe(true)
        })

        it('should return false if mocha is not provided in the framework', () => {
            expect(isMochaFramework('foobar')).toBe(false)
        })
    })

    describe('checkStorybookIsRunning', () => {
        it('should throw an error if storybook is not running', async () => {
            // @ts-ignore
            vi.mocked(fetch).mockResolvedValue({ status: 404 })

            const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as unknown as () => never)
            await checkStorybookIsRunning('https://not.running.it')
            expect(exitSpy).toHaveBeenCalledWith(1)
        })

        it('should not throw an error if storybook is running', async () => {
            // @ts-ignore
            vi.mocked(fetch).mockResolvedValue({ status: 200 })

            const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as unknown as () => never)
            await checkStorybookIsRunning('https://not.running.it')
            expect(exitSpy).not.toHaveBeenCalled()
        })
    })

    describe('sanitizeURL', () => {
        it('should prepend http:// if not present', () => {
            const url = 'www.example.com'
            const sanitized = sanitizeURL(url)
            expect(sanitized).toBe('http://www.example.com/')
        })

        it('should not change a URL that already starts with http://', () => {
            const url = 'http://www.example.com'
            const sanitized = sanitizeURL(url)
            expect(sanitized).toBe('http://www.example.com/')
        })

        it('should not change a URL that already starts with https://', () => {
            const url = 'https://www.example.com'
            const sanitized = sanitizeURL(url)
            expect(sanitized).toBe('https://www.example.com/')
        })

        it('should remove iframe.html or index.html at the end of the URL', () => {
            const urls = ['http://www.example.com/iframe.html', 'http://www.example.com/index.html']
            urls.forEach(url => {
                const sanitized = sanitizeURL(url)
                expect(sanitized).toBe('http://www.example.com/')
            })
        })

        it('should append a slash at the end of the URL if not present', () => {
            const url = 'http://www.example.com'
            const sanitized = sanitizeURL(url)
            expect(sanitized).toBe('http://www.example.com/')
        })

        it('should not append a slash if one is already present', () => {
            const url = 'http://www.example.com/'
            const sanitized = sanitizeURL(url)
            expect(sanitized).toBe('http://www.example.com/')
        })
    })

    describe('extractCategoryAndComponent', () => {
        it('should correctly split category and component from ID', () => {
            const result = extractCategoryAndComponent('category-component--storyName')
            expect(result).toEqual({ category: 'category', component: 'component' })
        })
    })

    describe('getStoriesJson', () => {
        beforeEach(() => {
            vi.resetAllMocks()
        })

        it('successfully fetches stories', async () => {
            // @ts-ignore
            vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ stories: ['story1', 'story2'] }), { status: 200 }))
            // @ts-ignore
            vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ entries: ['entry1', 'entry2'] }), { status: 404 }))

            const data = await getStoriesJson('http://example.com')
            expect(data).toEqual(['story1', 'story2'])
        })

        it('successfully fetches index entries when stories fetch fails', async () => {
            // @ts-ignore
            vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 404 }))
            // @ts-ignore
            vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ entries: ['entry1', 'entry2'] }), { status: 200 }))

            const data = await getStoriesJson('http://example.com')
            expect(data).toEqual(['entry1', 'entry2'])
        })

        it('throws an error when both fetches fail', async () => {
            // @ts-ignore
            vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 404 }))
            // @ts-ignore
            vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 404 }))

            await expect(getStoriesJson('http://example.com')).rejects.toThrow('Failed to fetch index data from the project.')
        })

        it('catches errors and throws a custom error message', async () => {
            // Mock fetch to throw an error
            vi.mocked(fetch).mockImplementation(() => {
                throw new Error('Network error')
            })

            await expect(getStoriesJson('http://example.com'))
                .rejects
                .toThrow('Failed to fetch index data from the project.')
        })
    })

    describe('getArgvValue', () => {
        it('should retrieve the value of an argument', () => {
            process.argv = ['node', 'script.js', '--arg', 'value']
            const result = getArgvValue('--arg', String)
            expect(result).toBe('value')
        })

        it('should retrieve the value of an argument in arg=value format', () => {
            process.argv = ['node', 'script.js', '--arg=value']
            const result = getArgvValue('--arg', String)
            expect(result).toBe('value')
        })

        it('should return undefined for a non-existing argument', () => {
            process.argv = ['node', 'script.js', '--other', 'value']
            const result = getArgvValue('--arg', String)
            expect(result).toBeUndefined()
        })

        it('should use a custom parsing function', () => {
            process.argv = ['node', 'script.js', '--number', '42']
            const result = getArgvValue('--number', Number)
            expect(result).toBe(42)
        })
    })

    describe('itFunction', () => {
        const commonSetup = (framework: string, skipStories: string[] | RegExp, clip: boolean = false) => ({
            clip,
            clipSelector: '#id',
            folders: { baselineFolder: 'baseline' },
            framework,
            skipStories,
            storyData: { id: 'category-component--story1' },
            storybookUrl: 'http://storybook.com/',
        })

        it('generates correct test code with Jasmine framework and skip array', () => {
            const testArgs = commonSetup('jasmine', ['category-component--story1', 'category-component--story2'])
            // @ts-ignore
            const result = itFunction(testArgs)

            expect(result).toMatchSnapshot()
        })

        it('generates correct test code with Jasmine framework and no skip array', () => {
            const testArgs = commonSetup('jasmine', [])
            // @ts-ignore
            const result = itFunction(testArgs)

            expect(result).toMatchSnapshot()
        })

        it('generates correct test code with mocha framework and skip array', () => {
            const testArgs = commonSetup('mocha', ['category-component--story1'])
            // @ts-ignore
            const result = itFunction(testArgs)

            expect(result).toMatchSnapshot()
        })

        it('generates correct test code with mocha framework and no skipped array', () => {
            const testArgs = commonSetup('mocha', [])
            // @ts-ignore
            const result = itFunction(testArgs)

            expect(result).toMatchSnapshot()
        })

        it('generates correct mocha test code with skipped regex', () => {
            const testArgs = commonSetup('mocha', /story.*/gm)
            // @ts-ignore
            const result = itFunction(testArgs)

            expect(result).toMatchSnapshot()
        })

        it('generates correct mocha test code with non skipped regex', () => {
            const testArgs = commonSetup('mocha', /foo.*/gm)
            // @ts-ignore
            const result = itFunction(testArgs)

            expect(result).toMatchSnapshot()
        })

        it('generates correct test code with for a clipped test', () => {
            const testArgs = commonSetup('mocha', [], true)
            // @ts-ignore
            const result = itFunction(testArgs)

            expect(result).toMatchSnapshot()

            expect(result).toMatchSnapshot()
        })
    })

    describe('createFileData', () => {
        it('formats test content correctly for standard inputs', () => {
            const describeTitle = 'My Test Suite'
            const testContent = 'it("does something", () => {});'
            const result = createFileData(describeTitle, testContent)

            expect(result).toMatchSnapshot()
        })

        it('handles special characters in describe title and test content', () => {
            const describeTitle = 'Special`Characters'
            const testContent = 'it("handles `special` characters", () => {});'
            const result = createFileData(describeTitle, testContent)

            expect(result).toMatchSnapshot()
        })

        it('handles empty describe title and test content', () => {
            const result = createFileData('', '')

            expect(result).toMatchSnapshot()
        })
    })

    describe('writeTestFile', () => {
        it('successfully writes a test file', () => {
            const logInfoMock = vi.spyOn(log, 'info')
            const testContent = 'test content'
            const directoryPath = '/path/to/dir'
            const fileID = 'testFile'
            const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as unknown as () => never)

            writeTestFile(directoryPath, fileID, log, testContent)

            expect(writeFileSync).toHaveBeenCalledWith(`${directoryPath}/${fileID}.test.js`, testContent)
            expect(logInfoMock.mock.calls[0][0]).toContain(`Test file created at: ${directoryPath}/${fileID}.test.js`)
            expect(exitSpy).not.toHaveBeenCalled()
        })

        it('fails to writes a test file', () => {
            const logErrorMock = vi.spyOn(log, 'error')
            const testContent = 'test content'
            const directoryPath = '/path/to/dir'
            const fileID = 'testFile'
            const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as unknown as () => never)
            vi.mocked(writeFileSync).mockImplementation(() => {throw new Error('test error') as never})

            writeTestFile(directoryPath, fileID, log, testContent)

            expect(writeFileSync).toHaveBeenCalledWith(`${directoryPath}/${fileID}.test.js`, testContent)
            expect(logErrorMock.mock.calls[0][0]).toContain(`It seems that the writing the file to '${directoryPath}/${fileID}.test.js' didn't succeed due to the following error: Error: test error`)
            expect(exitSpy).toHaveBeenCalledOnce()
        })
    })

    describe('createTestContent', () => {
        it('calls itFunction with correct arguments for each story and accumulates results', () => {
            const mockItFunction = vi.fn(({ storyData }) => `Test for ${storyData.id}\n`)
            const testArgs = {
                clip: false,
                clipSelector: '#selector',
                folders: {
                    actualFolder: 'actual',
                    baselineFolder: 'baseline',
                    diffFolder: 'diff',
                },
                framework: 'mocha',
                skipStories: [],
                stories: [{
                    id: 'example-button--primary',
                    name: 'Primary',
                    title: 'Example/Button',
                    importPath: './src/stories/Button.stories.ts',
                    tags: ['autodocs', 'story'],
                    kind: 'Example/Button',
                    story: 'Primary',
                    parameters: {
                        __id: 'example-button--primary',
                        docsOnly: false,
                        fileName: './src/stories/Button.stories.ts'
                    }
                },
                {
                    id: 'example-button--secondary',
                    name: 'Secondary',
                    title: 'Example/Button',
                    importPath: './src/stories/Button.stories.ts',
                    tags: ['autodocs', 'story'],
                    kind: 'Example/Button',
                    story: 'Secondary',
                    parameters: {
                        __id: 'example-button--secondary',
                        docsOnly: false,
                        fileName: './src/stories/Button.stories.ts'
                    }
                },
                {
                    id: 'example-button--large',
                    name: 'Large',
                    title: 'Example/Button',
                    importPath: './src/stories/Button.stories.ts',
                    tags: ['autodocs', 'story'],
                    kind: 'Example/Button',
                    story: 'Large',
                    parameters: {
                        __id: 'example-button--large',
                        docsOnly: false,
                        fileName: './src/stories/Button.stories.ts'
                    }
                }],
                storybookUrl: 'http://storybook.com/',
                itFunc: mockItFunction
            }

            const result = createTestContent(testArgs, mockItFunction)

            expect(mockItFunction).toHaveBeenCalledTimes(testArgs.stories.length)
            expect(result).toMatchSnapshot()
        })
    })

    describe('createTestFiles', () => {
        const mockCreateTestContent = vi.fn()
        const mockCreateFileData = vi.fn()
        const mockWriteTestFile = vi.fn()
        const logMock = { info: vi.fn() }

        const baseTestOptions = {
            clip: false,
            clipSelector: '#selector',
            directoryPath: '/path/to/dir',
            folders: {},
            framework: 'mocha',
            log: logMock,
            skipStories: [],
            storybookUrl: 'http://storybook.com/',
        }

        const runTest = (numShards: number, expectedCalls: number) => {
            const testOptions = {
                ...baseTestOptions,
                numShards,
                storiesJson: {
                    story1: { parameters: { docsOnly: true } },
                    story2: { type: 'story' },
                    story3: {},
                    story4: {},
                },
            }

            // @ts-ignore
            createTestFiles(testOptions, mockCreateTestContent, mockCreateFileData, mockWriteTestFile)

            expect(mockCreateTestContent).toHaveBeenCalledTimes(expectedCalls)
            expect(mockCreateFileData).toHaveBeenCalledTimes(expectedCalls)
            expect(mockWriteTestFile).toHaveBeenCalledTimes(expectedCalls)
        }

        beforeEach(() => {
            mockCreateTestContent.mockClear()
            mockCreateFileData.mockClear()
            mockWriteTestFile.mockClear()
            logMock.info.mockClear()
        })

        it('properly creates a single test file', () => {
            runTest(1, 1)
        })

        it('properly creates multiple test files', () => {
            runTest(4, 4)
        })

    })

    describe('createStorybookCapabilities', () => {
        let originalArgv: NodeJS.Process['argv']
        let logMock: Logger
        let capabilities: Capabilities.RemoteCapabilities

        beforeEach(() => {
            originalArgv = [...process.argv]
            logMock = { error: vi.fn() } as unknown as Logger
            capabilities = []
        })

        afterEach(() => {
            process.argv = originalArgv
        })

        it('defaults to chrome if no browsers are specified', () => {
            createStorybookCapabilities(capabilities, logMock)

            expect(capabilities).toHaveLength(1)
            expect((capabilities as Capabilities.DesiredCapabilities[])[0].browserName).toBe('chrome')
        })

        it('should modify capabilities based on provided browsers', () => {
            process.argv.push('--browsers', 'chrome,firefox,edge')
            createStorybookCapabilities(capabilities, logMock)

            expect(capabilities).toHaveLength(3)
            expect(((capabilities as Capabilities.DesiredCapabilities[])[0]).browserName).toBe('chrome')
            expect(((capabilities as Capabilities.DesiredCapabilities[])[0])['goog:chromeOptions']?.args).toContain('--headless')
            expect((capabilities as Capabilities.DesiredCapabilities[])[1].browserName).toBe('firefox')
            expect(((capabilities as Capabilities.DesiredCapabilities[])[1])['moz:firefoxOptions']?.args).toContain('-headless')
            expect(((capabilities as Capabilities.DesiredCapabilities[])[2]).browserName).toBe('MicrosoftEdge')
            expect(((capabilities as Capabilities.DesiredCapabilities[])[2])['ms:edgeOptions']?.args).toContain('--headless')
        })

        it('should not have headless if provided', () => {
            process.argv.push('--browsers', 'chrome,firefox,edge', '--headless=false')
            createStorybookCapabilities(capabilities, logMock)

            expect(capabilities).toHaveLength(3)
            expect(((capabilities as Capabilities.DesiredCapabilities[])[0]).browserName).toBe('chrome')
            expect(((capabilities as Capabilities.DesiredCapabilities[])[0])['goog:chromeOptions']?.args).not.toContain('--headless')
            expect((capabilities as Capabilities.DesiredCapabilities[])[1].browserName).toBe('firefox')
            expect(((capabilities as Capabilities.DesiredCapabilities[])[1])['moz:firefoxOptions']?.args).not.toContain('-headless')
            expect(((capabilities as Capabilities.DesiredCapabilities[])[2]).browserName).toBe('MicrosoftEdge')
            expect(((capabilities as Capabilities.DesiredCapabilities[])[2])['ms:edgeOptions']?.args).not.toContain('--headless')
        })

        it('logs an error if capabilities are not an array', () => {
            const invalidCapabilities = {}
            createStorybookCapabilities(invalidCapabilities, logMock)

            expect(logMock.error).toHaveBeenCalledWith('The capabilities are not an array')
        })
    })

    describe('scanStorybook', () => {
        let originalEnv: NodeJS.ProcessEnv
        const mockLog = { info: vi.fn() } as unknown as Logger
        const config = {} as Options.Testrunner
        let mockGetArgvVal: Mock
        let mockCheckStorybookIsRun: Mock
        let mockSanitizeURLFunc: Mock
        let mockGetStoriesJsonFunc: Mock

        const setupMocks = (storybookUrl?: string) => {
            mockGetArgvVal = vi.fn().mockReturnValue(undefined)
            mockCheckStorybookIsRun = vi.fn().mockResolvedValue({})
            mockSanitizeURLFunc = vi.fn().mockImplementation(url => url)
            mockGetStoriesJsonFunc = vi.fn().mockResolvedValue({ stories: ['story1', 'story2'] })
            // @ts-ignore
            mkdirSync.mockImplementation(() => {})
            // @ts-ignore
            tmpdir.mockReturnValue('/tmp')
            process.env.STORYBOOK_URL = storybookUrl
        }

        const assertResults = (mockStorybookUrl: string, result: ScanStorybookReturnData) => {
            expect(mockCheckStorybookIsRun).toHaveBeenCalledWith(mockStorybookUrl)
            expect(mockSanitizeURLFunc).toHaveBeenCalledWith(mockStorybookUrl)
            expect(mockGetStoriesJsonFunc).toHaveBeenCalledWith(mockStorybookUrl)
            expect(mkdirSync).toHaveBeenCalled()
            expect(result).toEqual({
                storiesJson: { stories: ['story1', 'story2'] },
                storybookUrl: mockStorybookUrl,
                tempDir: expect.any(String),
            })
        }

        beforeEach(() => {
            originalEnv = process.env
            process.env = { ...process.env }
        })

        afterEach(() => {
            process.env = originalEnv
        })

        it('uses STORYBOOK_URL from process.env when available', async () => {
            const mockStorybookUrl = 'http://storybook-from-env.com'
            setupMocks(mockStorybookUrl)
            const result = await scanStorybook(config, mockLog, {}, mockGetArgvVal, mockCheckStorybookIsRun, mockSanitizeURLFunc, mockGetStoriesJsonFunc)

            assertResults(mockStorybookUrl, result)
        })

        it('uses options?.storybook?.url when available', async () => {
            setupMocks(undefined)
            const mockStorybookUrl = 'http://storybook-from-options.com'
            const result = await scanStorybook(
                config, mockLog, { storybook: { url: mockStorybookUrl } },
                mockGetArgvVal, mockCheckStorybookIsRun, mockSanitizeURLFunc, mockGetStoriesJsonFunc,
            )

            assertResults(mockStorybookUrl, result)
        })

        it('uses default url when all other options are not available', async () => {
            const mockStorybookUrl = 'http://127.0.0.1:6006'
            setupMocks(undefined)
            const result = await scanStorybook(
                config, mockLog, {},
                mockGetArgvVal, mockCheckStorybookIsRun, mockSanitizeURLFunc, mockGetStoriesJsonFunc,
            )

            assertResults(mockStorybookUrl, result)
        })
    })

    describe('parseSkipStories', () => {
        let logMock: Logger
        beforeEach(() => {
            logMock = { error: vi.fn() } as unknown as Logger
        })

        it('returns the input array if skipStories is an array', () => {
            const skipStories = ['story1', 'story2']
            const result = parseSkipStories(skipStories, logMock)

            expect(result).toEqual(skipStories)
        })

        it('returns a RegExp if skipStories is a valid regex string', () => {
            const skipStories = '/story[0-9]+/i'
            const result = parseSkipStories(skipStories, logMock)

            expect(result).toBeInstanceOf(RegExp)
            expect(result).toEqual(new RegExp('story[0-9]+', 'i'))
        })

        it('logs an error and returns an array if skipStories is an invalid regex string', () => {
            const skipStories = '/[unclosed-regex/'
            const result = parseSkipStories(skipStories, logMock)

            expect(logMock.error).toHaveBeenCalled()
            expect(result).toEqual([skipStories])
        })

        it('splits and trims a comma-separated string', () => {
            const skipStories = 'story1, story2,story3'
            const result = parseSkipStories(skipStories, logMock)

            expect(result).toEqual(['story1', 'story2', 'story3'])
        })
    })
})

