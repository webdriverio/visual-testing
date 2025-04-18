---
"webdriver-image-comparison": minor
"@wdio/visual-service": minor
---

With BiDi support, passing extra options when capturing screenshots is possible.
For example, full-page screenshots can now be generated more easily — see the [browsingContextCaptureScreenshot](https://webdriver.io/docs/api/webdriverBidi#browsingcontextcapturescreenshot) docs.

This release
- simplifies logic
- speeds up execution with more than 50% 🚀 🤯   ![image](https://github.com/user-attachments/assets/394ad1d6-bbc7-42dd-b93b-ff7eb5a80429)

by using BiDi for Full Page Desktop Web screenshots.

This can be enabled and disabled on the service

```ts
// wdio.conf.ts
export const config = {
    // ...
    // =====
    // Setup
    // =====
    services: [
        [
            "visual",
            {
                // Some options, see the docs for more
                userBasedFullPageScreenshot: false // Default is `false
                // ... more options
            },
        ],
    ],
    // ...
};
```

or on the test level

```ts
await expect(browser).toMatchFullPageSnapshot('fullPage', {
  userBasedFullPageScreenshot: false, // `false` by default
})
```
