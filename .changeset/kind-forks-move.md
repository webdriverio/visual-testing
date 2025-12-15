---
"@wdio/image-comparison-core": minor
"@wdio/visual-service": minor
---

This PR will implement FR #1077 which is asking not to create the actual image on success. This should create a better performance because no files are writting to the system and should make sure that there's not a lot of noise in the actual folder.

# Committers: 1

-   Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
