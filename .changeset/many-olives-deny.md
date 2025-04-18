---
"webdriver-image-comparison": major
"@wdio/visual-service": major
"@wdio/visual-reporter": patch
"@wdio/ocr-service": patch
---

## 💥 BREAKING CHANGES

### 🔍 Viewport Screenshot Logic Reworked for Mobile Web & Hybrid Apps

#### What was the problem?

Screenshots for mobile devices were inconsistent due to platform differences. iOS captures the entire device screen (including status and address bars), while Android (using ChromeDriver) only captures the webview, unless the capability `"appium:nativeWebScreenshot": true` is used.

#### What changed?

We’ve reimplemented the logic to correctly handle both platforms by default.
This fix addresses [[#747](https://github.com/webdriverio/visual-testing/pull/747)](https://github.com/webdriverio/visual-testing/pull/747).

💡 Credit to [Benjamin Karran (@ebekebe)](https://github.com/ebekebe) for pointing us in the right direction to improve this logic!

#### What’s the advantage?

✅ More **accurate full-page and element screenshots** on both Android and iOS.
⚠️ But this change may **break your current baselines**, especially on Android and iOS.

---

### 🍏 iOS Element Screenshot Strategy Changed

#### What was the problem?

iOS element screenshots were previously cut from full-device screenshots, which could lead to misalignment or off-by-a-few-pixels issues.

#### What changed?

We now use the element screenshot endpoint directly.

#### What’s the advantage?

✅ More accurate iOS element screenshots.
⚠️ But again, this may affect your existing baselines.

---

### 🖥️ New Full-Page Screenshot Strategy for **Desktop Web**

#### What was the problem?

The "previous" scroll-and-stitch method simulated user interaction by scrolling the page, waiting, taking a screenshot, and repeating until the entire page was captured.
This works well for **lazy-loaded content**, but it is **slow and unstable** on other pages.

#### What changed?

We now use WebDriver BiDi’s [`[browsingContext.captureScreenshot](https://webdriver.io/docs/api/webdriverBidi#browsingcontextcapturescreenshot)`] to capture **full-page screenshots in one go**. This is the new **default strategy for desktop web browsers**.

📌 **Mobile platforms (iOS/Android)** still use the scroll-and-stitch approach for now.

#### What’s the advantage?
✅ Execution time reduced by **50%+**
✅ Logic is greatly simplified
✅ More consistent and stable results on static or non-lazy pages
📸 ![Example](https://github.com/user-attachments/assets/394ad1d6-bbc7-42dd-b93b-ff7eb5a80429)

**Still want the old scroll-and-stitch behavior or need fullpage screenshots for pages who have lazy-loading?**

Use the `userBasedFullPageScreenshot` option to simulate user-like scrolling. This remains the **better choice for pages with lazy-loading**:

```ts
// wdio.conf.ts
services: [
  ["visual", {
    userBasedFullPageScreenshot: true
  }]
]
```

Or per test:

```ts
await expect(browser).toMatchFullPageSnapshot('homepage', {
  userBasedFullPageScreenshot: true,
})
```

---

## 💅 Polish

### ⚠️ Deprecated Root-Level Compare Options

#### What was the problem?

Compare options were allowed at the root level of the service config, making them harder to group or discover.

#### What changed?

You now get a warning if you still use root-level keys. Please move them under the `compareOptions` property instead.

**Example warning:**

```log
WARN The following root-level compare options are deprecated and should be moved under 'compareOptions':
  - blockOutStatusBar
  - ignoreColors
In the next major version, these options will be removed from the root level.
```

📘 See: [[compareOptions docs](https://webdriver.io/docs/visual-testing/service-options#compare-options)](https://webdriver.io/docs/visual-testing/service-options#compare-options)

---

## 🐛 Bug Fixes

- ✅ [[#747](https://github.com/your-repo/issues/747)](https://github.com/your-repo/issues/747): Fixed incorrect mobile webview context data.

---

## 🔧 Other

- 🆙 Updated dependencies
- 🧪 Improved test coverage
- 📸 Refreshed image baselines

---

## Committers: 1

-   Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
