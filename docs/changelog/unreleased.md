# Unreleased

What is on `main` and not yet in a tagged version. When it ships, this page is
renamed to its version and a new, empty one takes its place — see
[all releases](./index.md).

[Compare against the last release on GitHub](https://github.com/fndvit/VizVit-UI/compare/v0.35.0...main)

## Fixed

- **An empty inline-editable block shows a placeholder in edit mode.** A block
  with no text — a page-copy row a CMS has not written yet — rendered as an
  empty `h1` or `p` with nothing to see or point at, so an editor could not
  find it, let alone fill it in. `Editable` now marks such a block with
  `data-vit-empty`, and `base.css` prints the placeholder in its place
  (`::before`, italic and faded, inside a faint ring). The placeholder is not
  in the node's text, so it never reaches a draft, and it disappears with the
  first keystroke. It only appears in edit mode; a read-only render is
  unchanged.

## Added

- `EditMessages.edit_emptyPlaceholder` — the placeholder's wording, «Buit —
  clica per escriure» by default. A host that overrides `editMessages`
  supplies it alongside the others.
