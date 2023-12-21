export interface GetAndCreatePathOptions {
  // The name of the browser
  browserName: string;
  // The name of the device
  deviceName: string;
  // Is the instance a mobile
  isMobile: boolean;
  // If the folder needs to have the instance name in it
  savePerInstance: boolean;
}

export interface FormatFileNameOptions {
  // The browser name
  browserName: string;
  // The browser version
  browserVersion: string;
  // The device name
  deviceName: string;
  // The device pixel ratio
  devicePixelRatio: number;
  // The string that needs to be formated
  formatImageName: string;
  // Is this a mobile
  isMobile: boolean;
  // Is the test executed in a browser
  isTestInBrowser: boolean;
  // The log name of the instance
  logName: string;
  // The the name of the instance
  name: string;
  // The outer height of the screen
  outerHeight: number;
  // The outer width of the screen
  outerWidth: number;
  // The platform name
  platformName: string;
  // The platform version
  platformVersion: string;
  // The height of the screen
  screenHeight: number;
  // The width of the screen
  screenWidth: number;
  // The tag of the image
  tag: string;
}

export interface FormatFileDefaults {
  // The browser name
  browserName: string;
  // The browser version
  browserVersion: string;
  // The device name
  deviceName: string;
  // The device pixel ratio
  dpr: number;
  // The height of the screen
  height: number;
  // The log name of the instance
  logName: string;
  // Add `app` or nothing
  mobile: string;
  // The the name of the instance
  name: string;
  // The platform name
  platformName: string;
  // The platform version
  platformVersion: string;
  // The tag of the image
  tag: string;
  // The width of the screen
  width: number;
}

export interface GetAddressBarShadowPaddingOptions {
  // The name of the platform
  platformName: string;
  // The browser name
  browserName: string;
  // Is this an instance that takes a native web screenshot
  nativeWebScreenshot: boolean;
  // The address bar shadow padding
  addressBarShadowPadding: number;
  // Add the padding
  addShadowPadding: boolean;
}

export interface GetToolBarShadowPaddingOptions {
  // The name of the platform
  platformName: string;
  // The browser name
  browserName: string;
  // The tool bar shadow padding
  toolBarShadowPadding: number;
  // Add the padding
  addShadowPadding: boolean;
}

export interface ScreenshotSize {
  height: number;
  width: number;
}
