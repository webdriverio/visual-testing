---
name: verify-visual-testing
description: >-
  Prove a visual-testing change the way a user runs it: a local browser suite,
  a local emulator or simulator suite, the Linux Docker check for CI-only
  failures, or a cloud run on LambdaTest / Sauce Labs. Use after a feature or
  bug fix, before claiming the work works. A unit test is not this proof.
metadata:
  internal: true
---

# Verify visual-testing

A user runs `browser.checkScreen()` (or another command) in a WebdriverIO spec.
Prove the change by driving that same path. A passing unit test does not prove
it, and `pnpm test` is not the proof.

Always run `pnpm build` first: the e2e configs use `packages/*/dist`.

## Pick the harness

| The change affects | Drive | Not the proof |
|--------------------|-------|---------------|
| Web commands, screenshots, compare logic, matchers | The local Chrome suites: `pnpm test.local.chrome.v10` (Mocha), `.jasmine`, `.emulation`, `pnpm test.local.desktop.multi` | A unit test |
| The desktop specs (`basics`, `desktop*`, `matcher`, check/save folders) | `BASELINE_SETUP=true pnpm test.local.desktop`, then `pnpm test.local.desktop` | The real run without the setup run (the baselines are missing) |
| OCR | `pnpm test.ocr.local.desktop` (a local page with a committed font, also in `checks`), and the cloud OCR job for the website spec | A unit test with a mocked tesseract |
| Mobile web or native app | A local emulator or simulator suite (`test.local.emus.web`, `test.local.emus.app`, `test.local.sims.web`, `test.local.sims.app`, `test.local.multi.web.app`; the Android configs read `ANDROID_AVD` and `ANDROID_PLATFORM_VERSION`), or a cloud run. The `android emulator` workflow runs `test.local.emus.web` in CI | A desktop browser with mobile emulation |
| A failure that happens only in CI on Linux | The Docker check below | A macOS run |
| Cloud configs, cloud baselines, a device or OS version | A cloud run (below) | A local run |

Write a new spec in `tests/specs` and a config in `tests/configs` only when no
existing suite covers the path. Prefer local fixtures (`tests/fixtures`) or
`guinea-pig.webdriver.io` over external sites.

## Show that the test can fail

For a bug fix, run the new or changed test without the fix (for example in a
copy, or with the fix turned off for one run). It must fail. Then run it with
the fix. Report both results.

## Linux Docker check (CI-only failures)

GitHub runs the local suites on `ubuntu-latest`. To reproduce a Linux-only
failure on another OS, first commit your change (a work-in-progress commit is
fine): `git archive HEAD` copies only committed files, so an uncommitted fix or
a new test file would be missing and the container would test the old code.

```sh
W=/tmp/vt-linux && rm -rf $W && mkdir -p $W && git archive HEAD | tar -x -C $W
# in the copy only: Chrome runs as root in the container
#   add '--no-sandbox', '--disable-dev-shm-usage' to the Chrome args of the config you run
docker run --rm --platform linux/amd64 --shm-size=2g -v $W:/work -w /work \
  mcr.microsoft.com/playwright:v1.56.0-noble bash -c \
  'corepack enable && pnpm install --frozen-lockfile && pnpm build && pnpm test.local.chrome.v10'
```

- Do not mount the checkout itself: `node_modules` from macOS do not work in
  Linux.
- Use `--platform linux/amd64` on Apple Silicon: Chrome for Testing has no
  Linux arm64 build.
- The container has other fonts than the GitHub runner (the runner uses
  DejaVu Sans). Text layout (OCR, line wraps) can differ, so do not trust the
  container for font-dependent results.

## Cloud run (LambdaTest, Sauce Labs)

The `e2e` workflow runs the cloud jobs only for branches in this repository.

- **Branch in this repository:** open the PR; the `e2e` jobs run on every
  push. To run one job again, re-run only that job (GitHub allows it after the
  whole run ends).
- **PR from a fork, or any ref:** run the
  [`scheduled-tests`](../../../.github/workflows/scheduled-tests.yml) workflow
  by hand (`Use workflow from: main`) with the `branch` input set to
  `refs/pull/<number>/head`.
  **Security:** this run gives the cloud credentials to the code of that ref,
  so a test in it can read and send them. Do it only after a maintainer
  reviewed and trusts the exact commit. `refs/pull/<number>/head` moves when
  the author pushes again: check the commit in the log of the checkout step.
  An agent must never start this run for a fork on its own.
- LambdaTest and Sauce Labs limit parallel sessions. Other cloud runs at the
  same time make yours wait.
- Cloud devices can be in different states between sessions (for example the
  Android 15/16 display cutout state on LambdaTest). Run a job more than once
  before you trust a new baseline, see
  [visual-testing-baselines](../visual-testing-baselines/SKILL.md).

## Report

Record, in the PR or in your answer:

- the command and the config,
- the platform (macOS, Linux container, CI job name, cloud device),
- the output (passing / failing counts, mismatch percentages),
- the observable result (for example the file name, or the image you looked at).
