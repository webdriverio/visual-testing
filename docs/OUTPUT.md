# Save output
## saveElement
```js
browser.saveElement(firstButton, 'example-element-tag');
```
### Desktop
![saveElement Desktop](./images/firstButtonElement-chrome-latest-1366x768.png)
### Mobile
#### Android
![saveElement Mobile](./images/firstButtonElement-GooglePixelGoogleAPIEmulator8.1ChromeDriver-360x640.png)
#### iOS
![saveElement Mobile](./images/firstButtonElement-iPhoneXSimulator-375x812.png)

## saveScreen
```js
browser.saveScreen('example-page-tag');
```
### Desktop
![saveScreen Desktop](./images/examplePage-chrome-latest-1366x768.png)
### Mobile
#### Android ChromeDriver
![saveScreen Mobile](./images/examplePage-GooglePixelGoogleAPIEmulator8.1ChromeDriver-360x640.png)
#### Android nativeWebScreenshot
![saveScreen Mobile](./images/examplePage-GooglePixelGoogleAPIEmulator8.1NativeWebScreenshot-360x640.png)
#### iOS
![saveScreen Mobile](./images/examplePage-iPhoneXSimulator-375x812.png)

## saveFullPageScreen
```js
browser.saveFullPageScreen('full-page-tag');
```
### Desktop
![saveFullPageScreens Desktop](./images/fullPage-chrome-latest-1366x768.png)
### Mobile
#### Android
![saveFullPageScreens Mobile](./images/fullPage-GooglePixelGoogleAPIEmulator8.1NativeWebScreenshot-360x640.png)
#### iOS
![saveFullPageScreens Mobile](./images/fullPage-iPhoneXSimulator-375x812.png)

# Check output on failure

> **NOTE:** Only the diff of a browser is shown here, but the output is the same for Android and iOS. The first button text has been changed from `Button` to `Buttons`

## checkElement
```js
browser.checkElement('example-element-tag');
```
### Desktop
![checkElement Desktop](./images/firstButtonElement-fail-chrome-latest-1366x768.png)

## checkScreen
```js
browser.checkScreen('example-page-tag');
```
### Desktop
![checkScreen Desktop](./images/examplePage-fail-chrome-latest-1366x768.png)

## checkFullPageScreens
```js
browser.checkFullPageScreen('full-page-tag');
```
### Desktop
![checkFullPageScreens Desktop](./images/fullPage-fail-chrome-latest-1366x768.png)


# Blockouts

> **NOTE:** Not all blockout options are shown here, but below you will find an output for Android NativeWebScreenshot and iOS where the status+address and toolbar are blocked out

## Android nativeWebScreenshot
![saveFullPageScreens Mobile](./images/examplePage-blockout-GooglePixelGoogleAPIEmulator8.1NativeWebScreenshot-360x640.png)
## iOS
![saveFullPageScreens Mobile](./images/examplePage-blockout-iPhoneXSimulator-375x812.png)
