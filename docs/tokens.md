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

| Token                   | Website value | Role                                                 |
| ----------------------- | ------------- | ---------------------------------------------------- |
| `--color-brand`         | `#0899b1`     | brand fill: buttons, active states, edit affordances |
| `--color-brand-light`   | `#5ac7d2`     | brand tint                                           |
| `--color-navy`          | `#1f2a5e`     | secondary brand: hovers, navy buttons, admin rail    |
| `--color-orange`        | `#eb6834`     | accent (reserved)                                    |
| `--color-magenta`       | `#e87ba4`     | accent                                               |
| `--color-cream`         | `#f6f1e7`     | warm band background, decor shapes                   |
| `--color-band-grey`     | `#ececec`     | neutral band background                              |
| `--color-ink`           | `#101418`     | primary text; overlay backdrops derive from it       |
| `--color-ink-secondary` | `#475259`     | secondary text                                       |
| `--color-ink-muted`     | `#7d868c`     | muted text, placeholders                             |
| `--color-hairline`      | `#e3e7e9`     | separators                                           |
| `--color-axis`          | `#c5cbcf`     | form-control borders (`.control`)                    |
| `--color-surface`       | `#ffffff`     | cards, dialogs, button label on fills                |

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

## Not part of the contract

`--milestone-color` is set inline by `Timeline`/`TimelineMilestone` from the
category → `--series-N` map; themes never define it directly.
