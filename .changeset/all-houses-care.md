---
"@wdio/image-comparison-core": major
"@wdio/visual-service": major
---

### 💥 Breaking change: new image comparison engine

We replaced the engine that powers every visual comparison. This is a breaking change, so please read the migration note below before upgrading.

**The problem**

Visual tests were flaky. Tests failed on differences that are impossible to see by eye, like sub-pixel font rendering, 1px anti-aliasing on edges and small shadow shifts between runs. The old engine (resemble.js) compared raw RGB values, which does not match how human vision works, and on larger screenshots it quietly skipped about a third of the pixels. So you got failures that were not real, and in some cases real changes that could slip through.

On top of that, all the image handling (decode, crop, composite, rotate, resize) ran through [`jimp`](https://github.com/jimp-dev/jimp), a large dependency that we only used a small slice of and that is no longer actively maintained.

**The solution**

Two things changed under the hood:

1. The comparison engine is now [pixelmatch](https://github.com/mapbox/pixelmatch). It compares images the way the eye perceives them (in the YIQ colour space) and detects anti-aliasing by checking both images at once. Invisible rendering noise now passes, and real regressions still fail.
2. `jimp` has been removed completely. PNG decode and encode now go through the small [`fast-png`](https://github.com/image-js/fast-png) library, and the handful of image operations we still need (crop, composite, canvas, opacity, rotate, resize) live in a tiny internal helper. The bundled resemble file is gone too. The net effect is a much lighter dependency footprint with no loss in functionality.

**What you need to do**

- Your public API does not change. `checkScreen`, `checkElement`, `checkFullPageScreen` and the matchers all work exactly as before, and the same `ignore` options are supported.
- Because the new engine measures differences differently, mismatch percentages will not match the old numbers exactly. You should re-run your suite once and re-accept your baselines so they are generated with the new engine. After that your tests should be noticeably more stable.

**Also fixed in this release**

- **Top-row artifact on full page screenshots:** Jimp's `contain()` centred the image, shifting content by 1px and creating a false diff across the top row. Replaced with buffer-level padding that anchors content at (0,0).
- **Ignored region 1px under-coverage:** The device-pixel size of an ignored region used `Math.floor`, which could drop a pixel when `cssSize * DPR` had a fractional part. Width and height now use `Math.ceil` so the full element is always covered. Position still uses `Math.floor`.
- **Comparison sensitivity matches what you were used to:** Switching engines meant retuning how strict a comparison is. The pixelmatch threshold is now aligned with the old resemble tolerances, so a difference that used to fail still fails and one that used to pass still passes. The diff highlight also uses a single consistent colour instead of varying per run.
- **Different image sizes no longer crash the comparison:** When a baseline and the actual screenshot had slightly different dimensions, the old flow threw an error and you lost the result. Both images are now normalised to the same size before they are compared, so a size change is reported as a visual difference you can review instead of a hard failure.
- **More reliable ignore regions with WebDriver BiDi:** With BiDi the calculated element bounds can be off by a pixel or two, which sometimes left part of an ignored element just outside the ignored area and caused a false diff. The BiDi emulated flow now uses a larger `ignoreRegionPadding` so the whole element stays covered.

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
