import { join } from 'node:path'
import { writeFileSync } from 'node:fs'
import fetch from 'node-fetch'
import logger from '@wdio/logger'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
    checkStorybookIsRunning,
    createFileData,
    extractCategoryAndComponent,
    getArgvValue,
    getStoriesJson,
    isCucumberFramework,
    isJasmineFramework,
    isMochaFramework,
    isStorybookMode,
    itFunction,
    sanitizeURL,
    writeTestFile,
} from '../src/storybook.utils.js'

const log = logger('test')
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))
vi.mock('node-fetch')
vi.mock('fs')

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
        it('generates correct test code with Jasmine framework and skip array', () => {
            const result = itFunction({
                clip: false,
                clipSelector: '#id',
                // @ts-ignore
                folders: { baselineFolder: 'baseline' },
                framework: 'jasmine',
                skipStories: ['category-component--story1', 'category-component--story2'],
                // @ts-ignore
                storyData: { id: 'category-component--story1' },
                storybookUrl: 'http://storybook.com/',
            })

            expect(result).toMatchSnapshot()
        })

        it('generates correct test code with Jasmine framework and no skip array', () => {
            const result = itFunction({
                clip: false,
                clipSelector: '#id',
                // @ts-ignore
                folders: { baselineFolder: 'baseline' },
                framework: 'jasmine',
                skipStories: [],
                // @ts-ignore
                storyData: { id: 'category-component--story1' },
                storybookUrl: 'http://storybook.com/',
            })

            expect(result).toMatchSnapshot()
        })

        it('generates correct test code with mocha framework and skip array', () => {
            const result = itFunction({
                clip: false,
                clipSelector: '#id',
                // @ts-ignore
                folders: { baselineFolder: 'baseline' },
                framework: 'mocha',
                skipStories: ['category-component--story1'],
                // @ts-ignore
                storyData: { id: 'category-component--story1' },
                storybookUrl: 'http://storybook.com/',
            })

            expect(result).toMatchSnapshot()
        })

        it('generates correct test code with mocha framework and no skipped array', () => {
            const result = itFunction({
                clip: false,
                clipSelector: '#id',
                // @ts-ignore
                folders: { baselineFolder: 'baseline' },
                framework: 'mocha',
                skipStories: [],
                // @ts-ignore
                storyData: { id: 'category-component--story1' },
                storybookUrl: 'http://storybook.com/',
            })

            expect(result).toMatchSnapshot()
        })

        it('generates correct mocha test code with skipped regex', () => {
            const result = itFunction({
                clip: false,
                clipSelector: '#id',
                // @ts-ignore
                folders: { baselineFolder: 'baseline' },
                framework: 'mocha',
                skipStories: /story.*/gm,
                // @ts-ignore
                storyData: { id: 'category-component--story1' },
                storybookUrl: 'http://storybook.com/',
            })

            expect(result).toMatchSnapshot()
        })

        it('generates correct mocha test code with non skipped regex', () => {
            const result = itFunction({
                clip: false,
                clipSelector: '#id',
                // @ts-ignore
                folders: { baselineFolder: 'baseline' },
                framework: 'mocha',
                skipStories: /foo.*/gm,
                // @ts-ignore
                storyData: { id: 'category-component--story1' },
                storybookUrl: 'http://storybook.com/',
            })

            expect(result).toMatchSnapshot()
        })

        it('generates correct test code with for a clipped test', () => {
            const result = itFunction({
                clip: true,
                clipSelector: '#id',
                // @ts-ignore
                folders: { baselineFolder: 'baseline' },
                framework: 'mocha',
                skipStories: [],
                // @ts-ignore
                storyData: { id: 'category-component--story1' },
                storybookUrl: 'http://storybook.com/',
            })

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
})

