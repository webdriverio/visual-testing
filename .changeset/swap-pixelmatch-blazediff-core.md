---
"@wdio/image-comparison-core": patch
"@wdio/visual-service": patch
---

perf: compare images with `@blazediff/core/pixelmatch` instead of `pixelmatch`

`@blazediff/core/pixelmatch` is a drop-in replacement for pixelmatch 8.0.0. It gives the same mismatch counts and the same diff image bytes, with OKLab/HyAB, `checkerboard` and `ignoreMask`, and it compares images faster. Nothing changes for users: the options, the thresholds and the results stay the same.
