# ignore-options golden fixtures

PNG pairs documenting expected pixelmatch outcomes for each `ignore*` mode after v10 parity work.

| Fixture pair | Scenario | Expected pass | Expected fail |
|---|---|---|---|
| `aa-edge-noise-*` | Vertical edge with a single AA column (`170,170,170`) vs hard black/white boundary | `ignoreAntialiasing` | strict (no ignore flags) |
| `font-size-plus-one-*` | 10×12 vs 11×12 black glyph block on white | — | all ignore modes |
| `color-only-diff-*` | `(180,60,60)` vs `(96,96,96)` — same resemble luma | `ignoreColors` | strict |
| `alpha-only-diff-*` | Identical RGB; center pixel alpha `255` vs `120` | `ignoreAlpha` | strict |
| `within-rgb-tolerance-*` | `(100,100,100)` vs `(114,100,100)` — 14/255 channel delta | `ignoreLess` | `ignoreNothing` |

Regenerate PNGs by running the calibration script in this folder (requires `pnpm --filter @wdio/image-comparison-core build` first):

```bash
node packages/image-comparison-core/tests/fixtures/ignore-options/calibrate.mjs
```
