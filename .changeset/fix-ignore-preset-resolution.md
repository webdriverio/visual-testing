---
"@wdio/image-comparison-core": patch
"@wdio/visual-service": patch
---

fix: resolve ignore* presets with resemble last-wins semantics

After #1175, pixelmatch threshold and AA forgiveness were derived independently from each flag in the ignore list. Combined modes such as `ignoreLess` with the default `ignoreAntialiasing: true` still inherited AA forgiveness instead of following resemble's last-wins preset model.

**What changed**

- Added `resolveComparePreset` with resemble last-wins ordering matching `prepareIgnoreOptions`
- `ignoreLess`, `ignoreAlpha`, `ignoreColors`, and `ignoreNothing` now apply their own threshold and AA rules when active
- Default-only `ignoreAntialiasing: true` still uses the forgiving preset; explicit `ignoreAntialiasing: false` stays strict

**Migration**

- No action needed if you use a single ignore flag or rely on defaults
- Multi-flag combos now match resemble v9 last-wins behaviour; review tests if you combine ignore flags

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
