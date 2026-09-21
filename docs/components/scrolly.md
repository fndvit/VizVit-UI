# Scrolly

`import { … } from '@vit-foundation/ui/scrolly'` — the scrollytelling
primitives: a scroller and its step ramp, a responsive crossfading video, step
dots, and a frosted panel. Domain-free, and themed with CSS custom properties
rather than utility classes, so a consumer without Tailwind can still restyle
them.

Unlike the other entry points, these do **not** re-export from the package
root. `ScrollySteps` pulls in an optional peer dependency, and a subpath keeps
that cost off every consumer that never scrollytells.

## Installing the peer

```sh
npm install @sveltejs/svelte-scroller
```

Only `ScrollySteps` needs it. It is declared optional, so npm will not install
it for you and will not warn when it is missing — the failure surfaces at build
time as `Could not resolve "@sveltejs/svelte-scroller"`. `CrossfadeVideo`,
`ScrollyStepIndicator`, `GlassCard` and the `stepStyle` ramp have no
dependency of their own.

## ScrollySteps

The one scrolly mechanism: a sticky background with a column of scrolling step
sections over it. It owns the `index`/`offset` state, the sticky wrapper and
the per-step opacity/translateY ramp; the content stays in your component.

One `<section>` is rendered per entry of `steps`, **including spacer entries** —
the scroller counts `<section>` elements to decide `index`, so a spacer that is
not in the array puts every later step out by one. Sections that are not steps
at all (a trailing hold, say) go in `before`/`after`.

| Prop               | Type                                                  | Notes                                                                  |
| ------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| `steps`            | `T[]`                                                 | one entry per `<section>`, in scroll order                             |
| `top?`             | `number`                                              | scroller `top` as a viewport fraction; default `0`                     |
| `bottom?`          | `number`                                              | scroller `bottom` as a viewport fraction; default `1`                  |
| `threshold?`       | `number`                                              | viewport fraction at which a section becomes current; default `0.5`    |
| `index?`           | `number`                                              | **bindable** — step index the scroller reports                         |
| `offset?`          | `number`                                              | **bindable** — scroll progress within that step, 0 → 1                 |
| `background`       | `Snippet<[{ index, offset, progress }]>`              | sticky background, inside the `vit-scrolly__bg` wrapper                |
| `step`             | `Snippet<[{ item, i, active, opacity, translateY }]>` | one step's content, inside its `<section>`                             |
| `before?`          | `Snippet`                                             | raw sections before the step sections                                  |
| `after?`           | `Snippet`                                             | raw sections after them (trailing buffer / hold)                       |
| `class?`           | `string`                                              | classes on the foreground column; default `'w-full'`                   |
| `backgroundClass?` | `string`                                              | extra classes next to `vit-scrolly__bg`                                |
| `sectionClass?`    | `string \| ((item: T, i: number) => string)`          | classes on each step `<section>`; a function when they differ per step |

```svelte
<script lang="ts">
	import { ScrollySteps, GlassCard } from '@vit-foundation/ui/scrolly';

	const steps = [{ title: 'One' }, { title: 'Two' }, { title: 'Three' }];
	let index = $state(0);
</script>

<ScrollySteps {steps} bind:index sectionClass="min-h-screen">
	{#snippet background({ progress })}
		<img src="/map.svg" alt="" style="opacity: {progress}" />
	{/snippet}
	{#snippet step({ item, opacity, translateY })}
		<GlassCard style="opacity: {opacity}; transform: translateY({translateY}px)">
			<h2>{item.title}</h2>
		</GlassCard>
	{/snippet}
</ScrollySteps>
```

The sticky background fills `var(--device-h, 100vh)`. Set `--device-h` to a
measured height where a collapsing mobile URL bar makes `vh` jump.

## CrossfadeVideo

One responsive video: a desktop element and a mobile element, each with the
same three `<source>`s (webm → "safe" mp4 → mp4), plus the play / ended /
replay state. Both elements always exist so the browser picks the right encode
without a JS media query; only one is displayed, by the breakpoint classes.

