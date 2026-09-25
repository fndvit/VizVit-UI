# Unreleased

What is on `main` and not yet in a tagged version. When it ships, this page is
renamed to its version and a new, empty one takes its place — see
[all releases](./index.md).

[Compare against the last release on GitHub](https://github.com/fndvit/VizVit-UI/compare/v0.32.0...main)

## Fixed

- **`./madlib`** — the metrics now match the sentence selector this was
  extracted from: the inline select's underline sits directly under the text
  (it had a 0.1em gap), and the menu's spacing, the toggle's underline gap and
  the bar between toggle options are pixels rather than ems, so a 24px
  sentence gets the same 6px rows and 16px gutters as a 14px one instead of a
  roomier control.
