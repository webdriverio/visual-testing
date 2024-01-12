import type { ImageCompareResult } from '../methods/images.interfaces'
import type { Methods } from '../methods/methods.interfaces'
import type { InstanceData } from '../methods/instanceData.interfaces'
import type { Folders } from '../base.interfaces'
import type { CheckScreenOptions } from './screen.interfaces'
import checkAppScreen from './checkAppScreen.js'
import checkWebScreen from './checkWebScreen.js'

/**
 * Compare an image of the viewport of the screen
 */
export default async function checkScreen(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    tag: string,
    checkScreenOptions: CheckScreenOptions,
    isNativeContext: boolean,
): Promise<ImageCompareResult | number> {
    console.log('checkElement isNativeContext:', isNativeContext)

    return isNativeContext
        ? checkAppScreen()
        : checkWebScreen(methods, instanceData, folders, tag, checkScreenOptions)
}
