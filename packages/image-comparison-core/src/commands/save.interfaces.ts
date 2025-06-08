import type { InstanceData } from 'src/methods/instanceData.interfaces.js'
import type { SaveFullPageOptions } from './fullPage.interfaces.js'
import type { SaveScreenOptions } from './screen.interfaces.js'
import type { SaveElementOptions, WicElement } from './element.interfaces.js'
import type { SaveTabbableOptions } from './tabbable.interfaces.js'
import type { Folders } from 'src/base.interfaces.js'

export interface InternalSaveMethodOptions {
    instanceData: InstanceData;
    folders: Folders;
    tag: string;
    isNativeContext?: boolean;
}

export interface InternalSaveFullPageMethodOptions extends InternalSaveMethodOptions {
    saveFullPageOptions: SaveFullPageOptions,
}

export interface InternalSaveScreenMethodOptions extends InternalSaveMethodOptions {
    saveScreenOptions: SaveScreenOptions,
}

export interface InternalSaveElementMethodOptions extends InternalSaveMethodOptions {
    element: HTMLElement | WicElement;
    saveElementOptions: SaveElementOptions,
}

export interface InternalSaveTabbablePageMethodOptions extends InternalSaveMethodOptions {
    saveTabbableOptions: SaveTabbableOptions,
}
