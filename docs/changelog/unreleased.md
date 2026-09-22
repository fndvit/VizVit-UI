# Unreleased

What is on `main` and not yet in a tagged version. When it ships, this page is
renamed to its version and a new, empty one takes its place — see
[all releases](./index.md).

[Compare against the last release on GitHub](https://github.com/fndvit/VizVit-UI/compare/v0.30.0...main)

## Added

- **`@vit-foundation/ui/overlay`** — where a floating card goes, and the chrome
  it is drawn in.
  - `anchor(point, card, container, options)` places a card beside a point and
    clamps it inside its container on **both** axes, with optional flipping to
    the other side. "Put a tooltip next to the pointer without letting it leave
    the viewport" was being re-derived per call site and tested nowhere, because
    it could only run inside a live layout; one copy clamped horizontally and
    not vertically, so its card walked off the bottom of a short viewport.
  - `<HoverCard>` — the card shell and its shimmer skeleton, themed with
    `--vit-card-*` custom properties.
- Overlay tokens: `--vit-card-width`, `--vit-card-padding`, `--vit-card-gap`,
  `--vit-card-bg`, `--vit-card-radius`, `--vit-card-shadow`, `--vit-card-font`,
  `--vit-card-shimmer-color`.
