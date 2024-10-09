import fs from 'node:fs'
import { basename, dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const demoFolderPath = join(__dirname, '..', '..', 'demo')
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

async function createThumbnailForFile(filePath) {
    try {
        const newFilePath = filePath.includes('{{vtr-demo-folder}}') ? normalize(filePath.replace('{{vtr-demo-folder}}', demoFolderPath)) : filePath
        const ext = extname(newFilePath)
        const baseName = basename(newFilePath, ext)
        const thumbnailName = 'VHTMLR-THUMBNAIL'
        const outputFilePath = join(
            dirname(newFilePath),
            `${baseName}-${thumbnailName}${ext}`
        )

        if (fs.existsSync(outputFilePath) || baseName.includes(thumbnailName)) {
            return
        }

        await resizeImage(newFilePath, outputFilePath)
    } catch (err) {
        if (DEBUG_MODE) {
            console.error(`Error creating thumbnail for ${newFilePath}: ${err.message}`)
        }
    }
}

async function generateThumbnails() {
    const outputJsonPath = process.env.VISUAL_REPORT_OUTPUT_JSON_PATH || join(demoFolderPath, 'output.json')

    try {
        const data = fs.readFileSync(outputJsonPath, 'utf-8')
        const jsonData = JSON.parse(data)

        for (const description of jsonData) {
            for (const testData of description.data) {
                for (const methodData of testData.data) {
                    const { fileData } = methodData
                    if (fileData?.actualFilePath) {
                        await createThumbnailForFile(fileData.actualFilePath)
                    }
                    if (fileData?.diffFilePath) {
                        await createThumbnailForFile(fileData.diffFilePath)
                    }
                }
            }
        }
    } catch (error) {
        if (DEBUG_MODE) {
            console.error(`Error generating thumbnails: ${error.message}`)
        }
    }
}

// Execute the main function
generateThumbnails()
