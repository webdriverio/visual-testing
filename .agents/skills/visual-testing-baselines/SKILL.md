---
name: visual-testing-baselines
description: >-
  Add, update or debug the baseline images of this repository's e2e tests:
  where each config keeps its baselines, how the file names are built, and how
  to collect new cloud baselines from CI and check them before the commit. Use
  when a visual e2e test fails with a mismatch or a missing baseline, or when a
  change needs new baselines.
metadata:
  internal: true
---

# Baselines

## Where the baselines are

| Configs | Baseline folder | Made by |
|---------|-----------------|---------|
| `wdio.local.chrome.v10*.conf.ts` | `.tmp/v10-e2e/**/baseline` | the same run (`autoSaveBaseline: true`, deleted in `onPrepare`) |
| `wdio.local.desktop.conf.ts` | `localBaseline/` (git-ignored) | a setup run: `BASELINE_SETUP=true pnpm test.local.desktop` |
| `wdio.local.*` Appium configs | `tests/localBaseline/` (git-ignored) | a first local run |
| `wdio.lambdatest.*` | `tests/lambdaTestBaseline/` (committed) | CI runs, see below |
| `wdio.saucelabs.*` | `tests/sauceLabsBaseline/` (committed) | CI runs, see below |

Never edit a baseline image by hand. Never commit `localBaseline/` or `.tmp/`.

## File names

`formatImageName` in the config builds the name, for example
`{tag}-{logName}-{width}x{height}`:

- `{tag}` is the first argument of the command. A spec can add data to it, for
  example the Android viewport tag `-vp426x848` in `mobile.web.spec.ts`.
- `{logName}` comes from `'wdio-ics:options'.logName` in the capability.
- `{width}x{height}` is the screen size on mobile, and the outer window size on
  desktop. A background tab or a change of the browser chrome can change it.

If a check saves a new baseline instead of comparing, the file name changed.
Compare the `fileName` of two runs (`returnAllCompareData: true`).

## autoSaveBaseline

- The local configs keep `autoSaveBaseline` on, so a first run makes the
  baselines.
- The LambdaTest configs set `autoSaveBaseline: !process.env.CI`: in CI a
  missing baseline fails. A new file name (new device, OS, viewport) must never
  pass without a comparison.
- A spec that checks something else than the image (for example the folder
  options in `checkMethodsFolders.spec.ts`) saves its own baseline first with
  the matching `save*` command.
- `logLevel` is `'silent'` in the shared config, so the "Autosaved" message of
  the service does not show in the CI logs.

## Add or update cloud baselines

The cloud baselines must come from the cloud, never from a local run.

1. Work on a branch in this repository (the cloud jobs need the credentials).
2. Add a **temporary** commit to the job in `.github/workflows/e2e.yml`: an
   upload step for the baseline folder with `if: always()`, and, if the job
   must save new baselines, a temporary way to turn on `autoSaveBaseline` for
   that run. Write "TEMPORARY, remove before merge" in the commit message.
3. Run the job at least **two** times (re-run only that job). Compare the two
   sets: they must be the same (a few pixels on rotated screenshots at most,
   below the tolerance of the check). If they differ, find the cause first
   (device state, test order, rotation) — a new baseline does not fix a flake.
4. Look at each new image: a complete page, no blank or black screen, no
   cookie banner, the expected device state.
5. Commit only the new or changed files, then revert the temporary commit.
6. A last CI run must pass with no temporary step.

For a small difference in one image (for example a stitched full page that
moved 1 pixel after a change of the test order), the failure artifact of a
matcher check has the actual image in `.tmp/actual/`. Use it only when two
runs gave the same actual image.

## Known device behavior

- LambdaTest Android 15/16 (Pixel 9 Pro) starts in one of two display states:
  edge-to-edge (viewport 426x848 / 952x322) or with the display cutout left out
  (426x823 / 903x322). The screen size is the same, so
  `mobile.web.spec.ts` adds the viewport at the start of the session to the
  Android tags, and each state has its own baselines.
- A rotation can change that state in the middle of a session, so the
  orientation change is the last test of `mobile.web.spec.ts`. Android 16
  skips it for now (see the skip rules in the spec).
