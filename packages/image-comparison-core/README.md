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
| *(none, `ignoreAntialiasing: false`)* | - | ~16/255 (`0.063`) | no |
| `ignoreAntialiasing` | - | ~32/255 (`0.13`) | yes |
| `ignoreLess` | - | ~16/255 (`0.063`) | no |
| `ignoreAlpha` | alpha → opaque | ~16/255 (`0.063`) | no |
| `ignoreColors` | resemble luma grayscale | ~16/255 (`0.063`) | no |
| `ignoreNothing` | - | `0` | no |

Thresholds are calibrated to resemble outcomes; the underlying algorithm is YIQ perceptual distance, not resemble's RGB math.

### Last-wins semantics

When multiple `ignore*` flags are enabled, the active preset is the **last** one in this order (matching resemble.js):

`alpha` → `antialiasing` → `colors` → `less` → `nothing`

Example: `ignoreLess: true` with the default `ignoreAntialiasing: true` resolves to the `ignoreLess` preset (strict AA, not forgiving).

Golden fixture tests documenting expected pass/fail behaviour live in [`tests/fixtures/ignore-options/`](./tests/fixtures/ignore-options/).

Comparison uses [pixelmatch](https://github.com/mapbox/pixelmatch).
