import type { Folders } from '../base.interfaces.js'
import type {  ImageCompareResult } from '../methods/images.interfaces.js'
import type { InstanceData } from '../methods/instanceData.interfaces.js'
import type { Methods } from '../methods/methods.interfaces.js'
import saveAppScreen from './saveAppScreen.js'
import type { CheckScreenOptions } from './screen.interfaces.js'

/**
 * Compare an image of the viewport of the screen
 */
export default async function checkAppScreen(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    tag: string,
    checkScreenOptions: CheckScreenOptions,
    isNativeContext: boolean,
): Promise<ImageCompareResult | number> {
    // 1.  Take the actual screenshot and retrieve the needed data
    const saveAppScreenOptions = {
        wic: checkScreenOptions.wic,
        method:{
            ...{ hideElements: [] },
            ...{ removeElements:  [] },
        }
    }
    const {
        devicePixelRatio,
        fileName,
        isLandscape,
    } = await saveAppScreen(methods, instanceData, folders, tag, saveAppScreenOptions, isNativeContext)

    console.log('checkAppScreen devicePixelRatio:', devicePixelRatio)
    console.log('checkAppScreen fileName:', fileName)
    console.log('checkAppScreen isLandscape:', isLandscape)
    // 2a. Determine the compare options

    return 0
}
