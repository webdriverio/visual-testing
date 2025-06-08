// @ts-ignore: Ignoring type checking for this module import
import * as resembleJimp from './resemble.jimp.cjs'
import type { CompareData, ComparisonOptions } from './compare.interfaces.js'

export default async function compareImages(
    image1: Buffer,
    image2: Buffer,
    options: ComparisonOptions
): Promise<CompareData> {
    /**
     * Resemble.js implemented in the way that scales 2nd images to the size of 1st.
     * Experimentally proven that downscaling images produces more accurate result than upscaling
     */
    const { imageToCompare1, imageToCompare2 } =
        options.scaleToSameSize && image1.length > image2.length
            ? {
                imageToCompare1: image2,
                imageToCompare2: image1,
            }
            : { imageToCompare1: image1, imageToCompare2: image2 }

    try {
        const data = await resembleJimp.default.compare(imageToCompare1, imageToCompare2, options)
        return data
    } catch (err) {
        throw err
    }
}
