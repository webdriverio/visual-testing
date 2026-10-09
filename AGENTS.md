# AGENTS.md

This is the agent entry point for the WebdriverIO visual-testing monorepo.
Humans should start with [CONTRIBUTING.md](CONTRIBUTING.md). Agents should read
this file first, then the skill that matches the task.

Do not copy policy into tool-specific files. Cursor, Claude Code, Copilot, and
Codex should follow this document. Tool adapters (for example
[CLAUDE.md](CLAUDE.md)) stay thin and point here.

## Repo map

pnpm workspace. Source lives in `packages/*/src`. Other packages, the e2e tests
and the published packages use the compiled `packages/*/dist`.

```
packages/image-comparison-core  screenshots, stitching and comparison engine (pixelmatch)
packages/visual-service         @wdio/visual-service: save*/check* commands, matchers, Storybook runner
packages/ocr-service            @wdio/ocr-service: OCR commands (tesseract.js or a system tesseract)
packages/visual-reporter        @wdio/visual-reporter: Remix app + CLI that shows compare results
tests/specs                     e2e specs (WebdriverIO)
tests/configs                   wdio configs: local browsers, local Appium, LambdaTest, Sauce Labs
tests/fixtures                  local pages for the v10 specs
tests/lambdaTestBaseline        committed baselines of the LambdaTest runs
tests/sauceLabsBaseline         committed baselines of the Sauce Labs runs
apps/                           mobile apps for the app tests
patches/                        pnpm patches (see pnpm-workspace.yaml)
.changeset/                     changesets; `main` is in prerelease mode (`next`)
.github/workflows               checks, e2e, scheduled-tests, release, ...
```

## Setup

Use the Node version in [`.nvmrc`](.nvmrc) (currently 24) and the pnpm version
pinned in `package.json#packageManager` (pnpm 11, through Corepack). Do not
switch the package manager.

```sh
corepack enable
pnpm install
pnpm build              # compile all packages to packages/*/dist
```

Cloud / Codespaces agents: run [`.agents/setup`](.agents/setup) once, then
[`.agents/resume`](.agents/resume) to confirm the toolchain before editing.

Edits to `src/` are invisible to the e2e tests and to the other packages until
the build runs again: `pnpm build`, or `pnpm watch` while you work.

pnpm 11 refuses packages that are less than 1 day old (`minimumReleaseAge`).
Do not add an exception unless a release is blocked, and remove it when it is
not needed any more.

## Do not hand-edit

| Path | Owner |
|------|-------|
| `packages/*/dist` | `pnpm build` |
| `packages/*/CHANGELOG.md` | the release process (changesets) |
| `.changeset/pre/`, `.changeset/pre.json` | the release process |
| `pnpm-lock.yaml` | `pnpm install` |
| `tests/lambdaTestBaseline/**`, `tests/sauceLabsBaseline/**` | CI runs, see [visual-testing-baselines](.agents/skills/visual-testing-baselines/SKILL.md) |
| `**/__snapshots__/**` | `vitest -u`, after you checked the new output |

## Test selection

Prefer the smallest proof that covers the change. `pnpm test` runs lint, types
and all unit tests; use it before you push, not as the first check.

The table is the regression check. It is not proof that a feature works the
way a user runs it. Before you report a feature or bug fix as done, follow
[verify-visual-testing](.agents/skills/verify-visual-testing/SKILL.md).

| Change | Minimum local proof |
|--------|---------------------|
| One file in a package | `pnpm exec vitest run <path>.test.ts` |
| Types or public options | the unit tests and `pnpm run test:types` |
| Style | `pnpm run test:lint` |
| Web commands, screenshots, compare logic (`image-comparison-core`, `visual-service`) | `pnpm build`, then the local Chrome suites: `pnpm test.local.chrome.v10`, `pnpm test.local.chrome.v10.jasmine`, `pnpm test.local.chrome.v10.emulation`, `pnpm test.local.desktop.multi` |
| Desktop specs (`tests/specs/basics`, `desktop*`, `matcher`, folders) | `BASELINE_SETUP=true pnpm test.local.desktop`, then `pnpm test.local.desktop` |
| OCR (`ocr-service`) | the unit tests and `pnpm test.ocr.local.desktop` (a local page in `tests/fixtures/ocr` with a committed font, also runs in CI) |
| Mobile (Appium, native app or mobile web) | a local emulator or simulator suite (`test.local.emus.*`, `test.local.sims.*`), or a cloud run |
| A failure only in CI on Linux | the Docker recipe in [verify-visual-testing](.agents/skills/verify-visual-testing/SKILL.md) |
| Cloud configs or cloud baselines | a cloud run, see [verify-visual-testing](.agents/skills/verify-visual-testing/SKILL.md) |
| Workflows, root tooling | `pnpm test` and the CI run of the PR |

