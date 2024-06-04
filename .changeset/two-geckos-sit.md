---
"webdriver-image-comparison": major
"@wdio/visual-service": major
---

# 💥 Breaking

This PR replaces Canvas as a dependency with Jimp. This removes the need to use system dependencies and will reduce the number of system dependency errors/issues (node-gyp/canvas and so on). This will, in the end, make the life of our end users way easier due to:

-   less errors
-   less complex test environments

> [!note]
> Extensive research has been done and we have chosen to "fork" ResembleJS, adjust it by making use of Jimp instead of Canvas and break the browser API because the fork will only be used in a nodejs environment
> Investigation showed that creating a wrapper would even make it slower, so we went for the breaking change in the API by just replacing Canvas with Jimp

> [!important]
> There is a performance impact where Canvas is around 70% faster than Jimp. This has been measured without using WebdriverIO and only comparing images. When the "old" implementation with WebdriverIO combined with Canvas or Jimp is compared, we hardly see a performance impact.

# 🚀 New Features

Update the baseline images through the command line by adding the argument `--update-visual-baseline`. This will

-   automatically copy the actual take screenshot and put it in the baseline folder
-   if there are differences it will let the test pass because the baseline has been updated

**Usage:**

```sh
npm run test.local.desktop  --update-visual-baseline
```

When running logs info/debug mode you will see the following logs added

```logs
[0-0] ..............
[0-0] #####################################################################################
[0-0]  INFO:
[0-0]  Updated the actual image to
[0-0]  /Users/wswebcreation/Git/wdio/visual-testing/localBaseline/chromel/demo-chrome-1366x768.png
[0-0] #####################################################################################
[0-0] ..........
```

# 💅 Polish

-   remove Vitest fix
-   add app images
-   update the build
