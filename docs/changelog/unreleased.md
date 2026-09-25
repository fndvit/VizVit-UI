# Unreleased

What is on `main` and not yet in a tagged version. When it ships, this page is
renamed to its version and a new, empty one takes its place — see
[all releases](./index.md).

[Compare against the last release on GitHub](https://github.com/fndvit/VizVit-UI/compare/v0.31.0...main)

## Added

- **`@vit-foundation/ui/madlib`** — a sentence with blanks, each blank a level
  of a tree, the value the path of chosen ids. Extracted from the NatGeo
  explore globe's sentence selector, where the component, the tree helpers and
  a bespoke inline dropdown had grown together in one file with the domain's
  tree; the helpers were tested there, the path rebuild inside the component
  was not.
  - `<Madlib>` renders one control per level and hands back the next full
    path on every pick. A `controls` prop renders a level as a `toggle` (its
    options listed in the text, the active one underlined) instead of a
    dropdown; `onopen` lets a host that cycles through sentences stop when the
    reader takes over; `bind:contentWidth` reports the widest rendered line.
  - `<InlineSelect>` — the blank on its own: a select that reads as a word in
    running text, with a listbox below it.
  - `walkTree`, `completePath`, `defaultPath`, `replaceAt`, `leafPaths` — the
    path arithmetic, pure and tested. `replaceAt` is the rule the component
    used to keep to itself: changing one level keeps every deeper choice that
    is still valid and resets the rest.
- Madlib tokens: `--vit-madlib-font`, `-color`, `-weight`, `-control-weight`,
  `-lead-size`, `-lead-line-height`, `-size`, `-line-height`, `-muted-color`,
  `-accent`, `-select-accent`, `-menu-bg`, `-menu-hover`, `-menu-shadow`,
  `-menu-max-height`, `-menu-z`.
