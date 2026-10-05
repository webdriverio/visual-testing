---
"@wdio/visual-service": patch
---

fix: the element commands and `toMatchElementSnapshot` in a multiremote session (#1238)

In a multiremote session, `checkElement`, `saveElement` and `toMatchElementSnapshot` failed. They now work with WebdriverIO v9 and v10.

- `toMatchElementSnapshot` on a multiremote element (`expect(multiRemoteBrowser.$('#el')).toMatchElementSnapshot('tag')`) compares the element on each instance and gives the result of each instance, as `toMatchScreenSnapshot` does on the multiremote browser. Before, it failed with `The visual service did not add the "checkElement" command to this session`.
- `checkElement` and `saveElement` on an instance (`multiRemoteBrowser.getInstance('chrome').checkElement(element, 'tag')`), and `toMatchElementSnapshot` on the element of an instance, run on that instance only. Before, the command also ran on the other instances with the element of this instance, and failed with `no such node`.
- `multiRemoteBrowser.checkElement()` and `multiRemoteBrowser.saveElement()` with a multiremote element give the element of each instance to the command of that instance. Before, they failed with `Unsupported type: function`. The types of these two commands now accept a multiremote element.
