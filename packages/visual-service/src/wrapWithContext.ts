import type { InstanceData } from '@wdio/image-comparison-core'
import type { WrapWithContextOptions } from './types.js'
import { getInstanceData } from './utils.js'

/**
 * Wrap the command with the context manager
 * This will make sure that the context manager is updated when needed
 * and that the command is executed in the correct context
 */
export function wrapWithContext<T extends (...args: any[]) => any>(opts: WrapWithContextOptions<T>): () => Promise<ReturnType<T>> {
    const { browserInstance, command, contextManager, getArgs } = opts

    return async function (this: WebdriverIO.Browser): Promise<ReturnType<T>> {
        if (contextManager.needsUpdate) {
            const instanceData: InstanceData = await getInstanceData({
                browserInstance,
                initialDeviceRectangles: contextManager.getViewportContext(),
                isNativeContext: contextManager.isNativeContext,
            })

            contextManager.setViewPortContext(instanceData.deviceRectangles)
        }

        const finalArgs = getArgs()

        return command.apply(this, finalArgs)
    }
}
