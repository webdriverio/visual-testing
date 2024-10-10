import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const demoFolderPath = join(__dirname, '..', '..', 'demo')
const reportPath = join(__dirname, '..', '..', 'public', 'static', 'report')
const DEBUG_MODE = process.env.VISUAL_REPORT_DEBUG_LEVEL === 'debug'

/**
 * Checks if a folder exists and creates it if it doesn't.
 * If the provided folder path contains a file extension, it assumes the folder path is for a file and checks the parent directory.
 *
 * @param {string} folderPath - The path to the folder or file. If the path includes a file (e.g., with a `.png` extension), it will check the existence of the parent folder.
 */
function checkFolderExists(folderPath) {
    const folderPathHasExtension = extname(folderPath) === '.png'
    const outputDir = dirname(folderPathHasExtension? folderPath : join(folderPath, 'dummy.png'))

    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true })
    }
}

/**
 * Gets the destination folder path by appending the subfolder and last folder of the file path.
 *
 * @param {Object} paths - An object containing file path information.
 * @param {string} paths.filePath - The full path of the file.
 * @param {string} paths.subFolder - The subfolder within the report folder.
 * @returns {string} - The full path to the destination folder, constructed from the report path, subfolder, and last folder in the file path.
 */
function getDestinationFolder({ filePath, subFolder }) {
    const directoryPath = dirname(filePath)
    const lastFolder = directoryPath.split(sep).pop()

    return join(reportPath, subFolder, lastFolder)
}

/**
 * Constructs the full destination file path by joining the destination folder and the base name of the file.
 *
 * @param {Object} paths - An object containing file path information.
 * @param {string} paths.filePath - The full path of the file.
 * @param {string} paths.subFolder - The subfolder within the report folder where the file will be placed.
 * @returns {string} - The full destination path where the file should be placed, including the file name.
 */
function getDestinationFilePath({ filePath, subFolder }) {
    const baseName = basename(filePath)
    const destinationFolder = getDestinationFolder({ filePath, subFolder })

    return join(destinationFolder, baseName)
}

/**
 * Copies a file to the specified destination folder.
 * Ensures the destination folder exists before copying the file.
 *
 * @param {Object} paths - An object containing file path information.
 * @param {string} paths.filePath - The full path of the file to be copied.
 * @param {string} paths.destinationFolder - The destination folder where the file will be copied.
 */
function copyFileToReportFolder({ filePath, destinationFolder }) {
    try {
        checkFolderExists(destinationFolder)
        copyFileSync(filePath, destinationFolder)
    } catch (err) {
        if (DEBUG_MODE) {
            console.error(`Error copying file ${filePath}: ${err.message}`)
        }
    }
}

/**
 * Resizes an image to fit within a maximum width and height of 300 pixels and saves it to the specified output path.
 * Ensures that the folder for the output path exists before saving the file.
 *
 * @param {Object} paths - An object containing the input and output paths for the image.
 * @param {string} paths.inputFilePath - The full path of the input image to be resized.
 * @param {string} paths.outputFilePath - The full path where the resized image will be saved.
 * @returns {Promise<void>} - A promise that resolves when the image has been resized and saved.
 */
async function resizeImage({ inputFilePath, outputFilePath }) {
    try {
        // Ensure the output folder exists before saving the file
        checkFolderExists(outputFilePath)

        // Resize the image to fit within a maximum width and height of 300 pixels
        const size = 300
        const image = sharp(inputFilePath)
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
            .toFile(outputFilePath)
    } catch (err) {
        if (DEBUG_MODE) {
            console.error(`Error processing image ${inputFilePath}: ${err.message}`)
        }
    }
}

/**
 * Replaces the `{{vtr-demo-folder}}` placeholder in the file path with the given parent path.
 *
 * @param {Object} paths - An object containing the paths.
 * @param {string} paths.parentPath - The path that will replace the `{{vtr-demo-folder}}` placeholder in the file path.
 * @param {string} paths.filePath - The file path that may contain the `{{vtr-demo-folder}}` placeholder.
 * @returns {string} - The modified file path with `{{vtr-demo-folder}}` replaced by `parentPath`, or the original file path if the placeholder is not found.
 */
function parseFilePath({ parentPath, filePath }) {
    return filePath.includes('{{vtr-demo-folder}}') ? normalize(filePath.replace('{{vtr-demo-folder}}', parentPath)) : filePath
}

/**
 * Creates a thumbnail for the specified image file by resizing it and saving the thumbnail with a specific naming convention.
 * Ensures the thumbnail is not created if it already exists or if the base name includes the thumbnail marker.
 *
 * @param {string} filePath - The full path of the file for which the thumbnail will be created.
 * @returns {Promise<void>} - A promise that resolves when the thumbnail has been created, or returns early if the thumbnail already exists.
 */
