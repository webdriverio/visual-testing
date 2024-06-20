---
"@wdio/visual-service": minor
---

Adding storybook interaction testing

### Storybook Interaction Testing

Storybook Interaction Testing allows you to interact with your component by creating custom scripts with WDIO commands to set a component into a certain state. For example, see the code snippet below:

```ts
import { browser, expect } from "@wdio/globals";

describe("Storybook Interaction", () => {
    it("should create screenshots for the logged in state when it logs out", async () => {
        const componentId = "example-page--logged-in";
        await browser.waitForStorybookComponentToBeLoaded({ id: componentId });

        await expect($("header")).toMatchElementSnapshot(
            `${componentId}-logged-in-state`
        );
        await $("button=Log out").click();
        await expect($("header")).toMatchElementSnapshot(
            `${componentId}-logged-out-state`
        );
    });

    it("should create screenshots for the logged out state when it logs in", async () => {
        const componentId = "example-page--logged-out";
        await browser.waitForStorybookComponentToBeLoaded({ id: componentId });

        await expect($("header")).toMatchElementSnapshot(
            `${componentId}-logged-out-state`
        );
        await $("button=Log in").click();
        await expect($("header")).toMatchElementSnapshot(
            `${componentId}-logged-in-state`
        );
    });
});
```

Two tests on two different components are executed. Each test first sets a state and then takes a screenshot. You will also notice that a new custom command has been introduced, which can be found [here](#new-custom-command).

The above spec file can be saved in a folder and added to the command line with the following command:

```sh
npm run test.local.desktop.storybook.localhost -- --spec='tests/specs/storybook-interaction/*.ts'
```

The Storybook runner will first automatically scan your Storybook instance and then add your tests to the stories that need to be compared. If you don't want the components that you use for interaction testing to be compared twice, you can add a filter to remove the "default" stories from the scan by providing the [`--skipStories`](#--skipstories) filter. This would look like this:

```sh
npm run test.local.desktop.storybook.localhost -- --skipStories="/example-page.*/gm" --spec='tests/specs/storybook-interaction/*.ts'
```

### New Custom Command

A new custom command called `browser.waitForStorybookComponentToBeLoaded({ id: 'componentId' })` will be added to the `browser/driver`-object that will automatically load the component and wait for it to be done, so you don't need to use the `browser.url('url.com')` method. It can be used like this

```ts
import { browser, expect } from "@wdio/globals";

describe("Storybook Interaction", () => {
    it("should create screenshots for the logged in state when it logs out", async () => {
        const componentId = "example-page--logged-in";
        await browser.waitForStorybookComponentToBeLoaded({ id: componentId });

        await expect($("header")).toMatchElementSnapshot(
            `${componentId}-logged-in-state`
        );
        await $("button=Log out").click();
        await expect($("header")).toMatchElementSnapshot(
            `${componentId}-logged-out-state`
        );
    });

    it("should create screenshots for the logged out state when it logs in", async () => {
        const componentId = "example-page--logged-out";
        await browser.waitForStorybookComponentToBeLoaded({ id: componentId });

        await expect($("header")).toMatchElementSnapshot(
            `${componentId}-logged-out-state`
        );
        await $("button=Log in").click();
        await expect($("header")).toMatchElementSnapshot(
            `${componentId}-logged-in-state`
        );
    });
});
```

The options are:

#### `clipSelector`

-   **Type:** `string`
-   **Mandatory:** No
-   **Default:** `#storybook-root > :first-child` for Storybook V7 and `#root > :first-child:not(script):not(style)` for Storybook V6
-   **Example:**

```ts
await browser.waitForStorybookComponentToBeLoaded({
    clipSelector: "#your-selector",
    id: "componentId",
});
```

This is the selector that will be used:

-   to select the element to take the screenshot of
-   for the element to wait to be visible before a screenshot is taken

#### `id`

-   **Type:** `string`
-   **Mandatory:** yes
-   **Example:**

```ts
await browser.waitForStorybookComponentToBeLoaded({ '#your-selector', id: 'componentId' })
```

Use the `id` of the story that can be found in the URL of the story. For example, the `id` in this URL `http://localhost:6006/?path=/story/example-page--logged-out` is `example-page--logged-out`

#### `timeout`

-   **Type:** `number`
-   **Mandatory:** No
-   **Default:** 1100 milliseconds
-   **Example:**

```ts
await browser.waitForStorybookComponentToBeLoaded({
    id: "componentId",
    timeout: 20000,
});
```

The max timeout we want to wait for a component to be visible after loading on the page

#### `url`

-   **Type:** `string`
-   **Mandatory:** No
-   **Default:** `http://127.0.0.1:6006`
-   **Example:**

```ts
await browser.waitForStorybookComponentToBeLoaded({
    id: "componentId",
    url: "https://your.url",
});
```

The URL where your Storybook instance is hosted.
