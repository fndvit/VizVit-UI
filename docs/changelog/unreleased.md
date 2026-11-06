# Unreleased

What is on `main` and not yet in a tagged version. When it ships, this page is
renamed to its version and a new, empty one takes its place — see
[all releases](./index.md).

[Compare against the last release on GitHub](https://github.com/fndvit/VizVit-UI/compare/v0.35.1...main)

## Fixed

- **`CrossfadeVideo` plays in Safari and on iOS.** Each element lists its
  sources webm → "safe" mp4 → mp4, and the webm encodes are VP9 with an alpha
  channel. Apple's WebKit (Safari on a Mac, every browser on an iPhone or iPad)
  reports `video/webm` as playable, picks the webm, ignores its alpha channel
  (Safari 18 on a Mac paints the transparent area opaque white; older WebKit
  never plays the clip) and never falls back to the mp4s behind it. On that
  engine the component now leaves the webm `<source>` out and
  the element plays the "safe" (H.264, 4:2:0) mp4. There is no feature test
  for transparent VP9, so the engine comes from the user agent, read once the
  component is on the page: the server still renders every source, and a
  WebKit client rebuilds the elements without the webm right after mount. Other
  browsers are unchanged. Seen in Food for Tomorrow's big-number cards, where
  the illustration behind the glass card sat in a white box in Safari, its
  hard edge showing through the card and reading as the card's text
  overflowing (fndvit/natgeo-food-for-tomorrow#315); the "safe" mp4's baked
  background is the page colour, so it blends in.

## Added

- `isAppleWebKit(ua?)` in `src/lib/utils/webkit.ts` — the user-agent check
  behind the fix. Internal: not on any subpath.