async function createThumbnailForFile(filePath) {
    try {
        const ext = extname(filePath)
        const baseName = basename(filePath, ext)
        const thumbnailName = 'VHTMLR-THUMBNAIL'
        const fileNamePath = dirname(filePath)
        const outputFilePath = join(fileNamePath, `${baseName}-${thumbnailName}${ext}`)

        if (existsSync(outputFilePath) || baseName.includes(thumbnailName)) {
            return
        }

        await resizeImage({ inputFilePath: filePath, outputFilePath })
    } catch (err) {
        if (DEBUG_MODE) {
            console.error(`Error creating thumbnail for ${filePath}: ${err.message}`)
        }
    }
}

/**
 * Generates report assets by copying the actual, baseline, and diff images to the report folder,
 * generating thumbnails for the actual and diff images, and saving an updated JSON file with paths.
 *
 * @param {Object} paths - An object containing the paths to the output and report JSON files.
 * @param {string} paths.outputJsonPath - The path to the original output JSON file that contains file paths and test data.
 * @param {string} paths.reportJsonPath - The path to the JSON file where the updated report data will be saved.
 * @returns {Promise<void>} - A promise that resolves when the assets are generated and the report is saved.
 */
async function generateReportAssets({ outputJsonPath, reportJsonPath }) {
    try {
        // 1. Read the output JSON file
        const data = readFileSync(outputJsonPath, 'utf-8')
        const jsonData = JSON.parse(data)

        // 2. For each description (of feature for cucumber), test (it for jasmine/mocha and scenario for cucumber)
        //    and method, copy files and generate thumbnails in the report folder
        for (const description of jsonData) {
            for (const testData of description.data) {
                for (const methodData of testData.data) {
                    const { fileData } = methodData
                    if (fileData) {
                        // 3a. The fileData object contains the paths to the actual, baseline and diff images
                        //     We will first save the original paths and store them in the fileData object so that we can use them later
                        for (const prop in fileData) {
                            if (['actualFilePath', 'baselineFilePath', 'diffFilePath'].includes(prop)) {
                                fileData[`original_${prop}`] = fileData[prop]
                            }
                        }

                        // 3b. We will copy the baseline, actual and diff images to the report folder
                        //     and generate thumbnails for the actual and diff images
                        if (fileData?.baselineFilePath) {
                            fileData.baselineFilePath = parseFilePath({ parentPath: reportPath, filePath: fileData.baselineFilePath })
                            const originalBaselineFilePath = parseFilePath({ parentPath: demoFolderPath, filePath: fileData.original_baselineFilePath })
                            const baselineReportFilePath = getDestinationFilePath({ filePath: originalBaselineFilePath, subFolder: 'baseline' })
                            copyFileToReportFolder({ filePath: originalBaselineFilePath, destinationFolder: baselineReportFilePath })
                        }
                        if (fileData?.actualFilePath) {
                            fileData.actualFilePath = parseFilePath({ parentPath: reportPath, filePath: fileData.actualFilePath })
                            const originalActualFilePath = parseFilePath({ parentPath: demoFolderPath, filePath: fileData.original_actualFilePath })
                            const actualReportFilePath = getDestinationFilePath({ filePath: originalActualFilePath, subFolder: 'actual' })
                            copyFileToReportFolder({ filePath: originalActualFilePath, destinationFolder: actualReportFilePath })

                            await createThumbnailForFile(actualReportFilePath)
                        }
                        if (fileData?.diffFilePath) {
                            fileData.diffFilePath = parseFilePath({ parentPath:reportPath, filePath:fileData.diffFilePath })
                            const originalDiffFilePath = parseFilePath({ parentPath: demoFolderPath, filePath: fileData.original_diffFilePath })
                            const diffReportFilePath = getDestinationFilePath({ filePath: originalDiffFilePath, subFolder: 'diff' })
                            copyFileToReportFolder({ filePath: originalDiffFilePath, destinationFolder: diffReportFilePath })

                            await createThumbnailForFile(diffReportFilePath)
                        }
                    }
                }
            }
        }

        // 4. Save the updated JSON data to the report folder
        writeFileSync(reportJsonPath, JSON.stringify(jsonData, null, 2), 'utf-8')

        console.log(`Report assets copied, generated and saved to ${reportPath}`)
    } catch (error) {
        console.error(`Error generating thumbnails or saving JSON: ${error.message}`)
    }
}

/**
 * Prepare the report by ensuring the report directory is recreated and the report assets are generated.
 * Deletes the existing report directory if it exists, then creates a fresh one.
 *
 * @returns {Promise<void>} - A promise that resolves when the report assets have been generated.
 */
async function prepareReportAssets(){
    const outputJsonPath = process.env.VISUAL_REPORT_OUTPUT_JSON_PATH || join(demoFolderPath, 'output.json')
    const reportJsonPath = join(reportPath, 'output.json')

    existsSync(reportPath) && rmSync(reportPath, { recursive: true })
    mkdirSync(reportPath, { recursive: true })

    await generateReportAssets({ outputJsonPath, reportJsonPath })
}

prepareReportAssets()
