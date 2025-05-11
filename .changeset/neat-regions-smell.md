---
"webdriver-image-comparison": major
"@wdio/visual-service": major
---

## 💥 BREAKING CHANGES

### 🧪 Web Screenshot Strategy Now Uses BiDi by Default

#### What was the problem?

Screenshots taken via WebDriver's traditional protocol often lacked precision:

* Emulated devices didn't reflect true resolutions
* Device Pixel Ratio (DPR) was often lost
* Images were cropped or downscaled

#### What changed?

All screenshot-related methods now use the **WebDriver BiDi protocol** by default (if supported by the browser), enabling:

✅ Native support for emulated and high-DPR devices
✅ Better fidelity in screenshot size and clarity
✅ Faster, browser-native screenshots via [`browsingContext.captureScreenshot`](https://w3c.github.io/webdriver-bidi/#command-browsingContext-captureScreenshot)

The following methods now use BiDi:

* `saveScreen` / `checkScreen`
* `saveElement` / `checkElement`
* `saveFullPageScreen` / `checkFullPageScreen`

#### What’s the impact?

⚠️ **Existing baselines may no longer match.**
Because BiDi screenshots are **sharper** and **match device settings more accurately**, even a small difference in resolution or DPR can cause mismatches.

> If you rely on existing baseline images, you'll need to regenerate them to avoid false positives.

#### Want to keep using the legacy method?

You can disable BiDi screenshots globally or per test using the `enableLegacyScreenshotMethod` flag:

**Globally in `wdio.conf.ts`:**

```ts
import { join } from 'node:path'

export const config = {
    services: [
        [
            'visual',
            {
                baselineFolder: join(process.cwd(), './localBaseline/'),
                debug: true,
                formatImageName: '{tag}-{logName}-{width}x{height}',
                screenshotPath: join(process.cwd(), '.tmp/'),
                enableLegacyScreenshotMethod: true // 👈 fallback to W3C-based screenshots
            },
        ]
    ],
}
```

**Or per test:**

```ts
it('should compare an element successfully using legacy screenshots', async function () {
    await expect($('.hero__title-logo')).toMatchElementSnapshot(
        'legacyScreenshotLogo',
        { enableLegacyScreenshotMethod: true } // 👈 fallback to W3C-based screenshots
    )
})
```

## 🐛 Bug Fixes

-  ✅ [#916](https://github.com/webdriverio/visual-testing/issues/916): Visual Testing Screenshot Behavior Changed in Emulated Devices


## Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
