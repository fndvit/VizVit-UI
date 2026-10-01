# Token manifest

`tokens.css` carries the design tokens with the **foundation website's
values** on `:root`. It is one of two ways to theme the package:

1. **Take the website look**: `import '@vit-foundation/ui/tokens.css'` and
   override individual properties after it.
2. **Bring your own theme** (an admin tool, a differently-branded app): skip
   `tokens.css` entirely and define every property below on your own `:root`
   (or on a scoping wrapper element — all tokens are inherited custom
   properties). This table is the contract: a theme that defines all of them
   renders every component correctly.

`base.css` is independent of this choice and is always imported (or its
classes re-declared, as the website does — see the header of that file).

## Colors

| Token                                             | Website value                           | Role                                                                                                                                                                                                   |
| ------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--color-brand`                                   | `#e0005c`                               | brand fill: buttons, active states, edit affordances — the ViT mark's pink, deepened to read at AA                                                                                                     |
| `--color-brand-light`                             | `#ff80b5`                               | brand tint (the mark at half strength)                                                                                                                                                                 |
| `--color-navy`                                    | `#1f2a5e`                               | secondary brand: hovers, navy buttons, admin rail                                                                                                                                                      |
| `--color-orange`                                  | `#eb6834`                               | accent (reserved)                                                                                                                                                                                      |
| `--color-magenta`                                 | `#e87ba4`                               | accent                                                                                                                                                                                                 |
| `--color-cream`                                   | `#f6f1e7`                               | warm band background, decor shapes                                                                                                                                                                     |
| `--color-wine`                                    | `#9b2f5c`                               | the splash mosaic's fourth hue (`TileMosaic`)                                                                                                                                                          |
| `--vit-brand-mark`                                | `#ff006a`                               | the ViT mark's pink (`BrandMark`: nav logo, splash)                                                                                                                                                    |
| `--vit-splash-offset`                             | `3.75rem`                               | the nav's height, which `SplashHero` subtracts                                                                                                                                                         |
| `--vit-rail-top` / `-step` / `-stack` / `-bottom` | `4rem` / `2.5rem` / `1.5rem` / `5.5rem` | the timeline rail's geometry (`TimelineAreas`): CSS places the nodes by them, JS reads them                                                                                                            |
| (sheet) `site.css`                                | —                                       | the site's element rules (body text, page and section headings, images), scoped to `.vit-site`: the site puts the class on `<body>`, the CMS mirror on its wrapper — one owner, `:where()` specificity |
| `--color-plum`                                    | `#662542`                               | the design's plum under a tinted photo and the collage mask                                                                                                                                            |
| `--color-band-grey`                               | `#ececec`                               | neutral band background                                                                                                                                                                                |
| `--color-ink`                                     | `#101418`                               | primary text; overlay backdrops derive from it                                                                                                                                                         |
| `--color-ink-secondary`                           | `#475259`                               | secondary text                                                                                                                                                                                         |
| `--color-ink-muted`                               | `#7d868c`                               | muted text, placeholders                                                                                                                                                                               |
| `--color-hairline`                                | `#e3e7e9`                               | separators                                                                                                                                                                                             |
| `--color-axis`                                    | `#c5cbcf`                               | form-control borders (`.control`)                                                                                                                                                                      |
| `--color-surface`                                 | `#ffffff`                               | cards, dialogs, button label on fills                                                                                                                                                                  |

## Dataviz series

`--series-1` … `--series-8`, fixed slot order (1 = brand teal). `--series-8`
doubles as the **error hue** — form errors and `[data-vit-editing='error']`
read it, so every theme must define it even without charts.

## Typography

| Token                                                                                  | Website value                       |
| -------------------------------------------------------------------------------------- | ----------------------------------- |
| `--font-sans`                                                                          | system-ui stack                     |
| `--font-serif`                                                                         | `Georgia, 'Times New Roman', serif` |
| `--text-sm` / `--text-base` / `--text-lg` / `--text-xl` / `--text-2xl` / `--text-hero` | `0.875rem` … `clamp(…)`             |
| `--leading-tight` / `--leading-body`                                                   | `1.15` / `1.6`                      |

## Spacing, shape, layout

`--space-1` … `--space-6` (0.25rem … 4rem); `--radius` (8px, all buttons and
dialogs follow it — an admin theme wanting pills sets `999px` here);
`--radius-lg` (16px); `--content-max` (1200px).

## Elevation & layering

| Token         | Website value                     | Role                          |
| ------------- | --------------------------------- | ----------------------------- |
| `--shadow-1`  | `0 2px 10px rgb(16 20 24 / 10%)`  | raised chrome (admin rail)    |
| `--shadow-2`  | `0 12px 40px rgb(16 20 24 / 20%)` | overlays (dialogs, panels)    |
| `--z-raised`  | `10`                              | fixed chrome above content    |
| `--z-overlay` | `100`                             | floating editor/overlay layer |

## Motion

`--transition-fast` (`150ms ease`).

## Person figure

Read by `PersonFigure` (`./primitives`). Every one has a fallback in the
component, so a theme may omit them.

| Token                               | Website value      | Role                                                                                          |
| ----------------------------------- | ------------------ | --------------------------------------------------------------------------------------------- |
| `--vit-figure-width`                | `10rem`            | the drawing's width; body, callout run and rule follow                                        |
| `--vit-figure-ink`                  | `var(--color-ink)` | body stroke                                                                                   |
| `--vit-figure-stroke`               | `4`                | body stroke width in viewBox units (153 across)                                               |
| `--vit-figure-callout-ink`          | `var(--color-ink)` | the label's callout line and rule                                                             |
| `--vit-figure-name-size`            | `var(--text-base)` | the name                                                                                      |
| `--vit-figure-role-size`            | `var(--text-sm)`   | the role                                                                                      |
| `--vit-figure-bio-width`            | `14rem`            | the revealed bio's width                                                                      |
| `--vit-team-figure-base`            | `10rem`            | `TeamFigureField`: the width a member's size is a percent of                                  |
| `--vit-team-figure-offsets`         | `1`                | `TeamFigureField`: multiplier on members' vertical offsets (0 collapses them)                 |
| `--vit-team-figure-x` / `-y` / `-z` | `0`                | `TeamFigureField`: a figure's place on the canvas (‰ of its width) and layer — set per figure |
| `--vit-placement-handles`           | `none`             | `Placeable`: the handles' `display`; a canvas sets `flex` while it places by position         |
| `--vit-placement-touch`             | `auto`             | `Placeable`: `touch-action`; a canvas sets `none` so a finger drags instead of scrolling      |
| `--vit-placement-cursor`            | `auto`             | `Placeable`: the hover cursor; a canvas sets `grab`                                           |

## Not part of the contract

`--milestone-color` is set inline by `Timeline`/`TimelineMilestone` from the
category → `--series-N` map; themes never define it directly.
