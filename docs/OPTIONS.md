# Options
This plugin uses the options and options documentation from [webdriver-image-comparison](https://github.com/wswebcreation/webdriver-image-comparison).

> **NOTE:** Clicking on the links will open a new TAB 

## Plugin options
Plugin options are the options that can be set when the plugin is instantiated and can be found <a href="https://github.com/wswebcreation/webdriver-image-comparison/blob/master/docs/OPTIONS.md#plugin-options" target="_blank">here</a>.
An example can be find below:

```js
// wdio.conf.js
exports.config = {
    // ...
    // ========================
    // Native app compare setup
    // ========================
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

## Method options
Methods options are the options that can be set per method. If the option has the same key as an options that has been set during the instantiation of the plugin, this method option will override the plugin option value.
They can be found <a href="https://github.com/wswebcreation/webdriver-image-comparison/blob/master/docs/OPTIONS.md#method-options" target="_blank">here</a>.

An example for all methods can be found below:

```js
describe('Example', () => {
  beforeEach(async () => {
    await browser.url();
  });
  
  it('should save some screenshots', () => {
  	// Save a screen
  	browser.saveScreen('examplePaged', {
  		disableCSSAnimation: true,
  		hideScrollBars: true,
  	});
  	
  	// Save an element
  	browser.saveElement($('.uk-button:nth-child(1)'), 'firstButtonElement', {
  		resizeDimensions: { 
  			top: 10, 
  			right: 5, 
  			bottom: 30, 
  			left: 10,
  		}
  	});
  	
  	// Save a full page screens
  	browser.saveFullPageScreen('fullPage', {
  		fullPageScrollTimeout: 3000,
  	});
  });
  
  it('should compare successful with a baseline', () => {
  	// Check a screen
  	expect(browser.checkScreen('examplePaged', {
  		blockOut: [ {
  				height: 10, 
  				width: 5, 
  				x: 40, 
  				y: 65
  			},{
  				height: 250, 
  				width: 500,
  				x: 0,
  				y: 35
  			},
  		],
  		ignoreAlpha: true,
  		blockOutStatusBar: true,
  	})).toEqual(0);
  	
  	// Check an element
  	expect(browser.checkElement($('.uk-button:nth-child(1)'), 'firstButtonElement', {
  		ignoreAntialiasing: true,
  		
  	})).toEqual(0);
  	
  	// Check a full page screens
  	expect(browser.checkFullPageScreen('fullPage', {
  		ignoreColors: true,
  	})).toEqual(0);
	});
});
``` 

## Compare options
Compare options are the options that can be set during instantiation of the plugin or per method. If the options has the same key as an option that has been set during the instantiation of the plugin, the method compare option will override the plugin compare option value.
They can be found <a href="https://github.com/wswebcreation/webdriver-image-comparison/blob/master/docs/OPTIONS.md#compare-options" target="_blank">here</a>.
The usage can be found above in the plugin and method examples.

## Folder options
The baseline folder and screenshot folders(actual, diff) are options that can be set during instantiation of the plugin or method. To set the folder options on a particular method, pass in folder options to the methods option object
```
const methodOptions = {
    actualFolder: path.join(process.cwd(), './testActual'),
    baselineFolder: path.join(process.cwd(), './testBaseline'),
    diffFolder: path.join(process.cwd(), './testDiff')
};
expect(browser.checkFullPageScreen('cehckFullPage', methodOptions)).toEqual(0);

const methodOptions = {
    actualFolder: path.join(process.cwd(), './testActual')
};
const imageData = browser.saveFullPageScreen('saveFullPage', {}, methodOptions);
```
