---
"@wdio/image-comparison-core": minor
"@wdio/visual-service": minor
---

fix: ignore* option parity with resemble (pixelmatch)

After v10 switched to pixelmatch, the public `ignore*` API did not fully match resemble.js preset behaviour. Combined modes such as `ignoreLess` with the default `ignoreAntialiasing: true` still inherited AA forgiveness, and `ignoreColors` used BT.601 grayscale instead of resemble brightness-only comparison.

This release also adds `compareOptions.pixelmatch` so you can pass pixelmatch settings directly instead of using `ignore*` presets.

**What changed**

- Multiple `ignore*` flags now follow resemble last-wins ordering (`ignoreAlpha` → `ignoreAntialiasing` → `ignoreColors` → `ignoreLess` → `ignoreNothing`) instead of composing independently
- `ignoreLess`, `ignoreAlpha`, `ignoreColors`, and `ignoreNothing` now apply their own threshold and AA rules when active; they no longer inherit default `ignoreAntialiasing: true` forgiveness
- `ignoreColors` now compares brightness only using resemble luma weights (`0.3/0.59/0.11`), matching resemble v9 behaviour
- WDIO logs a warning when multiple `ignore*` flags are enabled, naming which preset wins
- New `compareOptions.pixelmatch` object for direct pixelmatch control (`threshold`, `includeAA`, `diffColor`, `aaColor`, `diffColorAlt`, `alpha`, `diffMask`, `checkerboard`)

**Preset reference**

| Active preset | threshold | AA forgiven |
|---|---|---|
| `ignoreNothing` | 0 | no |
| `ignoreLess` | ~16/255 | no |
| `ignoreColors` | ~16/255 | no (brightness only) |
| `ignoreAlpha` | ~16/255 | no |
| `ignoreAntialiasing` (default) | ~32/255 | yes |

**Using `compareOptions.pixelmatch`**

Set it in your service config or on a single `check*` call. Do not put `ignore*` keys and `pixelmatch` on the same options object; that throws, even when an `ignore*` flag is `false`. Service config and method options are separate objects, so a method call can override the service compare mode for that check (a warning is logged when the mode switches).

Service config:

```js
// wdio.conf.js
services: [
  ['visual', {
    compareOptions: {
      pixelmatch: {
        threshold: 0.063,
        includeAA: true,
      },
    },
  }],
]
```

Method override when the service uses `ignore*` presets:

```js
await browser.checkScreen('homepage', {
  pixelmatch: { threshold: 0.05 },
})
```

Method override when the service uses `pixelmatch`:

```js
await browser.checkScreen('homepage', {
  ignoreLess: true,
})
```

Invalid (throws):

```js
compareOptions: {
  ignoreLess: false,
  pixelmatch: { threshold: 0.063 },
}
```

See [pixelmatch](https://github.com/mapbox/pixelmatch) for option details.

**What you need to do**

- No change needed if you use a single `ignore*` flag or rely on defaults (`ignoreAntialiasing: true`)
- Set `ignoreAntialiasing: false` when anti-aliased pixels should count as differences
- If you combine multiple `ignore*` flags, review your tests; last-wins ordering now matches resemble v9
- If you use `ignoreColors`, results may differ slightly from early v10 but align with resemble v9
- To tune pixelmatch directly, add `compareOptions.pixelmatch` in your service config or pass `pixelmatch` on individual `check*` calls
