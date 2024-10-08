# Visual Reporter

## Background

The `@wdio/visual-service` has a reporting output since [v5.2.0](https://github.com/webdriverio/visual-testing/releases/tag/%40wdio%2Fvisual-service%405.2.0) which will output the diffs into a large JSON file. This project is a sample of what people could do with the output.

To make use of this utility, you need to have the 'output.json' file generated by the Visual Testing service. This file is only generated when you have the following in your configuration:

```ts
export const config = {
    // ...
    services: [
        [
            // Also installed as a dependency
            "visual-regression",
            {
                createJsonReportFiles: true,
            },
        ],
    ],
    },
}
```

For more information, please refer to the WebdriverIO Visual Testing [documentation](https://webdriver.io/docs/visual-testing).

## Installation

The easiest way is to keep `@wdio/visual-reporter` as a dev-dependency in your `package.json`, via:

```sh
npm install @wdio/visual-reporter --save-dev
```

## Usage

To build the report you can call the CLI with `npx @wdio/visual-reporter` and answer all questions

### The CLI

https://github.com/user-attachments/assets/eeb22692-928c-4734-a49b-0e22655d2a1d

### The Visual Reporter

https://github.com/user-attachments/assets/9cdfec36-e1ff-4b48-a842-23f3f7d5768e

> [!NOTE]
> Created with a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
