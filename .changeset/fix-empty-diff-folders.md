---
"@wdio/image-comparison-core": patch
---

Stop creating empty diff folders when no visual differences exist. The diff directory is now only created on disk when a diff image is actually saved, instead of being eagerly created during path preparation. Fixes #879.

# Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
