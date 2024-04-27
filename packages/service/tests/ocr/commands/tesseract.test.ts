import { describe, it, expect, beforeEach, vi } from 'vitest'
import { execSync } from 'node:child_process'
import { createWorker } from 'tesseract.js'
import { recognize } from 'node-tesseract-ocr'
import { parseString } from 'xml2js'
import { getNodeOcrData, getSystemOcrData, isSystemTesseractAvailable, parseWordDataFromText } from '../../../src/ocr/utils/tesseract.js'

vi.mock('child_process', () => ({
    execSync: vi.fn()
}))
vi.mock('tesseract.js', () => ({
    createWorker: vi.fn(() => ({
        load: vi.fn(),
        loadLanguage: vi.fn(),
        initialize: vi.fn(),
        setParameters: vi.fn(),
        recognize: vi.fn(),
        terminate: vi.fn()
    })),
    PSM: {
        AUTO: 'auto'
    }
}))
vi.mock('node-tesseract-ocr', () => ({
    recognize: vi.fn()
}))
vi.mock('xml2js', () => ({
    parseString: vi.fn()
}))

describe('isSystemTesseractAvailable', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns true when Tesseract is available', () => {
        vi.mocked(execSync).mockImplementation(() => '')

        expect(isSystemTesseractAvailable()).toBe(true)
        expect(execSync).toHaveBeenCalledWith('tesseract --version')
    })

    it('returns false when Tesseract is not available', () => {
        vi.mocked(execSync).mockImplementation(() => {
            throw new Error('command not found')
        })

        expect(isSystemTesseractAvailable()).toBe(false)
        expect(execSync).toHaveBeenCalledWith('tesseract --version')
    })

    it('checks the specified Tesseract binary name', () => {
        const customBinary = 'custom-tesseract'
        // @ts-ignore
        vi.mocked(execSync).mockImplementation((command) => {
            if (!command.includes(customBinary)) {
                throw new Error('command not found')
            }
        })

        expect(isSystemTesseractAvailable(customBinary)).toBe(true)
        expect(execSync).toHaveBeenCalledWith(`${customBinary} --version`)
    })
})

describe('parseWordDataFromText', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns parsed word data', () => {
        const attributes =  ['', 'bbox 333 77 368 100', 'x_wconf 93', 'text 1']

        expect(parseWordDataFromText(attributes)).toMatchSnapshot()
    })
})

