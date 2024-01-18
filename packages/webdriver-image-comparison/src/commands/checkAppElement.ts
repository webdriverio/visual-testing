import type { Folders } from '../base.interfaces.js'
import type { ImageCompareResult } from '../methods/images.interfaces.js'
import type { InstanceData } from '../methods/instanceData.interfaces.js'
import type { Methods } from '../methods/methods.interfaces.js'
import type { CheckElementOptions, WicElement } from './element.interfaces.js'
import saveAppElement from './saveAppElement.js'

/**
 * Compare  an image of the element
 */
export default async function checkAppElement(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    element: WicElement,
    tag: string,
    checkElementOptions: CheckElementOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isNativeContext: boolean,
): Promise<ImageCompareResult | number> {
    // Visual module steps
    //
    // 1a. Set some variables
    // 1b. Set the method options to the right values
    // 2.  Prepare the beforeScreenshot
    // Scroll the element into top of the viewport and return the current scroll position
    // 3.  Take the screenshot
    // 4.  Determine the rectangles
    // 5.  Make a cropped base64 image with resizeDimensions
    // 6.  The after the screenshot methods
    // 7.  Return the data

    // The native app compare module steps
    //
    // Determine the element compare options
    // Save the element and return the data
    const base64Image: any = await saveAppElement(
        methods,
        instanceData,
        folders,
        element,
        tag,
        checkElementOptions,
        isNativeContext,
    )

    console.log('base64Image', base64Image)
    // Check if the baseline image exists
    // Determine the ignore rectangles
    // Execute the compare
    // Return compare results and if a baseline image was created

    return 0
}
