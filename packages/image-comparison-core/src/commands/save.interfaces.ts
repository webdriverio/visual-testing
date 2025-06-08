import type { InstanceData } from 'src/methods/instanceData.interfaces.js'
import type { SaveFullPageOptions } from './fullPage.interfaces.js'
import type { SaveScreenOptions } from './screen.interfaces.js'
import type { SaveElementOptions, WicElement } from './element.interfaces.js'
import type { SaveTabbableOptions } from './tabbable.interfaces.js'
import type { Folders } from 'src/base.interfaces.js'

export interface InternalSaveMethodOptions {
    browserInstance: WebdriverIO.Browser;
    instanceData: InstanceData;
    isNativeContext?: boolean;
    folders: Folders;
    tag: string;
}

export interface InternalSaveScreenMethodOptions extends InternalSaveMethodOptions {
    saveScreenOptions: SaveScreenOptions,
}

export interface InternalSaveElementMethodOptions extends InternalSaveMethodOptions {
    element: HTMLElement | WicElement;
    saveElementOptions: SaveElementOptions,
}

export interface InternalSaveFullPageMethodOptions extends InternalSaveMethodOptions {
    saveFullPageOptions: SaveFullPageOptions,
}

export interface InternalSaveTabbablePageMethodOptions extends InternalSaveMethodOptions {
    saveTabbableOptions: SaveTabbableOptions,
}
