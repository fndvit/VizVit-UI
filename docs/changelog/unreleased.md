# Unreleased

What is on `main` and not yet in a tagged version. When it ships, this page is
renamed to its version and a new, empty one takes its place — see
[all releases](./index.md).

[Compare against the last release on GitHub](https://github.com/fndvit/VizVit-UI/compare/v0.32.2...main)

## Added

- **`PersonFigure`** (`./primitives`) — a person as a stick figure: the
  digital-gap survey's body paths (three arm poses, six leg poses) under a head
  that is a cut-out photo sat on the neck, a portrait masked into a circle, or,
  with no photo, a drawn outline. Beside it the name and role over a rule joined
  to the shoulder by a diagonal callout, on either side and at the head's or
  the legs' height; a bio reveals on hover, keyboard focus or tap. The drawing
  is decorative — the name is the text. `ArmsPose`, `LegsPose` and `HeadShape`
  are exported closed sets, like `IconName`.
- Figure tokens: `--vit-figure-width`, `--vit-figure-ink`,
  `--vit-figure-stroke`, `--vit-figure-callout-ink`, `--vit-figure-name-size`,
  `--vit-figure-role-size`, `--vit-figure-bio-width`.

## Other

- Storybook serves `static/`, and `static/images/placeholders/` gains the
  `portrait.svg` the fixtures had always pointed at and a `cutout.svg` for the
  figure — the card stories showed the placeholder box before this.
