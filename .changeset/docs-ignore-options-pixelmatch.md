---
"@wdio/image-comparison-core": patch
"@wdio/visual-service": patch
---

docs: document ignore* options for pixelmatch engine

**What changed**

- JSDoc on each `ignore*` option in `base.interfaces.ts` and `options.interfaces.ts` with pixelmatch preset mapping
- README section: comparison table, last-wins semantics, default vs resemble v9
- Removed redundant `ignoreAntialiasing: true` from Sauce/Lambda e2e configs (matches v10 default)

**Migration**

- Documentation only; no behaviour change

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
