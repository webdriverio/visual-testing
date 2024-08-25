import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdirSync, writeFileSync } from 'node:fs'
import fetch from 'node-fetch'
import logger from '@wdio/logger'
import type { Mock } from 'vitest'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
    capabilitiesErrorMessage,
    checkStorybookIsRunning,
    createChromeCapabilityWithEmulation,
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
    waitForStorybookComponentToBeLoaded,
    writeTestFile,
} from '../../src/storybook/utils.js'
import type { CapabilityMap, EmulatedDeviceType, ScanStorybookReturnData } from '../../src/storybook/Types.js'

const log = logger('test')
vi.mock('@wdio/globals', () => ({
    $: vi.fn(() => ({
        waitForDisplayed: vi.fn().mockResolvedValue(true),
    })),
    browser: {
        url: vi.fn().mockResolvedValue(true),
        executeAsync: vi.fn().mockResolvedValue(true),
        waitUntil: vi.fn(),
    },
}))
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))
vi.mock('node-fetch')
vi.mock('node:fs')
vi.mock('node:os')
vi.mock('../../src/storybook/deviceDescriptors.ts', () => {
    return {
        deviceDescriptors: [
            {
                name: 'iPhone 14 Pro Max',
                screen: {
                    dpr: 3,
                    width: 430,
                    height: 932
                },
                userAgent: ''
            },
            {
                name: 'Pixel 7',
                screen: {
                    dpr: 3,
                    width: 430,
                    height: 932
                },
                userAgent: ''
            },
        ]
    }
})

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
            const logErrorMock = vi.spyOn(log, 'error')
            await checkStorybookIsRunning('https://not.running.it')
            expect(logErrorMock).toMatchSnapshot()
            expect(exitSpy).toHaveBeenCalledWith(1)
        })

        it('should not throw an error if storybook is running', async () => {
            // @ts-ignore
            vi.mocked(fetch).mockResolvedValue({ status: 200 })

            const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as unknown as () => never)
            const logErrorMock = vi.spyOn(log, 'error')
            await checkStorybookIsRunning('https://not.running.it')
            expect(logErrorMock).not.toHaveBeenCalled()
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

            writeTestFile(directoryPath, fileID, testContent)

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

            writeTestFile(directoryPath, fileID, testContent)

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

    describe('waitForStorybookComponentToBeLoaded', () => {
        let mock$
        let mockBrowser

        beforeEach(async () => {
            vi.clearAllMocks()
            const { $: mockGlobal$, browser: mockGlobalBrowser } = vi.mocked(await import('@wdio/globals'))

            mock$ = mockGlobal$
            mockBrowser = mockGlobalBrowser
            mock$.mockImplementation(() => ({
                waitForDisplayed: vi.fn().mockResolvedValue(true),
            }))
        })

        it('should throw an error if storybook mode is not enabled', async () => {
            const mockStorybookModeFunction = vi.fn().mockReturnValue(false)

            try {
                await waitForStorybookComponentToBeLoaded({ id: 'example' }, mockStorybookModeFunction)
                throw new Error('Test failed - should have thrown an error')
            } catch (error: any) {
                expect(error.message).toMatchSnapshot()
            }
        })

        it('should call all WDIO methods', async () => {
            const mockStorybookModeFunction = vi.fn().mockReturnValue(true)
            const options = {
                clipSelector: '.storybook-component',
                id: 'example-component',
                url: 'http://localhost:6006/',
                timeout: 5000,
            }

            await waitForStorybookComponentToBeLoaded(options, mockStorybookModeFunction)

            // Assertions
            expect(mockBrowser.url).toHaveBeenCalledWith('http://localhost:6006/iframe.html?id=example-component')
            expect(mock$).toHaveBeenCalledWith('.storybook-component')
            expect(mock$.mock.results[0].value.waitForDisplayed).toHaveBeenCalled()
            expect(mockBrowser.executeAsync).toHaveBeenCalled()
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
            url: 'http://storybook.com/',
        }

        const runTest = (numShards: number, expectedCalls: number) => {
            const testOptions = {
                ...baseTestOptions,
                numShards,
                storiesJson: [{ parameters: { docsOnly: true } }, { type: 'story' }, {}, {},],
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

    describe('capabilitiesErrorMessage', () => {
        const capabilityMap = {
            chrome: {},
            firefox: {},
        } as CapabilityMap

        const deviceDescriptors = [
            { name: 'iPhone 14',  },
            { name: 'Pixel 7', },
        ] as EmulatedDeviceType[]

        it('should throw an error when unsupported browsers are provided', () => {
            const browsers = ['chrome', 'safari']
            const devices: string[] = []
            const isMobileEmulation = false

            try {
                capabilitiesErrorMessage(browsers, capabilityMap, devices, deviceDescriptors, isMobileEmulation)
                throw new Error('Test failed - should have thrown an error')
            } catch (error: any) {
                expect(error.message).toMatchSnapshot()
            }
        })

        it('should throw an error when unsupported devices are provided', () => {
            const browsers = ['chrome']
            const devices = ['iPhone 14', 'Unknown Device']
            const isMobileEmulation = true

            try {
                capabilitiesErrorMessage(browsers, capabilityMap, devices, deviceDescriptors, isMobileEmulation)
                throw new Error('Test failed - should have thrown an error')
            } catch (error: any) {
                expect(error.message).toMatchSnapshot()
            }
        })

        it('should throw an error when both unsupported browsers and devices are provided', () => {
            const browsers = ['chrome', 'safari']
            const devices = ['Unknown Device']
            const isMobileEmulation = true

            try {
                capabilitiesErrorMessage(browsers, capabilityMap, devices, deviceDescriptors, isMobileEmulation)
                throw new Error('Test failed - should have thrown an error')
            } catch (error: any) {
                expect(error.message).toMatchSnapshot()
            }
        })

        it('should throw an error when nothing is provided', () => {
            const browsers: string[] = []
            const devices: string[] = []
            const isMobileEmulation = false

            try {
                capabilitiesErrorMessage(browsers, capabilityMap, devices, deviceDescriptors, isMobileEmulation)
                throw new Error('Test failed - should have thrown an error')
            } catch (error: any) {
                expect(error.message).toMatchSnapshot()
            }
        })
    })

    describe('createChromeCapabilityWithEmulation', () => {
        it('should create a Chrome capability with mobile emulation for a given device and headless mode', () => {
            const device: EmulatedDeviceType = {
                name: 'iPhone 14 Pro',
                screen: {
                    dpr: 3,
                    width: 1170,
                    height: 2532
                },
                userAgent: 'some-user-agent-string-for-iPhone'
            }
            const capability = createChromeCapabilityWithEmulation(device, true)

            expect(capability).toMatchSnapshot()
        })

        it('should create a Chrome capability with mobile emulation for a given device in non-headless mode', () => {
            const device: EmulatedDeviceType = {
                name: 'Pixel 7',
                screen: {
                    dpr: 2.5,
                    width: 1080,
                    height: 2340
                },
                userAgent: 'some-user-agent-string-for-Pixel'
            }
            const capability = createChromeCapabilityWithEmulation(device, false)

            expect(capability).toMatchSnapshot()
        })
    })

    describe('createStorybookCapabilities', () => {
        let originalArgv: NodeJS.Process['argv']
        let capabilities: WebdriverIO.Capabilities[]

        beforeEach(() => {
            originalArgv = [...process.argv]
            capabilities = []
        })

        afterEach(() => {
            process.argv = originalArgv
        })

        it('defaults to chrome if no browsers are specified', () => {
            createStorybookCapabilities(capabilities)

            expect(capabilities).toHaveLength(1)
            expect((capabilities)[0].browserName).toBe('chrome')
        })

        it('should modify capabilities based on provided browsers', () => {
            process.argv.push('--browsers', 'chrome,firefox,edge')
            createStorybookCapabilities(capabilities)

            expect(capabilities).toHaveLength(3)
            expect((capabilities)[0].browserName).toBe('firefox')
            expect(((capabilities)[0])['moz:firefoxOptions']?.args).toContain('-headless')
            expect(((capabilities)[1]).browserName).toBe('MicrosoftEdge')
            expect(((capabilities)[1])['ms:edgeOptions']?.args).toContain('--headless')
            expect(((capabilities)[2]).browserName).toBe('chrome')
            expect(((capabilities)[2])['goog:chromeOptions']?.args).toContain('--headless')
        })

        it('should not have headless if provided', () => {
            process.argv.push('--browsers', 'chrome,firefox,edge', '--headless=false')
            createStorybookCapabilities(capabilities)

            expect(capabilities).toHaveLength(3)
            expect((capabilities)[0].browserName).toBe('firefox')
            expect(((capabilities)[0])['moz:firefoxOptions']?.args).not.toContain('-headless')
            expect(((capabilities)[1]).browserName).toBe('MicrosoftEdge')
            expect(((capabilities)[1])['ms:edgeOptions']?.args).not.toContain('--headless')
            expect(((capabilities)[2]).browserName).toBe('chrome')
            expect(((capabilities)[2])['goog:chromeOptions']?.args).not.toContain('--headless')
        })

        it('logs an error if capabilities are not an array', () => {
            const logErrorMock = vi.spyOn(log, 'error')
            const invalidCapabilities = {}
            const createChromeCapabilityWithEmulationMock = vi.fn()
            const mockErrorMessageFunc = vi.fn()
            // @ts-ignore, ignoring because we need to provide invalid capabilities
            createStorybookCapabilities(invalidCapabilities, createChromeCapabilityWithEmulationMock, mockErrorMessageFunc)

            expect(logErrorMock).toMatchSnapshot()
        })

        it('adds Chrome capabilities with mobile emulation for specified devices', () => {
            process.argv.push('--devices', 'iPhone 14 Pro Max,Pixel 7')
            const createChromeCapabilityWithEmulationMock = vi.fn()
            const mockErrorMessageFunc = vi.fn()

            const logInfoMock = vi.spyOn(log, 'info')
            createStorybookCapabilities(capabilities, createChromeCapabilityWithEmulationMock, mockErrorMessageFunc)

            expect(logInfoMock).toHaveBeenCalledTimes(1)
            expect(createChromeCapabilityWithEmulationMock).toHaveBeenCalledTimes(2)
        })

        it('logs an error for unsupported devices', () => {
            process.argv.push('--devices', 'Unsupported Device')
            const createChromeCapabilityWithEmulationMock = vi.fn()
            const mockErrorMessageFunc = vi.fn()
            createStorybookCapabilities(capabilities, createChromeCapabilityWithEmulationMock, mockErrorMessageFunc)

            expect(mockErrorMessageFunc).toHaveBeenCalledOnce()
        })

        it('calls error message function for unsupported browsers', () => {
            process.argv.push('--browsers', 'unsupportedBrowser')
            const createChromeCapabilityWithEmulationMock = vi.fn()
            const mockErrorMessageFunc = vi.fn()
            createStorybookCapabilities(capabilities, createChromeCapabilityWithEmulationMock, mockErrorMessageFunc)

            expect(mockErrorMessageFunc).toHaveBeenCalled()
        })

        it('calls error message function when no capabilities are added', () => {
            process.argv.push('--browsers', 'unsupportedBrowser', '--devices', 'Unsupported Device')
            const createChromeCapabilityWithEmulationMock = vi.fn()
            const mockErrorMessageFunc = vi.fn()
            createStorybookCapabilities(capabilities, createChromeCapabilityWithEmulationMock, mockErrorMessageFunc)

            expect(mockErrorMessageFunc).toHaveBeenCalled()
        })
    })

    describe('scanStorybook', () => {
        let originalEnv: NodeJS.ProcessEnv
        const config = { specs: [] } as unknown as WebdriverIO.Config
        let mockGetArgvVal: Mock
        let mockCheckStorybookIsRun: Mock
        let mockSanitizeURLFunc: Mock
        let mockGetStoriesJsonFunc: Mock

        const setupMocks = (storybookUrl?: string, spec?:boolean) => {
            // mockGetArgvVal = vi.fn().mockReturnValue(spec? 'cli.spec.js' : undefined)
            mockGetArgvVal = vi.fn().mockImplementation((arg) => {
                if (arg === '--spec' && spec && config.specs) {
                    config.specs.push('/tmp/cli.spec.js')
                    return true
                }
                return undefined
            })
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
                storiesJson: [],
                storybookUrl: mockStorybookUrl,
                tempDir: expect.any(String),
            })
        }

        beforeEach(() => {
            originalEnv = process.env
            process.env = { ...process.env }
            config.specs = []
        })

        afterEach(() => {
            process.env = originalEnv
        })

        it('uses STORYBOOK_URL from process.env when available', async () => {
            const mockStorybookUrl = 'http://storybook-from-env.com'
            setupMocks(mockStorybookUrl)
            const result = await scanStorybook(
                config, {},
                mockGetArgvVal, mockCheckStorybookIsRun, mockSanitizeURLFunc, mockGetStoriesJsonFunc,
            )

            assertResults(mockStorybookUrl, result)
        })

        it('uses options?.storybook?.url when available', async () => {
            setupMocks(undefined)
            const mockStorybookUrl = 'http://storybook-from-options.com'
            const result = await scanStorybook(
                config, { storybook: { url: mockStorybookUrl } },
                mockGetArgvVal, mockCheckStorybookIsRun, mockSanitizeURLFunc, mockGetStoriesJsonFunc,
            )

            assertResults(mockStorybookUrl, result)
        })

        it('uses default url when all other options are not available', async () => {
            const mockStorybookUrl = 'http://127.0.0.1:6006'
            setupMocks(undefined)
            const result = await scanStorybook(
                config, {},
                mockGetArgvVal, mockCheckStorybookIsRun, mockSanitizeURLFunc, mockGetStoriesJsonFunc,
            )

            assertResults(mockStorybookUrl, result)
        })

        it ('adds cli specs when provided', async () => {
            setupMocks(undefined, true)
            await scanStorybook(
                config, {},
                mockGetArgvVal, mockCheckStorybookIsRun, mockSanitizeURLFunc, mockGetStoriesJsonFunc,
            )

            if (!config.specs) {
                throw new Error('Specs not added')
            }

            const tempDirRegex = /\/tmp\/wdio-storybook-tests-\d+\/\*\.\{js,mjs,ts\}/
            const matchingTempDir = config.specs.find((spec) => tempDirRegex.test(spec as string))
            expect(matchingTempDir).toMatch(tempDirRegex)
            expect(config.specs[1]).toContain('cli.spec.js')

        })
    })

    describe('parseSkipStories', () => {
        it('returns the input array if skipStories is an array', () => {
            const skipStories = ['story1', 'story2']
            const result = parseSkipStories(skipStories)

            expect(result).toEqual(skipStories)
        })

        it('returns a RegExp if skipStories is a valid regex string', () => {
            const skipStories = '/story[0-9]+/i'
            const result = parseSkipStories(skipStories)

            expect(result).toBeInstanceOf(RegExp)
            expect(result).toEqual(new RegExp('story[0-9]+', 'i'))
        })

        it('logs an error and returns an array if skipStories is an invalid regex string', () => {
            const skipStories = '/[unclosed-regex/'
            const logErrorMock = vi.spyOn(log, 'error')
            const result = parseSkipStories(skipStories)

            expect(logErrorMock).toMatchSnapshot()
            expect(result).toEqual([skipStories])
        })

        it('splits and trims a comma-separated string', () => {
            const skipStories = 'story1, story2,story3'
            const result = parseSkipStories(skipStories)

            expect(result).toEqual(['story1', 'story2', 'story3'])
        })
    })
})

