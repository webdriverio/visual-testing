---
"@wdio/image-comparison-core": patch
---

refactor: skip ignored regions with pixelmatch's `ignoreMask`

Ignored regions (ignored elements and block-outs) are now skipped by pixelmatch itself instead of being painted black in both images before the comparison. The baseline, actual and diff files do not change, and the diff image still shows the ignored regions in green. The pixels next to an ignored region are now compared with their real neighbours: with `ignoreAntialiasing`, the anti-aliasing detection at the edge of an ignored region can give a slightly different count (for example 15 more pixels out of 61 208 on a real screenshot).
