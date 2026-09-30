# Chrome

`import { … } from '@vit-foundation/ui/chrome'` — the shell and the
header/footer pair. All read `UiConfig` for site name, messages, locale and
current URL.

## PageShell

The chrome every page shares: content column, vertical rhythm, and the
document head (title composed as `title — siteName`, og:title/og:type, and
the meta description when given).

| Prop           | Type                                                                            | Notes                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`        | `string`                                                                        | browser title; `''` renders the site name alone                                                                                                     |
| `description?` | `string`                                                                        | meta + og description                                                                                                                               |
| `variant?`     | `'content' \| 'wide' \| 'full' \| 'article' \| 'reading' \| 'chrome' \| 'form'` | named page shapes (`full` is edge to edge with no gutter, for the home splash); the editorial variants render an `<article>` and say so to crawlers |
| `children`     | `Snippet`                                                                       |                                                                                                                                                     |

## SplashHero

The landing splash, one screen tall (the viewport minus
`--vit-splash-offset`, the nav's height): a `TileMosaic` across all of it —
a cluster of tiles left of centre thinning towards the edges, no tile under
any text (the label's, the mark's and the tagline's boxes are measured after
mount and on resize, and the mosaic clears the cells they touch) — the
`BrandMark` right of centre (decorative), the title as a vertical label down
the left wrapping into a few lines — the page's `<h1>` — the tagline lower
left in navy, and the `hero_scrollHint` mouse hint at the bottom edge, whose bounce
stops under reduced motion. Title and tagline render `**runs**` as
`<strong>`, raw while a caret is in them. On a phone the same pieces stack.
It ARRIVES: the tiles travel to their places in waves from the cluster, then
the label, the mark stroke by stroke (each unseen until its turn), the
tagline and last the hint rise in
— pure CSS from the server's markup, none of it under reduced motion.
As it scrolls away the mosaic lags behind the text (a parallax) and the
scroll hint fades, driven by `--vit-splash-progress`, which the component
sets from the scroll position. The one component in the library that sizes its
own `h1`. Props: `title`,
`tagline`, `titleEdit?`, `taglineEdit?` (`EditDescriptor`s), `seed?` (which
mosaic). Render it through `PageShell variant="full"` so nothing sits between
the nav and it.

## Nav

Always at the top (`position: sticky`); the page scrolls under it, and its
height is what `--vit-splash-offset` names. The logo is the `BrandMark` (3rem
wide); the site name stays in the home link, visually hidden, so the link
keeps its text.

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

The foot of every page on the brand's wine: the `BrandMark` in white with the
foundation's name beside it (`footer_name`, its `**runs**` bold), the site's
pages as a column at the right — Home (`nav_home`) first, then the same
`links: SiteLink[]` as Nav (derive both from one source so they can't
drift), the current page in bold (`url?`, else the config's) — and the
rights line under.
