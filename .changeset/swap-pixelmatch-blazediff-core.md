---
"@wdio/image-comparison-core": patch
---

perf: swap pixelmatch for @blazediff/core in the golden-PNG comparison path

`@blazediff/core` is a drop-in replacement for pixelmatch: same call signature
(`img1, img2, output, width, height, options`), same options, and identical
diff output semantics. It produces the same pixel-diff results ~1.5x faster with
zero dependencies, so no comparison logic changes.
