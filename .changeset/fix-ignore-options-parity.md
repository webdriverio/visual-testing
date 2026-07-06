---
"@wdio/image-comparison-core": patch
"@wdio/visual-service": patch
---

fix: ignore* option parity with resemble (pixelmatch)

After v10 switched to pixelmatch, the public `ignore*` API did not fully match resemble.js preset behaviour. Combined modes such as `ignoreLess` with the default `ignoreAntialiasing: true` still inherited AA forgiveness, and `ignoreColors` used BT.601 grayscale instead of resemble brightness-only comparison.

**What changed**

- Multiple `ignore*` flags now follow resemble last-wins ordering (`ignoreAlpha` → `ignoreAntialiasing` → `ignoreColors` → `ignoreLess` → `ignoreNothing`) instead of composing independently
- `ignoreLess`, `ignoreAlpha`, `ignoreColors`, and `ignoreNothing` now apply their own threshold and AA rules when active — they no longer inherit default `ignoreAntialiasing: true` forgiveness
- `ignoreColors` now compares brightness only using resemble luma weights (`0.3/0.59/0.11`), matching resemble v9 behaviour
- Added golden fixture parity tests for all ignore modes
- JSDoc and README document preset mapping, last-wins semantics, and default vs resemble v9
- Logs a WDIO warning when multiple `ignore*` flags are enabled, naming which option wins

**Preset reference**

| Active preset | threshold | AA forgiven |
|---|---|---|
| `ignoreNothing` | 0 | no |
| `ignoreLess` | ~16/255 | no |
| `ignoreColors` | ~16/255 | no (brightness only) |
| `ignoreAlpha` | ~16/255 | no |
| `ignoreAntialiasing` (default) | ~32/255 | yes |

**Migration**

- No action needed if you use a single ignore flag or rely on defaults (`ignoreAntialiasing: true`), behaviour is unchanged for typical users
- Set `ignoreAntialiasing: false` when you need strict comparison where anti-aliased pixels count as differences
- Multi-flag combos now match resemble v9 last-wins behaviour; review tests if you combine ignore flags
- `ignoreColors` results may differ slightly from v10 but align with resemble v9

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
