---
name: visual-testing-release
description: >-
  Write changesets, release the packages and backport fixes to the maintenance
  branches of this repository (Changesets v3 in prerelease mode on `main`,
  `v10` and `v9` maintenance branches). Use when a change needs a changeset,
  when preparing a release, or when a fix must go to `v10` or `v9`.
metadata:
  internal: true
---

# Release and backports

Read [CONTRIBUTING.md](../../../CONTRIBUTING.md#branches-and-versions) first:
it has the branch table (`main`, `v10`, `v9`) and the npm tags.

## Changesets

- Add one with `pnpm changeset`, or write `.changeset/<short-name>.md` by hand:

  ```md
  ---
  "@wdio/visual-service": patch
  ---

  fix: one line that users can read in the changelog

  Optional details: what users saw before, what changes for them.
  ```

- Name every package whose published behavior changes. A fix in
  `@wdio/image-comparison-core` that users see through the service needs only
  the core package; the dependents get a patch bump from Changesets.
- `patch` for fixes, `minor` for new options or commands, `major` only after a
  maintainer agreed (on `main` the next major is in progress).
- No changeset for changes to tests, CI, docs of this repository, or
  development dependencies only.
- Do not edit `CHANGELOG.md` files.

## Prerelease mode on `main`

- `.changeset/pre.json` keeps `main` in prerelease mode with the tag `next`.
  A release from `main` publishes `-next.N` versions with the `next` npm tag.
- After a prerelease, Changesets v3 moves the used changesets to
  `.changeset/pre/`. They are used again for the final changelog. Edit or
  delete one there only when it no longer applies.
- The final major release exits this mode (`pnpm changeset pre exit`) — only
  when a maintainer decides it.

## Release

1. Run the [release workflow](../../../.github/workflows/release.yml) by hand on
   the branch to release (`main`, `v10` or `v9`). It opens a "Version
   Packages" PR.
2. Another WebdriverIO member reviews and approves it; merge it.
3. Run the release workflow again on the same branch. It publishes to npm
   with trusted publishing (OIDC), so no npm token is needed.

While `main` is in prerelease mode, use the `production` release type.

## Backports

- Backports are on request only. A backport is a separate PR against `v10`
  or `v9`, with its own changeset.
- Check that the fix applies: `v10` supports WebdriverIO v9 and v10, `v9`
  supports WebdriverIO v9 only.
- Run the same proof on the maintenance branch (see
  [verify-visual-testing](../verify-visual-testing/SKILL.md)).
