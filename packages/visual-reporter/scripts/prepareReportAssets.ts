import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const demoFolderPath = join(__dirname, '..', 'demo')
const baseDir = process.env.VISUAL_REPORT_LOCAL_DEV === 'true' ? 'public' : join('build', 'client')
const reportPath = join('static', 'report')
const reporterBasePath = process.env.VISUAL_REPORT_REPORTER_FOLDER || join(__dirname, '..', baseDir)
const DEBUG_MODE = process.env.VISUAL_REPORT_DEBUG_LEVEL === 'debug'
const thumbnailPostFix = 'VHTMLR-THUMBNAIL'

/**
 * Checks if a folder exists and creates it if it doesn't.
 * If the provided folder path contains a file extension, it assumes the folder path is for a file and checks the parent directory.
 */
function checkFolderExists(folderPath: string): void {
    const folderPathHasExtension = extname(folderPath) === '.png'
    const outputDir = dirname(folderPathHasExtension ? folderPath : join(folderPath, 'dummy.png'))

    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true })
    }
}

/**
 * Gets the destination folder path by appending the subfolder and last folder of the file path.
 */
function getDestinationFolder({ filePath, subFolder = '' }: { filePath: string, subFolder?: string}): string {
    const directoryPath = dirname(filePath)
    const lastFolder = directoryPath.split(sep).pop() || ''
    return join(reportPath, subFolder, lastFolder)
}

/**
 * Constructs the full destination file path by joining the destination folder and the base name of the file.
 */
function getDestinationFilePath({ filePath, subFolder }: { filePath: string, subFolder?: string}): string {
    const baseName = basename(filePath)
    const destinationFolder = getDestinationFolder({ filePath, subFolder })
    return join(destinationFolder, baseName)
}

/**
 * Copies a file to the specified destination folder.
 * Ensures the destination folder exists before copying the file.
 */
function copyFileToReportFolder({ filePath, destinationFolder }: { filePath: string, destinationFolder: string}): void {
    try {
        const reporterFolder = join(reporterBasePath, destinationFolder)
        checkFolderExists(reporterFolder!)
        copyFileSync(filePath, reporterFolder!)
    } catch (error) {
        if (DEBUG_MODE) {
            console.error(`Error copying file ${filePath}: ${(error as unknown as Error).message}`)
        }
    }
}

/**
 * Resizes an image to fit within a maximum width and height of 300 pixels and saves it to the specified output path.
 * Ensures that the folder for the output path exists before saving the file.
 */
async function resizeImage({ inputFilePath, outputFilePath }: { inputFilePath:string, outputFilePath:string }): Promise<void> {
    try {
        checkFolderExists(outputFilePath!)
        const size = 300
        const image = sharp(inputFilePath!)
        const metadata = await image.metadata()
        const width = metadata.width || size
        const height = metadata.height || size
        const newWidth = width > size ? size : width
        const newHeight = Math.round((height / width) * newWidth)

        await image
            .resize(newWidth, newHeight)
            .extract({
                left: 0,
                top: 0,
                width: newWidth,
                height: Math.min(newHeight, size),
            })
            .toFile(outputFilePath!)
    } catch (error) {
        if (DEBUG_MODE) {
            console.error(`Error processing image ${inputFilePath}: ${(error as unknown as Error).message}`)
        }
    }
}

/**
 * Replaces the `/{{vtr-demo-folder}}` placeholder in the file path with the given parent path.
 */
function parseFilePath({ parentPath, filePath }: { parentPath: string; filePath: string }): string {
    return filePath.includes('{{vtr-demo-folder}}') ?
        normalize(join(filePath.replace(/\/?{{vtr-demo-folder}}/, parentPath))) :
        filePath
}

/**
 * Creates a thumbnail for the specified image file by resizing it and saving the thumbnail with a specific naming convention.
 */
async function createThumbnailForFile(filePath: string): Promise<string|undefined> {
    try {
        const ext = extname(filePath)
        const baseName = basename(filePath, ext)
        const fileNamePath = dirname(filePath)
        const outputFilePath = join(fileNamePath, `${baseName}-${thumbnailPostFix}${ext}`)
        const thumbnailPath = join('static', 'report', outputFilePath.split(/static[\\/]+report[\\/]+/)[1])

        if (existsSync(outputFilePath) || baseName.includes(thumbnailPostFix)) {
            return thumbnailPath
        }

        await resizeImage({ inputFilePath: filePath, outputFilePath })

        return thumbnailPath
    } catch (error) {
        if (DEBUG_MODE) {
            console.error(`Error creating thumbnail for ${filePath}: ${(error as unknown as Error).message}`)
        }
    }
}

/**
 * Generates report assets by copying the actual, baseline, and diff images to the report folder.
 */
async function generateReportAssets({ outputJsonPath, reportJsonPath }: { outputJsonPath: string; reportJsonPath: string }): Promise<void> {
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

                        if (fileData?.baselineFilePath) {
                            const originalBaselineFilePath = parseFilePath({ parentPath: demoFolderPath, filePath: fileData.original_baselineFilePath })
                            const baselineReportFilePath = getDestinationFilePath({ filePath: originalBaselineFilePath, subFolder: 'baseline' })
                            fileData.baselineFilePath = baselineReportFilePath
                            copyFileToReportFolder({ filePath: originalBaselineFilePath, destinationFolder: baselineReportFilePath })
                        }
                        if (fileData?.actualFilePath) {
                            const originalActualFilePath = parseFilePath({ parentPath: demoFolderPath, filePath: fileData.original_actualFilePath })
                            const actualReportFilePath = getDestinationFilePath({ filePath: originalActualFilePath, subFolder: 'actual' })
                            fileData.actualFilePath = actualReportFilePath
                            copyFileToReportFolder({ filePath: originalActualFilePath, destinationFolder: actualReportFilePath })

                            fileData.actualThumbnail = await createThumbnailForFile(join(reporterBasePath, actualReportFilePath))
                        }
                        if (fileData?.diffFilePath) {
                            const originalDiffFilePath = parseFilePath({ parentPath: demoFolderPath, filePath: fileData.original_diffFilePath })
                            const diffReportFilePath = getDestinationFilePath({ filePath: originalDiffFilePath, subFolder: 'diff' })
                            fileData.diffFilePath = diffReportFilePath
                            copyFileToReportFolder({ filePath: originalDiffFilePath, destinationFolder: diffReportFilePath })

                            fileData.diffThumbnail = await createThumbnailForFile(join(reporterBasePath, diffReportFilePath))
                        }
                    }
                }
            }
        }

        writeFileSync(reportJsonPath, JSON.stringify(jsonData, null, 2), 'utf-8')
        console.log(`Report assets copied, generated and saved to ${reportPath}`)
    } catch (error) {
        console.error(`Error generating thumbnails or saving JSON: ${(error as unknown as Error).message}`)
    }
}

/**
 * Prepares the report by ensuring the report directory is recreated and the report assets are generated.
 */
async function prepareReportAssets(): Promise<void> {
    const outputJsonPath = process.env.VISUAL_REPORT_OUTPUT_JSON_PATH || join(demoFolderPath, 'output.json')
    const reporterBaseFolder = join(reporterBasePath, 'static', 'report')
    const reportJsonPath = join(reporterBaseFolder, 'output.json')

    mkdirSync(reporterBaseFolder, { recursive: true })

    await generateReportAssets({ outputJsonPath, reportJsonPath })
}

prepareReportAssets()
