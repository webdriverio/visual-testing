---
"@wdio/image-comparison-core": major
"@wdio/visual-service": major
---

feat: compare images with pixelmatch 8 (OKLab/HyAB color distance)

The comparison engine is now pixelmatch 8. It measures color differences in the OKLab color space with the HyAB distance instead of YIQ, which is closer to how people see colors: fewer false positives and fewer missed changes.

The threshold scale did not change (`0` to `1`, where `1` is black vs white), so the `ignore*` presets keep their values. But **mismatch percentages can differ a little** from v10 for the same images. On real screenshots the number of different pixels changed by about −3 % to +3 % (for a 1-pixel shift of a full page with `ignoreAntialiasing`: 0.002 % → 0.003 %). If a check depends on an exact mismatch percentage or a tight tolerance, check it again after the upgrade.
