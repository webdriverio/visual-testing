WebdriverIO Image Comparison Core
==========================

## Installation

The easiest way is to keep `@wdio/image-comparison-core` as a dev-dependency in your `package.json`, via:

```sh
npm install @wdio/image-comparison-core --save-dev
```

Instructions on how to get started can be found in the [visual testing](https://webdriver.io/docs/visual-testing) docs on the WebdriverIO project page.

## `ignore*` comparison options (pixelmatch)

v10 uses [pixelmatch](https://github.com/mapbox/pixelmatch) instead of resemble.js. The public `ignore*` API is preserved and mapped to resemble-style presets via last-wins semantics.

### Defaults vs resemble v9

| | v9 (resemble.js) | v10 default |
|---|---|---|
| AA forgiveness | opt-in (`ignoreAntialiasing: true`) | on by default (`ignoreAntialiasing: true`) |
| Strict comparison | default | set `ignoreAntialiasing: false` |
| Engine | resemble RGB/brightness | pixelmatch YIQ perceptual distance |

No config change is needed if you rely on forgiving comparison behaviour.

### Preset mapping

| Option | Preprocessing | pixelmatch threshold | AA forgiven |
|---|---|---|---|
| *(none, `ignoreAntialiasing: false`)* | — | ~16/255 (`0.063`) | no |
| `ignoreAntialiasing` | — | ~32/255 (`0.13`) | yes |
| `ignoreLess` | — | ~16/255 (`0.063`) | no |
| `ignoreAlpha` | alpha → opaque | ~16/255 (`0.063`) | no |
| `ignoreColors` | resemble luma grayscale | ~16/255 (`0.063`) | no |
| `ignoreNothing` | — | `0` | no |

Thresholds are calibrated to resemble outcomes; the underlying algorithm is YIQ perceptual distance, not resemble's RGB math.

### Last-wins semantics

When multiple `ignore*` flags are enabled, the active preset is the **last** one in this order (matching resemble.js):

`alpha` → `antialiasing` → `colors` → `less` → `nothing`

Example: `ignoreLess: true` with the default `ignoreAntialiasing: true` resolves to the `ignoreLess` preset — strict AA, not forgiving.

Golden fixture tests documenting expected pass/fail behaviour live in [`tests/fixtures/ignore-options/`](./tests/fixtures/ignore-options/).

## Direct pixelmatch options (`compareOptions.pixelmatch`)

As an alternative to the `ignore*` preset API, you can pass pixelmatch settings directly under `compareOptions.pixelmatch` (service config) or on method options (`checkScreen`, `checkElement`, etc.).

| Mode | API | Use case |
|---|---|---|
| **Preset** (default) | `ignore*` flags | Resemble-style presets; recommended for most users |
| **Direct** | `pixelmatch: { … }` | Full control over threshold, AA, and diff colours |

### Mutual exclusivity

`ignore*` and `pixelmatch` cannot appear on the same options object. The value of an `ignore*` key does not matter — `ignoreLess: false` still counts as a conflict. An empty `pixelmatch: {}` is ignored (treated as preset mode).

```js
// Service — direct pixelmatch mode (no ignore* keys)
compareOptions: {
    pixelmatch: {
        threshold: 0.063,
        includeAA: true,
    },
}

// Method level
await browser.checkScreen('tag', {
    pixelmatch: { threshold: 0.05 },
})
```

Combining both throws at service init or at compare time (when service and method options merge):

```js
// INVALID — throws even though ignoreLess is false
compareOptions: {
    ignoreLess: false,
    pixelmatch: { threshold: 0.063 },
}
```

### Available `pixelmatch` options

| Option | Notes |
|---|---|
| `threshold` | Sensitivity 0–1; lower = stricter. Default `0.1` in direct mode. |
| `includeAA` | `true` = strict (AA counts); `false` = forgive AA. Default `false`. |
| `diffColor` | `[R,G,B]` mismatch highlight. Default magenta. |
| `aaColor` | `[R,G,B]` AA highlight. Default magenta. |
| `diffColorAlt` | `[R,G,B]` added vs removed regions. |
| `alpha` | Diff blend opacity — **not** the same as `ignoreAlpha`. Default `0.1`. |
| `diffMask` | When `true`, use pixelmatch diff output directly. Default `false`. |
| `checkerboard` | Semi-transparent compositing. Default `true`. |
