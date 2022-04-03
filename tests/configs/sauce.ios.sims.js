const { join } = require("path");

module.exports = function sauceIosSim({ buildName, specs }) {
    const mobileSpecs = join(process.cwd(), "./tests/specs/mobile.spec.js");
    const genericCaps = {
        "sauce:options": {
            build: buildName,
            appiumVersion: "1.21.0",
        },
        specs: [mobileSpecs],
    };

    return [
        /**
         * iPhones
         */
        {
            browserName: "safari",
            platformName: "ios",
            "appium:deviceName": "iPhone 8 Simulator",
            "appium:platformVersion": "12.4",
            "appium:automationName": "XCUITest",
            "wdio-ics:options": {
                logName: "iPhone8Simulator",
            },
            ...genericCaps,
        },
        {
            browserName: "safari",
            platformName: "ios",
            "appium:deviceName": "iPhone X Simulator",
            "appium:platformVersion": "13.4",
            "appium:automationName": "XCUITest",
            "wdio-ics:options": {
                logName: "iPhoneXSimulator",
            },
            ...genericCaps,
        },
        {
            browserName: "safari",
            platformName: "ios",
            "appium:deviceName": "iPhone XS Simulator",
            "appium:platformVersion": "14.5",
            "appium:automationName": "XCUITest",
            "wdio-ics:options": {
                logName: "iPhoneXsSimulator",
            },
            ...genericCaps,
        },
        // @TODO: check if the iPhone 11 has a different address bar height,
        // element cuts are not correct, rest is ok
        // {
        //     browserName: "safari",
        //     platformName: "ios",
        //     "appium:deviceName": "iPhone 11 Simulator",
        //     "appium:platformVersion": "14.5",
        //     "appium:automationName": "XCUITest",
        //     "wdio-ics:options": {
        //         logName: "iPhone11Simulator",
        //     },
        //     ...genericCaps,
        // },
        // // @TODO: Check why the element cuts are not correct
        // {
        //     browserName: "safari",
        //     platformName: "ios",
        //     "appium:deviceName": "iPhone 11 Pro Simulator",
        //     "appium:platformVersion": "15.2",
        //     "appium:automationName": "XCUITest",
        //     "wdio-ics:options": {
        //         logName: "iPhone11ProSimulator",
        //     },
        //     ...genericCaps,
        //     // 15.2 needs to have appium version 1.22.2
        //     "sauce:options": {
        //         appiumVersion: "1.22.2",
        //         build: buildName,
        //     },
        // },

        /**
         * iPads
         */
        {
            browserName: "safari",
            platformName: "ios",
            "appium:deviceName": "iPad Air Simulator",
            "appium:platformVersion": "12.4",
            "appium:automationName": "XCUITest",
            "wdio-ics:options": {
                logName: "iPadAirSimulator",
            },
            ...genericCaps,
        },
        {
            browserName: "safari",
            platformName: "IOS",
            "appium:deviceName": "iPad (7th generation) Simulator",
            "appium:platformVersion": "13.4",
            "appium:automationName": "XCUITest",
            "wdio-ics:options": {
                logName: "iPad13.7th",
            },
            ...genericCaps,
        },
        {
            browserName: "safari",
            platformName: "IOS",
            "appium:deviceName": "iPad Air 2 Simulator",
            "appium:platformVersion": "14.4",
            "appium:automationName": "XCUITest",
            "wdio-ics:options": {
                logName: "iPadAir2Simulator",
            },
            ...genericCaps,
        },
        // @TODO: need to fix the homebar on the iPad pro, this needs to be fixed in the
        // webdriver-image-comparison module
        // {
        //     browserName: "safari",
        //     platformName: "ios",
        //     "appium:deviceName":
        //         "iPad Pro (12.9 inch) (3rd generation) Simulator",
        //     "appium:platformVersion": "13.2",
        //     "appium:automationName": "XCUITest",
        //     "wdio-ics:options": {
        //         logName: "iPadPro12.9.3rdGeneration",
        //     },
        //     ...genericCaps,
        // },
    ];
};
