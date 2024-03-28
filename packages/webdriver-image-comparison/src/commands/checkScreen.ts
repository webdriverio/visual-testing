import type { ImageCompareResult } from '../methods/images.interfaces.js'
import type { Methods } from '../methods/methods.interfaces.js'
import type { InstanceData } from '../methods/instanceData.interfaces.js'
import type { Folders } from '../base.interfaces.js'
import type { CheckScreenOptions } from './screen.interfaces.js'
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
    return isNativeContext
        ? checkAppScreen(methods, instanceData, folders, tag, checkScreenOptions, isNativeContext)
        : checkWebScreen(methods, instanceData, folders, tag, checkScreenOptions, isNativeContext)
}
