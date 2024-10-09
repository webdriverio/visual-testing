import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const demoFolderPath = join(__dirname, '..', '..', 'demo')
const reportPath = join(__dirname, '..', '..', 'public', 'static', 'report')
const DEBUG_MODE = process.env.VISUAL_REPORT_DEBUG_LEVEL === 'debug'

async function resizeImage(inputPath, outputPath) {
    try {
        const image = sharp(inputPath)
        const metadata = await image.metadata()

        const width = metadata.width || 300
        const height = metadata.height || 300

        const newWidth = width > 300 ? 300 : width
        const newHeight = Math.round((height / width) * newWidth)

        await image
            .resize(newWidth, newHeight)
            .extract({
                left: 0,
                top: 0,
                width: newWidth,
                height: Math.min(newHeight, 300),
            })
            .toFile(outputPath)
    } catch (err) {
        if (DEBUG_MODE) {
            console.error(`Error processing image ${inputPath}: ${err.message}`)
        }
    }
}

function parseFilePath(filePath) {
    return filePath.includes('{{vtr-demo-folder}}') ? normalize(filePath.replace('{{vtr-demo-folder}}', demoFolderPath)) : filePath
}

async function createThumbnailForFile(filePath) {
    try {
        const ext = extname(filePath)
        const baseName = basename(filePath, ext)
        const thumbnailName = 'VHTMLR-THUMBNAIL'
        const outputFilePath = join(
            dirname(filePath),
            `${baseName}-${thumbnailName}${ext}`
        )

        if (existsSync(outputFilePath) || baseName.includes(thumbnailName)) {
            return
        }

        await resizeImage(filePath, outputFilePath)
    } catch (err) {
        if (DEBUG_MODE) {
            console.error(`Error creating thumbnail for ${filePath}: ${err.message}`)
        }
    }
}

async function generateThumbnails(outputJsonPath, outputCopyPath) {
    try {
        const data = readFileSync(outputJsonPath, 'utf-8')
        const jsonData = JSON.parse(data)

        for (const description of jsonData) {
            for (const testData of description.data) {
                for (const methodData of testData.data) {
                    const { fileData } = methodData
                    if (fileData) {
                        for (const prop in fileData) {
                            if (['actualFilePath', 'baselineFilePath', 'diffFilePath'].includes(prop)) {
                                fileData[`original_${prop}`] = fileData[prop]
                            }
                        }

                        if (fileData?.actualFilePath) {
                            fileData.actualFilePath = parseFilePath(fileData.actualFilePath)
                            await createThumbnailForFile(fileData.actualFilePath)
                        }
                        if (fileData?.baselineFilePath) {
                            fileData.baselineFilePath = parseFilePath(fileData.baselineFilePath)
                        }
                        if (fileData?.diffFilePath) {
                            fileData.diffFilePath = parseFilePath(fileData.diffFilePath)
                            await createThumbnailForFile(fileData.diffFilePath)
                        }
                    }
                }
            }
        }

        writeFileSync(outputCopyPath, JSON.stringify(jsonData, null, 2), 'utf-8')
        console.log(`Thumbnails generated and JSON data saved to ${outputCopyPath}`)
    } catch (error) {
        if (DEBUG_MODE) {
            console.error(`Error generating thumbnails or saving JSON: ${error.message}`)
        }
    }
}

async function prepareReport(){
    const outputJsonPath = process.env.VISUAL_REPORT_OUTPUT_JSON_PATH || join(demoFolderPath, 'output.json')

    existsSync(reportPath) && rmSync(reportPath, { recursive: true })
    mkdirSync(reportPath, { recursive: true })
    // copyFileSync(outputJsonPath, join(reportPath, 'output.json'))
    await generateThumbnails(outputJsonPath, join(reportPath, 'output.json'))
}

// Execute the main function
prepareReport()