describe('getNodeOcrData', () => {
    let parseStringMock
    let workerMock
    const mockFilePath = '/fake/path/image.png'
    const mockLanguage = 'eng'

    beforeEach(() => {
        vi.clearAllMocks()
        parseStringMock = {
            div: {
                div: [
                    {
                        $: { 'class': 'ocr_carea', 'id': 'block_1_1', 'title': 'bbox 18 18 582 47' },
                        p: [
                            {
                                $: { 'class': 'ocr_par', 'id': 'par_1_1', 'lang': 'eng', 'title': 'bbox 18 18 582 47' },
                                span: [
                                    {
                                        $: { 'class': 'ocr_line', 'id': 'line_1_1', 'title': 'bbox 18 18 582 47; baseline 0 -6; x_size 29; x_descenders 6; x_ascenders 6' },
                                        span: [
                                            {
                                                _: 'Next-gen',
                                                $: { 'class': 'ocrx_word', 'id': 'word_1_1', 'title': 'bbox 18 18 145 47; x_wconf 87' }
                                            },
                                            {
                                                _: 'browser',
                                                $: { 'class': 'ocrx_word', 'id': 'word_1_2', 'title': 'bbox 156 18 264 41; x_wconf 96' }
                                            },
                                            {
                                                _: 'and',
                                                $: { 'class': 'ocrx_word', 'id': 'word_1_3', 'title': 'bbox 272 18 321 41; x_wconf 96' }
                                            },
                                            {
                                                _: 'mobile',
                                                $: { 'class': 'ocrx_word', 'id': 'word_1_4', 'title': 'bbox 332 18 421 41; x_wconf 96' }
                                            },
                                            {
                                                _: 'automation',
                                                $: { 'class': 'ocrx_word', 'id': 'word_1_5', 'title': 'bbox 431 19 582 41; x_wconf 96' }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        $: { 'class': 'ocr_carea', 'id': 'block_1_2', 'title': 'bbox 120 77 479 105' },
                        p: [
                            {
                                $: { 'class': 'ocr_par', 'id': 'par_1_2', 'lang': 'eng', 'title': 'bbox 120 77 479 105' },
                                span: [
                                    {
                                        $: { 'class': 'ocr_line', 'id': 'line_1_2', 'title': 'bbox 120 77 479 105; baseline 0 -5; x_size 28; x_descenders 5; x_ascenders 6' },
                                        span: [
                                            {
                                                _: 'test',
                                                $: { 'class': 'ocrx_word', 'id': 'word_1_6', 'title': 'bbox 120 79 171 100; x_wconf 96' }
                                            },
                                            {
                                                _: 'framework',
                                                $: { 'class': 'ocrx_word', 'id': 'word_1_7', 'title': 'bbox 179 77 325 100; x_wconf 95' }
                                            },
                                            {
                                                _: 'for',
                                                $: { 'class': 'ocrx_word', 'id': 'word_1_8', 'title': 'bbox 333 77 368 100; x_wconf 93' }
                                            },
                                            {
                                                _: 'Node.js',
                                                $: { 'class': 'ocrx_word', 'id': 'word_1_9', 'title': 'bbox 378 77 479 105; x_wconf 89' }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
        workerMock = {
            setParameters: vi.fn(),
            recognize: vi.fn().mockResolvedValue({
                data: { text: 'Extracted text', hocr: '<div><div>...</div></div>' }
            }),
            terminate: vi.fn(),
            // Not used
            load: vi.fn(),
            writeText: vi.fn(),
            readText: vi.fn(),
            removeText: vi.fn(),
            FS: vi.fn(),
            reinitialize: vi.fn(),
            getImage: vi.fn(),
            detect: vi.fn(),
            getPDF: vi.fn(),
        }
    })

    it('successfully processes OCR data', async () => {
        vi.mocked(createWorker).mockResolvedValue(workerMock)
        vi.mocked(parseString).mockImplementation((_input, callback) => {
            // @ts-ignore
            callback(null, parseStringMock)
        })

        const result = await getNodeOcrData({ filePath: mockFilePath, language: mockLanguage })

        expect(createWorker).toHaveBeenCalledWith(mockLanguage)
        expect(workerMock.setParameters).toHaveBeenCalled()
        expect(workerMock.recognize).toHaveBeenCalledWith(mockFilePath)
        expect(workerMock.terminate).toHaveBeenCalled()
        expect(result.text).toBe('Extracted text')
        expect(result.words.length).toBeGreaterThan(0)
        expect(result.lines.length).toBeGreaterThan(0)
    })

    it('handles recognition errors', async () => {
        workerMock.recognize.mockRejectedValue(new Error('Recognition failed'))
        vi.mocked(createWorker).mockResolvedValue(workerMock)

        try {
            await getNodeOcrData({ filePath: mockFilePath, language: mockLanguage })
            throw new Error('Test failed: Expected error was not thrown')
        } catch (error) {
            expect(workerMock.terminate).toHaveBeenCalledTimes(1)
            expect(error.message).toBe('An error happened when parsing the getNodeOcrData, see: Error: Recognition failed')
        }
    })

    it('handles XML parsing errors', async () => {
        vi.mocked(createWorker).mockResolvedValue(workerMock)
        vi.mocked(parseString).mockImplementation((_input, callback) => {
            // @ts-ignore
            callback(new Error('Parsing failed'), null)
        })

        await expect(getNodeOcrData({ filePath: mockFilePath, language: mockLanguage }))
            .rejects.toThrow('Parsing failed')
        expect(workerMock.terminate).toHaveBeenCalled()
    })

    it('handles hocr parsing errors', async () => {
        workerMock.recognize.mockResolvedValue({ data: { text: 'Extracted text' } })
        vi.mocked(createWorker).mockResolvedValue(workerMock)

        await expect(getNodeOcrData({ filePath: mockFilePath, language: mockLanguage }))
            .rejects
            .toThrow(`An error happened when parsing the getNodeOcrData, see: Error: No hocr data was found for the OCR, please verify image at: ${mockFilePath}`)
        expect(workerMock.terminate).toHaveBeenCalled()
    })

    it('handles composedBlocks parsing errors', async () => {
        vi.mocked(createWorker).mockResolvedValue(workerMock)
        vi.mocked(parseString).mockImplementation((_input, callback) => {
            // @ts-ignore
            callback(null, { div: { div: [] } })
        })

        await expect(getNodeOcrData({ filePath: mockFilePath, language: mockLanguage }))
            .rejects
            .toThrow('No text was found for the OCR, please verify the stored image.')
        expect(workerMock.terminate).toHaveBeenCalled()
    })

    it('be able to handle no/empty block.p or array', async () => {
        vi.mocked(createWorker).mockResolvedValue(workerMock)
        vi.mocked(parseString).mockImplementation((_input, callback) => {
            // @ts-ignore
            callback(null, { div: { div: [{ $: { 'class': 'ocr_carea' } }] } })
        })

        expect(await getNodeOcrData({ filePath: mockFilePath, language: mockLanguage })).toMatchSnapshot()

        vi.mocked(parseString).mockImplementation((_input, callback) => {
            // @ts-ignore
            callback(null, { div: { div: [{ $: { 'class': 'ocr_carea' }, p: 'notAnArray' }] } })
        })

        expect(await getNodeOcrData({ filePath: mockFilePath, language: mockLanguage })).toMatchSnapshot()
    })

    it('be able to handle no/empty p.span or array', async () => {
        vi.mocked(createWorker).mockResolvedValue(workerMock)
        vi.mocked(parseString).mockImplementation((_input, callback) => {
            // @ts-ignore
            callback(null, { div: { div: [{ $: { 'class': 'ocr_carea' }, p:[] }] } })
        })

        expect(await getNodeOcrData({ filePath: mockFilePath, language: mockLanguage })).toMatchSnapshot()

        vi.mocked(parseString).mockImplementation((_input, callback) => {
            // @ts-ignore
            callback(null, { div: { div: [{ $: { 'class': 'ocr_carea' }, p: [{ span:{} }] }] } })
        })

        expect(await getNodeOcrData({ filePath: mockFilePath, language: mockLanguage })).toMatchSnapshot()
    })

    it('be able to handle no/empty p.span.line.span or array', async () => {
        vi.mocked(createWorker).mockResolvedValue(workerMock)
        vi.mocked(parseString).mockImplementation((_input, callback) => {
            // @ts-ignore
            callback(null, { div: { div: [{ $: { 'class': 'ocr_carea' }, p:[{ span:[] }] }] } })
        })

        expect(await getNodeOcrData({ filePath: mockFilePath, language: mockLanguage })).toMatchSnapshot()

        vi.mocked(parseString).mockImplementation((_input, callback) => {
            // @ts-ignore
            callback(null, { div: { div: [{ $: { 'class': 'ocr_carea' }, p: [{ span:[{ _: 'test', $: {} }] }] }] } })
        })

        expect(await getNodeOcrData({ filePath: mockFilePath, language: mockLanguage })).toMatchSnapshot()
    })

    it('be able to handle no/empty p.span.line.span words or array', async () => {
        vi.mocked(createWorker).mockResolvedValue(workerMock)
        vi.mocked(parseString).mockImplementation((_input, callback) => {
            // @ts-ignore
            callback(null, { div: { div: [{ $: { 'class': 'ocr_carea' }, p:[{ span:[{ span: [{}] }] }] }] } })
        })

        expect(await getNodeOcrData({ filePath: mockFilePath, language: mockLanguage })).toMatchSnapshot()
    })

    it('be able to handle no lineData.bbox', async () => {
        vi.mocked(createWorker).mockResolvedValue(workerMock)
        vi.mocked(parseString).mockImplementation((_input, callback) => {
            // @ts-ignore
            callback(null, {
                div: {
                    div: [{
                        $: { 'class': 'ocr_carea' },
                        p: [{
                            span: [{
                                span: [{
                                    _: 'Node.js',
                                    $: { 'class': 'ocrx_word', 'id': 'word_1_9', 'title': 'bbox 378 77 479 105; x_wconf 89' }
                                }],
                            }]
                        }]
                    }]
                }
            })
        })

        expect(await getNodeOcrData({ filePath: mockFilePath, language: mockLanguage })).toMatchSnapshot()
    })
})

describe('getSystemOcrData', () => {
    let mockedParsedTextSting
    let mockedParsedString
    const mockFilePath = '/fake/path/image.png'
    const mockLanguage = 'eng'
    const options = { filePath: mockFilePath, language: mockLanguage }

    beforeEach(() => {
        vi.clearAllMocks()
        mockedParsedTextSting = '\n\t\t\nNext-gen browser and mobile automation\n\ntest framework for Node.js\n\t'
        mockedParsedString = [{
            $: { ID: 'cblock_0', HPOS: '18', VPOS: '18', WIDTH: '564', HEIGHT: '29' },
            TextBlock: [{
                $: { ID: 'block_0', HPOS: '18', VPOS: '18', WIDTH: '564', HEIGHT: '29' },
                TextLine: [{
                    $: { ID: 'line_0', HPOS: '18', VPOS: '18', WIDTH: '564', HEIGHT: '29' },
                    String: [
                        { $: { ID: 'string_0', HPOS: '18', VPOS: '18', WIDTH: '127', HEIGHT: '29', WC: '0.90', CONTENT: 'Next-gen' } },
                        { $: { ID: 'string_1', HPOS: '156', VPOS: '18', WIDTH: '108', HEIGHT: '23', WC: '0.96', CONTENT: 'browser' } }
                    ],
                    SP: [
                        { $: { WIDTH: '11', VPOS: '18', HPOS: '145' } },
                        { $: { WIDTH: '8', VPOS: '18', HPOS: '264' } }
                    ]
                }]
            }]
        },
        {
            $: { ID: 'cblock_1', HPOS: '120', VPOS: '77', WIDTH: '359', HEIGHT: '28' },
            TextBlock: [{
                $: { ID: 'block_1', HPOS: '120', VPOS: '77', WIDTH: '359', HEIGHT: '28' },
                TextLine: [{
                    $: { ID: 'line_1', HPOS: '120', VPOS: '77', WIDTH: '359', HEIGHT: '28' },
                    String: [
                        { $: { ID: 'string_5', HPOS: '120', VPOS: '79', WIDTH: '51', HEIGHT: '21', WC: '0.96', CONTENT: 'test' } },
                        { $: { ID: 'string_6', HPOS: '179', VPOS: '77', WIDTH: '146', HEIGHT: '23', WC: '0.95', CONTENT: 'framework' } }
                    ],
                    SP: [
                        { $: { WIDTH: '8', VPOS: '79', HPOS: '171' } },
                        { $: { WIDTH: '8', VPOS: '77', HPOS: '325' } }
                    ]
                }]
            }]
        }]
    })

    it('successfully processes OCR data', async () => {
        const mockResult = '<alto><Layout><Page><PrintSpace><ComposedBlock><TextBlock><TextLine HPOS="100" VPOS="200" WIDTH="300" HEIGHT="400"><String CONTENT="Hello" HPOS="100" VPOS="200" WIDTH="50" HEIGHT="20" WC="0.95"/></TextLine></TextBlock></ComposedBlock></PrintSpace></Page></Layout></alto>'

        vi.mocked(recognize).mockResolvedValue(mockResult)
        vi.mocked(parseString).mockImplementation((_input, callback) => {
            // @ts-ignore
            callback(null, {
                alto: {
                    Layout: [{
                        _: mockedParsedTextSting,
                        Page: [{ PrintSpace: [{ ComposedBlock: mockedParsedString }] }]
                    }]
                }
            })
        })

        const result = await getSystemOcrData(options)

        expect(recognize).toHaveBeenCalledWith(mockFilePath, {
            lang: mockLanguage,
            oem: 1,
            psm: 3,
            presets: ['txt', 'alto']
        })
        expect(result.text).toMatchSnapshot()
        expect(result.lines.length).toEqual(2)
        expect(result.words.length).toEqual(4)
    })

    it('handles recognition errors', async () => {
        vi.mocked(recognize).mockRejectedValue(new Error('Recognition failed'))

        await expect(getSystemOcrData({ filePath: mockFilePath, language: mockLanguage }))
            .rejects
            .toThrow('An error happened when parsing the getSystemOcrData, see: Error: Recognition failed')
    })

    it('handles XML parsing errors', async () => {
        const mockResult = 'Invalid XML content'

        vi.mocked(recognize).mockResolvedValue(mockResult)
        vi.mocked(parseString).mockImplementation((_input, callback) => {
            // @ts-ignore
            callback(new Error('Parsing failed'), null)
        })

        await expect(getSystemOcrData({ filePath: mockFilePath, language: mockLanguage }))
            .rejects
            .toThrow('Parsing failed')
    })

    it('handles cases with no text found', async () => {
        const mockResult = '<alto><Layout><Page><PrintSpace><ComposedBlock/></PrintSpace></Page></Layout></alto>'

        vi.mocked(recognize).mockResolvedValue(mockResult)
        vi.mocked(parseString).mockImplementation((_input, callback) => {
            // @ts-ignore
            callback(null, { alto: { Layout: [{ Page: [{ PrintSpace: [{ ComposedBlock: [] }] }] }] } })
        })

        await expect(getSystemOcrData({ filePath: mockFilePath, language: mockLanguage }))
            .rejects
            .toThrow('No text was found for the OCR, please verify the stored image.')
    })

    describe('getSystemOcrData missing properties', () => {
        const mockFilePath = '/fake/path/image.png'
        const mockLanguage = 'eng'

        beforeEach(() => {
            vi.clearAllMocks()
            vi.mocked(recognize).mockResolvedValue('<alto>...</alto>') // Base mock for OCR recognize function
        })

        function setupStringMock(missingKey) {
            const baseStringData = {
                CONTENT: 'Hello',
                HPOS: '100',
                VPOS: '200',
                WIDTH: '50',
                HEIGHT: '20',
                WC: '0.95'
            }
            const modifiedStringData = { ...baseStringData, [missingKey]: undefined }
            const mockData = {
                alto: {
                    Layout: [{
                        Page: [{
                            PrintSpace: [{
                                ComposedBlock: [{
                                    TextBlock: [{
                                        TextLine: [{
                                            $: { HPOS: '100', VPOS: '200', WIDTH: '300', HEIGHT: '400' },
                                            String: [{ $: modifiedStringData }]
                                        }]
                                    }]
                                }]
                            }]
                        }]
                    }]
                }
            }
            vi.mocked(parseString).mockImplementation((input, callback) => {
                // @ts-ignore
                callback(null, mockData)
            })
        }

        it.each(['CONTENT', 'HPOS', 'VPOS', 'WIDTH', 'HEIGHT', 'WC'])('should handle missing %s property', async (missingKey) => {
            setupStringMock(missingKey)

            const result = await getSystemOcrData({ filePath: mockFilePath, language: mockLanguage })

            expect(result.words).toHaveLength(0)
            expect(result.lines).toHaveLength(0)
        })
    })

})
