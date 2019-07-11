/**
 * Get the folders data
 *
 * If folder options are passed in use those values
 * Otherwise, use the values set during instantiation
 *
 * @returns {{
 *    actualFolder: string,
 *    baselineFolder: string,
 *    diffFolder: string
 *  }}
 */
export function getFolders(methodOptions, folders) {
    return {
        actualFolder: (methodOptions.actualFolder ? methodOptions.actualFolder : folders.actualFolder),
        baselineFolder: (methodOptions.baselineFolder ? methodOptions.baselineFolder : folders.baselineFolder),
        diffFolder: (methodOptions.diffFolder ? methodOptions.diffFolder : folders.diffFolder)
    };
}

/**
 * Get the instance data
 *
 * @returns {{
 *    browserName: string,
 *    deviceName: string,
 *    logName: string,
 *    name: string,
 *    nativeWebScreenshot: boolean,
 *    platformName: string
 *  }}
 */
export function getInstanceData(capabilities) {
    // Substract the needed data from the running instance
    const browserName = (capabilities.browserName || '').toLowerCase();
    const logName = capabilities.logName
        || (capabilities[ 'sauce:options' ] ? capabilities[ 'sauce:options' ].logName : null)
        || (capabilities[ 'appium:options' ] ? capabilities[ 'appium:options' ].logName : null)
        || (capabilities[ 'wdio-ics:options' ] ? capabilities[ 'wdio-ics:options' ].logName : null)
        || '';
    const name = capabilities.name || '';

    // For mobile
    const platformName = (capabilities.platformName || '').toLowerCase();
    const deviceName = (capabilities.deviceName || '').toLowerCase();
    const nativeWebScreenshot = !!capabilities.nativeWebScreenshot;

    return {
        browserName,
        deviceName,
        logName,
        name,
        nativeWebScreenshot,
        platformName,
    };
}