Unit tests live next to the source (`src/**/*.test.ts`) in
`image-comparison-core`, and in `tests/` in `visual-service` and `ocr-service`.
Mock the browser in unit tests; do not start a browser.

## CI

- [`checks`](.github/workflows/checks.yml): every PR (also from forks) and
  every push to `main` and to the maintenance branches. Lint, types and unit
  tests; the local headless Chrome suites (v10 Mocha, Jasmine, multi-remote,
  emulation) and the local desktop suite (setup run, then the real run).
- [`e2e`](.github/workflows/e2e.yml): the LambdaTest and Sauce Labs jobs. They
  need the cloud credentials, so they run only for branches in this
  repository, not for forks or Dependabot.
- [`scheduled-tests`](.github/workflows/scheduled-tests.yml): the same cloud
  jobs, on a schedule or by hand. For a PR from a fork, set the `branch` input
  to `refs/pull/<number>/head` — only after a maintainer reviewed and trusts
  the exact commit: the run gives the cloud credentials to that code. Never
  start it for a fork without that review.
- [`release`](.github/workflows/release.yml): manual, see
  [visual-testing-release](.agents/skills/visual-testing-release/SKILL.md).

## Baselines

- The local suites make their baselines in the same run. Never commit
  `localBaseline/` or `.tmp/`.
- The cloud runs compare with committed baselines. LambdaTest turns off
  `autoSaveBaseline` in CI, so a missing baseline fails. Sauce Labs leaves it
  on, so a new file name can pass by saving a baseline without a comparison.
- Add or update cloud baselines only from CI runs, and look at each image
  before the commit. See
  [visual-testing-baselines](.agents/skills/visual-testing-baselines/SKILL.md).

## Changesets and branches

- Every change that users of a package can see needs a changeset
  (`pnpm changeset`). Changes to tests, CI or docs of this repository only do
  not need one.
- Open PRs against `main`. A backport to `v10` or `v9` is a separate PR with
  its own changeset. See [CONTRIBUTING.md](CONTRIBUTING.md#branches-and-versions)
  and [visual-testing-release](.agents/skills/visual-testing-release/SKILL.md).

## Working agreement

- Inspect `git status -sb` before editing. Do not switch branches or rewrite
  history that another process is using.
- Keep PRs to one topic. Conventional Commits (`fix: ...`, `feat: ...`,
  `test: ...`, `ci: ...`, `chore: ...`).
- Stage only intended files. Do not commit `node_modules`, `dist`, `.tmp`,
  `localBaseline` or coverage output.
- Tests must fail on the original defect: check that the new test fails
  without the fix. Do not hide flakes with retries, longer timeouts, or weaker
  assertions — fix the cause.
- Do not add TypeScript `as` casts. Use type guards, `satisfies`, annotations
  or typed helpers. In unit tests, `mock<T>()` from `vitest-mock-extended` is
  fine.
- Verify user-facing work with
  [verify-visual-testing](.agents/skills/verify-visual-testing/SKILL.md) before
  claiming it is done. Record the command, the output, and the observable
  result.
- American English. Match existing code style; do not reformat unrelated files.

## Read when relevant

- **Contributor / GitHub process, branches, releases:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Service options and commands:** [packages/visual-service/README.md](packages/visual-service/README.md)
- **OCR service:** [packages/ocr-service/README.md](packages/ocr-service/README.md)
- **Verify a change:** [.agents/skills/verify-visual-testing/SKILL.md](.agents/skills/verify-visual-testing/SKILL.md)
- **Baselines:** [.agents/skills/visual-testing-baselines/SKILL.md](.agents/skills/visual-testing-baselines/SKILL.md)
- **Release and backports:** [.agents/skills/visual-testing-release/SKILL.md](.agents/skills/visual-testing-release/SKILL.md)

The skills set `metadata.internal: true` because they are for this repository
only. Leave that flag on.
