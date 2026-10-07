---
"@wdio/image-comparison-core": patch
---

fix: find an ignore element again only when its reference is stale

Before, the region of each `ignore` element was read with `browser.execute(script, element)`, and every element was first found again with `$$` (one query for each selector and scope), even when its reference was still valid. Now the region is read with the element command `element.execute(script)`. When the browser says that the reference is stale (for example after a DOM change by the `beforeScreenshot` style injection), WebdriverIO finds the element again with its full chain (parent, index of a `$$` list, browsing context) and runs the script again. This removes the extra queries, and an element is found again in the same way as for all other WebdriverIO element commands.
