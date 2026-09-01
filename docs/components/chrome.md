# Chrome

`import { … } from '@vit-foundation/ui/chrome'` — the shell and the
header/footer pair. All read `UiConfig` for site name, messages, locale and
current URL.

## PageShell

The chrome every page shares: content column, vertical rhythm, and the
document head (title composed as `title — siteName`, og:title/og:type, and
the meta description when given).

| Prop           | Type                                                                  | Notes                                                                                  |
| -------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `title`        | `string`                                                              | browser title; `''` renders the site name alone                                        |
| `description?` | `string`                                                              | meta + og description                                                                  |
| `variant?`     | `'content' \| 'wide' \| 'article' \| 'reading' \| 'chrome' \| 'form'` | named page shapes; the editorial variants render an `<article>` and say so to crawlers |
| `children`     | `Snippet`                                                             |                                                                                        |

## Nav

Site header: wordmark, primary links with current-section highlighting
(prefix-matched through `UiConfig.canonicalPathname`, so locale prefixes
don't break it), optional account entry, locale switcher, and a mobile
disclosure that closes on navigation and Escape.

| Prop       | Type                      | Notes                                                                                          |
| ---------- | ------------------------- | ---------------------------------------------------------------------------------------------- |
| `links`    | `SiteLink[]`              | **required** — the app owns its route list; derive labels reactively so they follow the locale |
| `account?` | `{ displayName } \| null` | renders an /account menu item                                                                  |
| `url?`     | `URL`                     | highlighting source; defaults to `UiConfig.url()` (tests and stories pass one)                 |

## Footer

Wordmark, the same `links: SiteLink[]` as Nav (derive both from one source so
they can't drift), and the rights line.
