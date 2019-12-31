wdio-image-comparison-service
==========

[![Gitter chat](https://badges.gitter.im/wswebcreation/wdio-image-comparison-service.png)](https://gitter.im/wswebcreation/wdio-image-comparison-service "Gitter chat")
[![dependencies Status](https://david-dm.org/wswebcreation/wdio-image-comparison-service/status.svg)](https://david-dm.org/wswebcreation/wdio-image-comparison-service) [![Build Status](https://travis-ci.org/wswebcreation/wdio-image-comparison-service.svg?branch=master)](https://travis-ci.org/wswebcreation/wdio-image-comparison-service) [![Sauce Test Status](https://eu-central-1.saucelabs.com/buildstatus/wdio-image-comparison-service)](https://eu-central-1.saucelabs.com/u/wdio-image-comparison-service)

[![NPM](https://nodei.co/npm/wdio-image-comparison-service.png)](https://nodei.co/npm/wdio-image-comparison-service/)

[![Sauce Test Status](https://eu-central-1.saucelabs.com/browser-matrix/wdio-image-comparison-service.svg)](https://eu-central-1.saucelabs.com/u/wdio-image-comparison-service)

## IMPORTANT!
1. This module will execute a **pixel-by-pixel** comparison for you. There are some things you can change during comparison, see [here](https://github.com/wswebcreation/webdriver-image-comparison/blob/master/docs/OPTIONS.md#plugin-options) but it stays a baisc **pixel-by-pixel** comparison. <br/> This means that if for example Chrome updates to a newer version, you might need to change your baseline due to fontrendering differences.
1. Secondly you can only execute visual comparison on screenshots that have been taken with the same platform. For example, the screenshot on a Mac with Chrome can't be used to compare the same page on a Ubuntu or Windows with Chrome. <br/>***You need to compare Apples with Apples, not Apples with Windows***
1. Try to prevent accepting a `missmatch percentage`. You never know what you accept and especially with large screenshots you might accept a button not being rendered and or shown on a page.
1. **DONT' TRY TO MIMIC MOBILE SCREENSIZES BY RESIZING YOUR BROWSER AND SAY IT'S A CHROME OR SAFARI MOBILE BROWSER!!!!** This module is there to compare visuals of what you're user would see. A resized Chrome or Safari is not equal to what your enduser is using on his mobile phone. Web-pages and so on a desktop browser CAN'T be compared with mobile browsers due to different font, html and JS-rendering.
1. In my humble opinion it's useless to use this module with headless browsers and I will also NOT support any issues as a result of headless browsers. Reason is that an enduser is not using a headless browser :wink:

## What can it do?
*wdio-image-comparison-service* is a lightweight *WebdriverIO* service for browsers / mobile browsers / hybrid apps to do image comparison on screens, elements or full page screens.

You can:

- save or compare screens / elements / full page screens against a baseline
- automatically create a baseline when no baseline is there
- blockout custom regions and even automatically exclude a status and or tool bars (mobile only) during a comparison
- increase the element dimensions screenshots
- use different comparison methods
- and much more, see the [options here](./docs/OPTIONS.md)

The module is now based on the power of the new [`webdriver-image-comparison`](https://github.com/wswebcreation/webdriver-image-comparison) module. This is a lightweight module to retrieve the needed data and screenshots for all browsers / devices.
The comparison power comes from [ResembleJS](https://github.com/Huddle/Resemble.js). If you want to compare images online you can check the [online tool](https://huddleeng.github.io/Resemble.js/)


It can be used for:

- desktop browsers (Chrome / Firefox / Safari / Internet Explorer 11 / Microsoft Edge)
- mobile / tablet browsers (Chrome / Safari on emulators / real devices) via Appium
- Hybrid apps via Appium

## Installation
Install this module locally with the following command to be used as a (dev-)dependency:

```shell
npm install --save wdio-image-comparison-service
npm install --save-dev wdio-image-comparison-service
```

Instructions on how to install `WebdriverIO` can be found [here.](http://webdriver.io/guide/getstarted/install.html)

## Usage
> ***wdio-image-comparison-service* supports NodeJS 8 or higher** 

### Configuration
`wdio-image-comparison-service` is a service so it can be used as a normal service. You can set it up in your `wdio.conf.js` file with the following

```js
const { join } = require('path');
// wdio.conf.js
exports.config = {
    // ...
    // =====
    // Setup
    // =====
    services: [ 
        ['image-comparison', 
        // The options
        {
            // Some options, see the docs for more
            baselineFolder: join(process.cwd(), './tests/sauceLabsBaseline/'),
            formatImageName: '{tag}-{logName}-{width}x{height}',
            screenshotPath: join(process.cwd(), '.tmp/'),
            savePerInstance: true,
            autoSaveBaseline: true,
            blockOutStatusBar: true,
            blockOutToolBar: true,
            // ... more options
        }], 
    ],
    // ...
};
``` 

More plugin options can be found [here](./docs/OPTIONS.md#plugin-options).

### Writing tests
*wdio-image-comparison-service* is framework agnostic, meaning that you can use it with all the frameworks WebdriverIO supports like `Jasmine|Mocha`. 
You can use it like this:

```js
describe('Example', () => {
  beforeEach(() => {
     browser.url('https://webdriver.io');
  });
  
  it('should save some screenshots', () => {
  	// Save a screen
  	browser.saveScreen('examplePaged', { /* some options*/ });
  	
  	// Save an element
  	browser.saveElement($('#element-id'), 'firstButtonElement', { /* some options*/ });
  	
  	// Save a full page screens
  	browser.saveFullPageScreen('fullPage', { /* some options*/ });
  });
  
  it('should compare successful with a baseline', () => {
  	// Check a screen
  	expect(browser.checkScreen('examplePaged', { /* some options*/ })).toEqual(0);
  	
  	// Check an element
  	expect(browser.checkElement($('#element-id'), 'firstButtonElement', { /* some options*/ })).toEqual(0);
  	
  	// Check a full page screens
  	expect(browser.checkFullPageScreen('fullPage', { /* some options*/ })).toEqual(0);
  });
});
``` 

**If you run for the first time without having a baseline the `check`-methods will reject the promise with the following warning:**

```shell
#####################################################################################
 Baseline image not found, save the actual image manually to the baseline.
 The image can be found here:
 /Users/wswebcreation/Git/wdio-image-comparison-service/.tmp/actual/desktop_chrome/examplePage-chrome-latest-1366x768.png
 If you want the module to auto save a non existing image to the baseline you
 can provide 'autoSaveBaseline: true' to the options.
#####################################################################################

```

This means that the current screenshot is saved in the actual folder and you **manually need to copy it to your baseline**.
If you instantiate `wdio-image-comparison-service` with `autoSaveBaseline: true` the image will automatically be saved into the baseline folder.

### Test result outputs
The `save(Screen/Element/FullPageScreen)` methods will provide the following information after the method has been executed:

```js
const saveResult = { 
	// The device pixel ratio of the instance that has run
  devicePixelRatio: 1,
  // The formatted filename, this depends on the options `formatImageName`
  fileName: 'examplePage-chrome-latest-1366x768.png',
  // The path where the actual screenshot file can be found
  path: '/Users/wswebcreation/Git/wdio-image-comparison-service/.tmp/actual/desktop_chrome',
};
```

See the [Save output](./docs/OUTPUT.md#save-output) section in the [output](./docs/OUTPUT.md) docs for the images.

By default the `check(Screen/Element/FullPageScreen)` methods will only provide a mismatch percentage like `1.23`, but when the plugin has the options `returnAllCompareData: true` the following information is provided after the method has been executed:

```js
const checkResult = {  
  // The formatted filename, this depends on the options `formatImageName`
  fileName: 'examplePage-chrome-headless-latest-1366x768.png',
  folders: {
      // The actual folder and the file name
      actual: '/Users/wswebcreation/Git/wdio-image-comparison-service/.tmp/actual/desktop_chrome/examplePage-chrome-headless-latest-1366x768.png',
      // The baseline folder and the file name
      baseline: '/Users/wswebcreation/Git/wdio-image-comparison-service/localBaseline/desktop_chrome/examplePage-chrome-headless-latest-1366x768.png',
      // This following folder is optional and only if there is a mismatch
      // The folder that holds the diffs and the file name
      diff: '/Users/wswebcreation/Git/wdio-image-comparison-service/.tmp/diff/desktop_chrome/examplePage-chrome-headless-latest-1366x768.png',
    },
    // The mismatch percentage
    misMatchPercentage: 2.34
};
```

See the [Check output on failure](./docs/OUTPUT.md#check-output-on-failure) section in the [output](./docs/OUTPUT.md) docs for the images.

## FAQ
### Do I need to use a `save(Screen/Element/FullPageScreen)` methods when I want to run `check(Screen/Element/FullPageScreen)`?
No, you don't need to do this. The `check(Screen/Element/FullPageScreen)` will do this automatically for you

### Width and height cannot be negative
It could be that the error `Width and height cannot be negative` is thrown. 9 out of 10 times this is related to creating an image of an element that is not in the view. Please be sure you always make sure the element in is in the view before you try to make an image of the element.

## Contribution
See [CONTRIBUTING.md](./docs/CONTRIBUTING.md).

## TODO:
- [ ] fix the scroll-bar for Android, sometimes it shows
- [ ] create a new website

## Credits
`wdio-image-comparison-service` uses an open source licence from Sauce Labs.
![Powered by Sauce LAbs](./docs/images/powered-by-saucelabs.png)

You can request your open source licence [here](https://saucelabs.com/open-source/open-sauce)

