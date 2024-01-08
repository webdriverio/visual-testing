import type { EnrichedInstanceData, InstanceData } from '../methods/instanceData.interfaces'
import type { LogLevel } from './options.interfaces'

export interface BeforeScreenshotOptions {
    // The instance data
    instanceData: InstanceData;
    // The padding that needs to be added to the address bar on iOS and Android to do a proper cutout of the the viewport.
    addressBarShadowPadding: number;
    // Disable all css animations
    disableCSSAnimation: boolean;
    // Level to show logs
    logLevel: LogLevel;
    // Hide all scrollbars
    noScrollBars: boolean;
    // The padding that needs to be added to the tool bar on iOS and Android
    toolBarShadowPadding: number;
    // Elements that need to be hidden (visibility: hidden) before saving a screenshot
    hideElements: HTMLElement[];
    // Elements that need to be removed (display: none) before saving a screenshot
    removeElements: HTMLElement[];
}

export type BeforeScreenshotResult = EnrichedInstanceData;
