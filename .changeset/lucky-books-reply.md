---
"webdriver-image-comparison": major
"@wdio/visual-service": major
---

# 💥  Breaking changes
- the new element screenshot is producing "smaller" screenshots on certain Android OS versions (not all), but it's more "accurate" so we accept this

# 🚀 New Features
## Add StoryBook📖  support
Automatically scan local/remote storybook instances to create element screenshots of each component by adding

```ts
export const config: Options.Testrunner = {
    // ...
    services: ['visual'],
    // ....
}
```

to your `services` and running `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook` through the command line.
It will automatically use Chrome. The following options can be provided through the command line

- `--headless`, defaults to `true`
- `--numShards {number}`,  this will be the amount of parallel instances that will be used to run the stories. This will be limited by the `maxInstances` in your `wdio.conf`-file. When running in `headless`-mode then do not increase the number to more than 20 to prevent flakiness
- `--clip {boolean}`, try to take an element instead of a viewport screenshot, defaults to `true`
- `--clipSelector {string}`, this is the selector that will be used to:
  - select the element to take the screenshot of
  - the element to wait for to be visible before a screenshot is taken

  defaults to `#storybook-root > :first-child` for V7 and `#root > :first-child:not(script):not(style)` for V6
- `--version`, the version of storybook, defaults to 7. This is needed to know if the V6 `clipSelector` needs to be used.
- `--browsers {edge,chrome,safari,firefox}`, defaults to Chrome
- `--skipStories`, this can be:
  -  a string (`example-button--secondary,example-button--small`)
  - or a regex (`"/.*button.*/gm"`) to skip certain stories

You can also provide service options

```ts
export const config: Options.Testrunner = {
    // ...
    services: [
      [
        'visual',
        {
            // Some default options
            baselineFolder: join(process.cwd(), './__snapshots__/'),
            debug: true,
            // The storybook options
            storybook: {
                clip: false,
                clipSelector: ''#some-id,
                numShards: 4,
                skipStories: ['example-button--secondary', 'example-button--small'],
                url: 'https://www.bbc.co.uk/iplayer/storybook/',
                version: 6,
            },
        },
      ],
    ],
    // ....
}
```

The baseline images will be stored in the following structure:

```log
{projectRoot}
|_`__snapshots__`
  |_`{category}`
    |_`{componentName}`
      |_{browserName}
        |_`{{component-id}-element-{browser}-{resolution}-dpr-{dprValue}}.png`
```

which will look like this

![image](https://github.com/webdriverio/visual-testing/assets/11979740/7c41a8b4-2498-4e85-be11-cb1ec601b760)


> [!NOTE]
> Storybook 6.5 or higher is supported

# 💅 Polish
- `hideScrollBars` is disabled by default when using the Storybook runner
- By default, all element screenshots in the browser, except for iOS, will use the native method to take element screenshots. This will make taking an element screenshot more than 5% faster. If it fails it will fall back to the "viewport" screenshot and create a cropped element screenshot.
- Taking an element screenshot becomes 70% faster due to removing the fixed scroll delay of 500ms and changing the default scrolling behaviour to an instant scroll
- refactor web element screenshots and update the screenshots
- added more UTs to increase the coverage

# 🐛  Bug Fixes
- When the element has no height or width, we default to the viewport screen size to prevent not cropping any screenshot. An error like below will be logged in red

```logs

The element has no width or height. We defaulted to the viewport screen size of width: ${width} and height: ${height}.

```

- There were cases where element screenshots were automatically rotated which was not intended
