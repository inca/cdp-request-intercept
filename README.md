This is a test for reproducing [Devtools network interception does not work on mac with --user-data-dir](https://bugs.chromium.org/p/chromium/issues/detail?id=752010#c12).

Note: only Mac OS X is affected

Usage:

- Install Chrome Version 62.0.3178.0 (Official Build) canary (64-bit)
- `npm i`
- `node .`
- if necessary amend the `chromePath`
- Observe request interception not working (only `Navigated` is displayed on console)
- Now comment out the `--user-data-dir` flag and run again
- Observe expected behavior (all intercepted requests are displayed)
