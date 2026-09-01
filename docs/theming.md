# Theming

## tokens.css

All component styling resolves through CSS custom properties declared on
`:root` in `@vit-foundation/ui/tokens.css`. Override any of them after the
import to restyle the whole set.

| Group          | Tokens                                                                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Brand hues     | `--color-brand`, `--color-brand-light`, `--color-navy`, `--color-orange`, `--color-magenta`, `--color-cream`, `--color-band-grey` |
| Ink & surfaces | `--color-ink`, `--color-ink-secondary`, `--color-ink-muted`, `--color-hairline`, `--color-axis`, `--color-surface`                |
| Dataviz series | `--series-1` … `--series-8` — validated palette, fixed slot order (slot 1 is brand teal; `--series-8` doubles as the error hue)   |
| Typography     | `--font-sans`, `--text-sm/base/lg/xl/2xl/hero`, `--leading-tight`, `--leading-body`                                               |
| Spacing        | `--space-1` … `--space-6`                                                                                                         |
| Shape & layout | `--radius`, `--radius-lg`, `--content-max`                                                                                        |
| Motion         | `--transition-fast`                                                                                                               |

## base.css

Utility classes the components rely on, plus the edit-mode affordance:

- `.visually-hidden` — screen-reader-only content
- `.band` / `.band-bar` — centered page bands (content width + padding)
- `.control` — the shared form-control border/radius/background skin
- `.form-stack` / `.actions` / `.divider` / `.subsection-heading` — form and
  section rhythm
- `[data-vit-editing]` (+ `='saving'`, `='error'`) — the inline-edit outline;
  global because the editable element is rendered by the consuming
  component's own markup, which scoped styles cannot reach

An app whose global stylesheet already defines these classes (the foundation
website) can keep its copies and skip base.css — the declarations here are
the canonical spellings of the same rules.
