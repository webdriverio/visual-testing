---
"@wdio/image-comparison-core": patch
"@wdio/visual-service": patch
---

fix: wire ignoreAntialiasing to pixelmatch AA forgiveness toggle

In v10 the pixelmatch engine always ran with anti-aliasing forgiveness enabled, even when `ignoreAntialiasing` was `false`. The option had no effect on comparison behaviour.

**What changed**

- `ignoreAntialiasing` now toggles pixelmatch's AA handling: `true` forgives anti-aliased pixels, `false` counts them as mismatches.
- The default is now `ignoreAntialiasing: true`, matching the forgiving pixelmatch behaviour users already get in v10.
- `ignoreLess` and `ignoreNothing` keep their own threshold behaviour; AA forgiveness is controlled independently via `ignoreAntialiasing`.

**Migration**

- No action needed if you rely on the current forgiving defaults, comparison behaviour stays the same.
- If you explicitly set `ignoreAntialiasing: true` today, that remains redundant but harmless.
- Set `ignoreAntialiasing: false` when you need strict comparison where anti-aliased pixels count as differences.

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
