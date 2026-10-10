---
"@wdio/image-comparison-core": patch
---

fix: a clear error, and no endless screenshots, for a mobile full page screenshot without a viewport height

The visual service measures the viewport of a mobile browser at the start of the session with a native tap. When this measurement failed (for example on a black emulator screen), the viewport height was 0, and a mobile full page screenshot then failed with "Negative scroll position detected (scrollY: -12)", or, with both shadow paddings set to 0, took screenshots without end. It now fails at once with an error that says that the viewport measurement failed. A viewport that is smaller than the shadow paddings also gets a clear error.