Playback comes in two flavours. **Managed** (the default) plays from the first
frame whenever `active` turns true and pauses when it turns false — that is the
prop to drive from a `ScrollySteps` step. **Native** (`autoplay`) hands
playback to the browser, and `active` then only matters for whatever the caller
crossfades with.

| Prop            | Type                    | Notes                                                                                                                             |
| --------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `srcBase?`      | `string`                | folder the standard names expand from: `<srcBase>/desktop.webm`, `/desktop-safe.mp4`, `/desktop.mp4`, and the matching `mobile.*` |
| `sources?`      | `CrossfadeVideoSources` | explicit per-breakpoint sources, for folders that don't follow that naming; overrides `srcBase`                                   |
| `active?`       | `boolean`               | whether this is the video on screen; drives managed playback. Default `true`                                                      |
| `autoplay?`     | `boolean`               | native playback instead of managed. Default `false`                                                                               |
| `loop?`         | `boolean`               | loop both elements                                                                                                                |
| `poster?`       | `string`                | poster frame for both                                                                                                             |
| `class?`        | `string`                | classes shared by both `<video>` elements                                                                                         |
| `desktopClass?` | `string`                | extra classes carrying the desktop breakpoint; default `'hidden lg:block'`                                                        |
| `mobileClass?`  | `string`                | extra classes carrying the mobile breakpoint; default `'block lg:hidden'`                                                         |
| `replayable?`   | `boolean`               | whether reaching the end offers a replay. Default `true`                                                                          |
| `replayClass?`  | `string`                | extra classes on the replay button, already `absolute inset-0` over the caller's positioned wrapper                               |
| `replayLabel?`  | `string`                | replay `aria-label`; default `'Replay video'`                                                                                     |
| `overlay?`      | `Snippet`               | replay button content; defaults to the built-in reload badge                                                                      |
| `onended?`      | `() => void`            | called once when the video reaches its end                                                                                        |

`bind:this` exposes `CrossfadeVideoHandle` — a `replay()` a host can call when
a section scrolls back into view. The default replay badge draws its own icon
rather than fetching one, because a package cannot assume the host ships an
asset; pass `overlay` to replace it.

The elements are keyed on their sources and recreated when those change:
swapping the `<source>` children of a live `<video>` otherwise has no effect.

## ScrollyStepIndicator

The row (or column) of dots showing which step the reader is on, optionally
clickable to jump. Props: `total`, `current`, `onSelect?` (makes the dots
buttons), `orientation?` (`'vertical'` default, or `'horizontal'`), `class?`.

Colours arrive as custom properties, not class-name props, so changing one
colour does not mean restating a class list:

| Property       | Default                          |
| -------------- | -------------------------------- |
| `--dot-size`   | `0.375rem`                       |
| `--dot-gap`    | `0.5rem`                         |
| `--dot-color`  | `currentColor`                   |
| `--dot-active` | `var(--dot-color, currentColor)` |

## GlassCard

A frosted panel: padding plus a backdrop blur, and nothing else. Props:
`class?`, `children`; rest props spread onto the panel.

| Property          | Default   |
| ----------------- | --------- |
| `--glass-padding` | `2.25rem` |
| `--glass-blur`    | `4px`     |

## The step ramp

`stepStyle(i, index, offset)` projects the scroller's position onto one step
and returns `StepStyle` — `{ active, opacity, translateY }`. `ScrollySteps`
calls it for you; it is exported for a scrolly that draws its own sections.

- `calcOpacity(stepIndex, currentIndex, currentOffset)` — fades in over the
  first quarter of the step, holds through the middle half, fades out over the
  last quarter. `0` for any step that is not current.
- `calcTranslateY(stepIndex, currentIndex, currentOffset)` — slides 30px → 0 on
  entry, holds, then continues to −30px on exit. An inactive step gets the full
  travel, so it is parked below rather than frozen mid-animation.

No DOM and no Svelte in that module: the ramp is assertable as plain numbers,
which is why it is not inline in the component.
