<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getUiConfig } from '../../config/context.js';
	import type { TimelineAreaData } from '../../content/types.js';
	import { getEditAdapter } from '../../edit/context.js';
	import { type Motion, slidePositions } from './slide-scroll.js';
	import { SLIDE_MS, createSwipeDriver } from './swipe-driver.js';
	import { type Place, type RailGeometry, areaReveal, railPlaces } from './rail-flow.js';
	import { clamp01, watchScroll } from '../../utils/scroll-progress.js';
	import TileMosaic from '../ui/TileMosaic.svelte';
	import TimelineArea, { type TimelineAreaEditMap } from './TimelineArea.svelte';
	import AddSlot from '../../edit/chrome/AddSlot.svelte';
	import { collectionEditing } from '../../edit/collection.svelte.js';
	import type { CollectionRef } from '../../edit/types.js';

	/**
	 * The home timeline as a scrolly: a rail down the left with one node per
	 * area, and the areas as full-height sections beside it. The rail sticks
	 * while the sections flow past, and the node of the area on screen is the
	 * current one — so at any scroll position the reader sees one area
	 * expanded and the other two as dots with a label, which is the mock.
	 *
	 * ONE document for every reader. The sections are ordinary content in
	 * order; without JavaScript, under reduced motion, on a narrow viewport
	 * or while a CMS edits, the same DOM reads top to bottom with every edit
	 * frame reachable — only the rail's stickiness and the current mark are
	 * progressive. No sentinel steps, no `inert`, nothing hidden: the
	 * `./scrolly` subpath's `ScrollySteps` is a different shape (a fixed
	 * background with steps over it) and wants a peer the hosts do not carry.
	 *
	 * Where an area's link goes is the host's fact — the package has no
	 * router — so `areaHref` answers it per area; `HomePage` builds it from
	 * `common_seeAllHref` and the category.
	 */
	interface Props {
		areas: TimelineAreaData[];
		/** Where an area leads — the host passes `areaDestination` with its own «see all» path; null for no link. */
		areaHref: (area: TimelineAreaData) => string | null;
		/** Edit descriptors for one area's fields; see TimelineArea. */
		editFor?: (area: TimelineAreaData) => TimelineAreaEditMap | undefined;
		/** Names the areas' collection; with the adapter's ops, turns on add and remove. */
		collection?: CollectionRef;
		/** The closing «To our full timeline →» link, rendered bottom-right. */
		seeAll?: Snippet;
		/**
		 * How the reader moves through the areas — and from the splash into
		 * the first, and from the last on to what follows. `swipe` (the
		 * default) is the stage: one slide at a time, with resistance, on a
		 * wide screen with JavaScript and motion allowed. `scroll` is the
		 * stacked flow everywhere: the areas are sections the page scrolls
		 * through, the rail marking the one on screen.
		 */
		motion?: Motion;
		/**
		 * How the reader ENTERS the run, from the splash into the first area:
		 * a swipe (the splash is the run's first slide) or the page's own
		 * scroll (the run begins at the first area). Only on the stage.
		 */
		entry?: Motion;
		/**
		 * How the reader LEAVES it, from the last area to what follows the
		 * timeline: a swipe (the end of the track is the run's last slide) or
		 * the page's own scroll. Only on the stage.
		 */
		exit?: Motion;
	}

	let {
		areas,
		areaHref,
		editFor,
		collection,
		seeAll,
		motion = 'swipe',
		entry = 'swipe',
		exit = 'swipe'
	}: Props = $props();

	const config = getUiConfig();
	const adapter = getEditAdapter();
	// The structural half (the add slot, per-area removal); the list owns
	// identity and order — see collectionEditing.
	const list = collectionEditing<TimelineAreaData, TimelineAreaEditMap>(() => ({
		collection,
		editFor
	}));
	// By the row's id, not the category: a section need not have one, and two never share an id.
	const sectionId = (area: TimelineAreaData): string => `area-${area.id}`;

	let root = $state<HTMLElement | null>(null);
	/** Index of the area on screen; the first until the scroll says otherwise. */
	let active = $state(0);

	/**
	 * Two ways to lay the areas out. STACKED is the document: every area a
	 * full section in flow, one after the other — what the server renders,
	 * what a reader without JavaScript, on a phone, or under reduced motion
	 * gets, and what a CMS edits (every frame in reach). STAGE is the
	 * swipe: a frame pinned to the screen for as long as a track of one
	 * screen per area scrolls past, the areas laid over each other in it,
	 * and the one the scroll has reached shown while the others wait off
	 * the frame — the screen does not move, the slide changes. Snap points
	 * down the track land each turn of the wheel on one slide.
	 */
	let stage = $state(false);
	/** A pull is on: the slides follow the wheel at once (see the swipe effect). */
	let pulling = $state(false);
	/** A swipe is driving the scroll: the scroll pass leaves `active` to it. */
	let moving = false;
	/** On the stage, a rail node drives to its slide (set by the swipe effect); off it, the anchor jumps. */
	let jumpTo: ((index: number) => void) | null = null;

	/**
	 * In the stacked flow the nodes FOLLOW their headings: while an area's
	 * heading is on screen its node rides level with it, ticked to it, and
	 * only when the heading has scrolled past does the node park at the top
	 * (with its label), or at the bottom while the heading is still to come
	 * — so no step is ever named twice, by a parked label and a heading at
	 * once. Measured on scroll; `null` until then (the server render and a
	 * reader without JavaScript get the CSS places).
	 */
	let places = $state<Place[] | null>(null);
	let nodeTops = $state<number[] | null>(null);
	let rail = $state<HTMLElement | null>(null);

	const REM = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

	/**
	 * In the stacked flow an area's content ENTERS and LEAVES with the
	 * scroll: coming up from the bottom edge it rises into place and
	 * brightens over the lower third of the screen, and going out at the top
	 * it fades and lifts over the same distance. Scroll-linked, so it reads
	 * as the page's own motion rather than an animation that fires; written
	 * straight to the section (`--vit-area-reveal`, `--vit-area-shift`),
	 * which TimelineArea's layout reads. Nothing moves under reduced motion.
	 */
	function revealWithScroll(sections: HTMLElement[]): void {
		const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const screen = window.innerHeight;
		const topEdge = navOffset();
		sections.forEach((section) => {
			const content = section.querySelector<HTMLElement>('.layout') ?? section;
			const { reveal, shift } = areaReveal(content.getBoundingClientRect(), screen, topEdge, still);
			section.style.setProperty('--vit-area-reveal', reveal.toFixed(3));
			section.style.setProperty('--vit-area-shift', `${shift.toFixed(1)}px`);
		});
	}

	/**
	 * The rail's geometry is the tokens' (`--vit-rail-*`, in rem): the CSS
	 * places the nodes by them and this reads the same values to decide the
	 * places — one owner, the stylesheet, and no number retyped here.
	 */
	function railGeometry(list: HTMLElement): RailGeometry {
		const style = getComputedStyle(list);
		const rem = REM();
		const px = (token: string) => (parseFloat(style.getPropertyValue(token)) || 0) * rem;
		return {
			top: px('--vit-rail-top'),
			step: px('--vit-rail-step'),
			stack: px('--vit-rail-stack'),
			bottom: px('--vit-rail-bottom')
		};
	}

	function followHeadings(sections: HTMLElement[]): void {
		if (!rail) return;
		const box = rail.getBoundingClientRect();
		const centres = sections.map((section) => {
			const heading = section.querySelector('h3') ?? section;
			const rect = heading.getBoundingClientRect();
			return rect.top + rect.height / 2 - box.top;
		});
		const flow = railPlaces(centres, box.height, railGeometry(rail));
		places = flow.places;
		nodeTops = flow.tops;
		active = flow.active;
	}

	$effect(() => {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
		// Strictly wider than the CSS's `max-width: 900px`: at exactly 900 both
		// matched, the stage on while the layout had stacked.
		const wide = window.matchMedia('(min-width: 901px)');
		const still = window.matchMedia('(prefers-reduced-motion: reduce)');
		const update = () => {
			stage =
				motion === 'swipe' && wide.matches && !still.matches && !(adapter?.isEditing ?? false);
		};
		update();
		wide.addEventListener('change', update);
		still.addEventListener('change', update);
		return () => {
			wide.removeEventListener('change', update);
			still.removeEventListener('change', update);
		};
	});

	/**
	 * The fixed nav's height — what the stage sits under. Read from the
	 * frame's own sticky `top`, which is the `--vit-splash-offset` token
	 * resolved, so the package assumes nothing about the host's header.
	 */
	let frame = $state<HTMLElement | null>(null);
	const navOffset = (): number => (frame ? parseFloat(getComputedStyle(frame).top) || 0 : 0);
	/** The screen the stage fills: the viewport under the nav. */
	const screenHeight = (): number => window.innerHeight - navOffset();

	/** On the stage: how many screens of the track have scrolled past, to the nearest. */
	function activeOnStage(region: HTMLElement, count: number): number {
		const top = region.getBoundingClientRect().top - navOffset();
		const screens = Math.round(-top / screenHeight());
		return Math.min(count - 1, Math.max(0, screens));
	}

	/**
	 * THE SWIPE: the stage's state machine lives in `swipe-driver.ts` behind
	 * a port; this effect fills the port from `window` and hands it the
	 * events. The slide positions are measured on every ask, so a resize
	 * moves them.
	 */
	$effect(() => {
		if (!stage || !root || typeof window === 'undefined') return;
		const region = root;
		const driver = createSwipeDriver(
			{
				scrollY: () => window.scrollY,
				scrollTo: (y) => window.scrollTo(0, y),
				positions: () =>
					slidePositions(
						region.getBoundingClientRect().top + window.scrollY,
						areas.length,
						screenHeight(),
						navOffset(),
						{ entry, exit }
					),
				now: () => performance.now(),
				frame: (step) => requestAnimationFrame(step),
				cancelFrame: (id) => cancelAnimationFrame(id),
				later: (run, ms) => window.setTimeout(run, ms),
				cancelLater: (id) => window.clearTimeout(id),
				pull: (share) => {
					region.style.setProperty('--vit-swipe-pull', share.toFixed(3));
					pulling = share !== 0;
				},
				show: (area) => {
					active = area;
				},
				moving: (on) => {
					moving = on;
				}
			},
			{ count: areas.length, entry }
		);
		jumpTo = (index) => driver.jumpTo(index);

		const onWheel = (event: WheelEvent) => {
			if (driver.wheel(event.deltaY, event.ctrlKey)) event.preventDefault();
		};
		const onKey = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null;
			if (target && /^(input|textarea|select)$/i.test(target.tagName)) return;
			if (driver.key(event.key)) event.preventDefault();
		};
		const onTouchStart = (event: TouchEvent) => {
			const y = event.touches[0]?.clientY;
			if (y !== undefined) driver.touchStart(y);
		};
		const onTouchEnd = (event: TouchEvent) => {
			const y = event.changedTouches[0]?.clientY;
			if (y !== undefined) driver.touchEnd(y);
		};
		window.addEventListener('wheel', onWheel, { passive: false });
		window.addEventListener('keydown', onKey);
		window.addEventListener('touchstart', onTouchStart, { passive: true });
		window.addEventListener('touchend', onTouchEnd, { passive: true });
		return () => {
			window.removeEventListener('wheel', onWheel);
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('touchstart', onTouchStart);
			window.removeEventListener('touchend', onTouchEnd);
			driver.stop();
			jumpTo = null;
		};
	});

	$effect(() => {
		if (!root || typeof window === 'undefined') return;
		const region = root;
		const onStage = stage;
		const sections = [...region.querySelectorAll<HTMLElement>('section.area')];
		if (onStage) {
			places = null;
			nodeTops = null;
			for (const section of sections) {
				section.style.removeProperty('--vit-area-reveal');
				section.style.removeProperty('--vit-area-shift');
			}
		}
		return watchScroll(() => {
			const top = region.getBoundingClientRect().top;
			region.style.setProperty(
				'--vit-rail-reveal',
				clamp01((window.innerHeight - top) / window.innerHeight).toFixed(3)
			);
			if (onStage) {
				if (!moving) active = activeOnStage(region, sections.length);
			} else {
				// The reveal first: it moves each area's content (`--vit-area-shift`),
				// and the nodes follow the headings where they END UP this frame,
				// not where they were a frame ago.
				revealWithScroll(sections);
				followHeadings(sections);
			}
		});
	});
</script>

<div
	class="areas"
	class:stage
	class:pulling
	role="region"
	aria-label={config.messages.timeline_areasLabel()}
	style={`--n: ${areas.length}; --vit-slide-ms: ${SLIDE_MS}ms`}
	bind:this={root}
>
	<div class="frame" bind:this={frame}>
		<!-- The decor rides with the screen, like the rail: two clusters at the
	     right edge, top and bottom, behind whatever slides past. -->
		<div class="decor" aria-hidden="true">
			<div class="screen">
				<div class="corner top">
					<TileMosaic cols={2} rows={2} seed={31} density={1} />
				</div>
				<div class="corner bottom">
					<TileMosaic cols={2} rows={2} seed={47} density={1} />
				</div>
			</div>
		</div>
		<div class="rail-column">
			<!-- Each node's place is its relation to the current one: the current
		     sits at the top row, level with its area's heading; every other one
		     — passed or to come — waits at the bottom of the screen, in the
		     areas' order, so all the steps stay in view; and they move between
		     those places as the reader swipes, the next rising to the row. -->
			<ol class="rail" style={`--active: ${active}; --n: ${areas.length}`} bind:this={rail}>
				{#each areas as area, index (area.id)}
					{@const place =
						places?.[index] ??
						(index === active ? 'current' : index < active ? 'passed' : 'upcoming')}
					<li
						class:current={place === 'current'}
						class:passed={place === 'passed'}
						class:upcoming={place === 'upcoming'}
						class:following={places !== null}
						style={`--i: ${index}; --r: ${index < active ? index : index - 1}${nodeTops ? `; top: ${nodeTops[index]?.toFixed(1)}px` : ''}`}
					>
						<a
							href={`#${sectionId(area)}`}
							aria-current={index === active ? 'true' : undefined}
							onclick={(event) => {
								if (!jumpTo) return;
								event.preventDefault();
								jumpTo(index);
							}}
						>
							<span class="dot" aria-hidden="true"></span>
							<span class="label">{area.title}</span>
						</a>
					</li>
				{/each}
			</ol>
		</div>
		<div class="sections">
			{#each areas as area, index (area.id)}
				<TimelineArea
					{area}
					href={areaHref(area)}
					id={sectionId(area)}
					state={places?.[index] ??
						(index === active ? 'current' : index < active ? 'passed' : 'upcoming')}
					next={index === active + 1}
					prev={index === active - 1}
					edit={list.mapFor(area)}
				/>
			{/each}
			<!-- A new section: the host's form for a new row (the op is there
			     too, for a host without one). The slot decides whether it is
			     live; the stage is off while editing, so it sits in the flow. -->
			{#if collection && adapter?.isEditing}
				<div class="add-slot">
					<AddSlot op={list.add} record={{ entity: collection.entity }} />
				</div>
			{/if}
			{#if seeAll}
				<p class="see-all">{@render seeAll()}</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.areas {
		/* How far in the timeline is; the effect above sets it from the scroll. */
		--vit-rail-reveal: 1;
		/* The side of a decor cluster; the full-timeline link keeps clear of it. */
		--vit-corner: 10.5rem;

		position: relative;
	}

	/* The rail's column is wide enough for a parked label beside its node, so
	   no label ever reaches the areas' headings; a long one wraps. */
	.frame {
		--vit-rail-width: 12rem;

		position: relative;
		display: grid;
		grid-template-columns: var(--vit-rail-width) 1fr;
		gap: var(--space-4);
		padding-inline: var(--space-4) 0;
	}

	/* THE STAGE: the region is the track, one screen per area; the frame is
	   pinned to the screen for the track's length and the areas lie over
	   each other inside it, the one reached shown, the others off the frame
	   above or below. The swipe (the effect above) moves the scroll one
	   screen at a time. */
	/* The screen's REAL height: `dvh` leaves out whatever browser chrome
	   takes, where `100vh` can run past the bottom edge and hide the lowest
	   node; the token stays as the fallback. */
	.stage {
		height: calc(var(--n) * (var(--device-h) - var(--vit-splash-offset)));
		height: calc(var(--n) * (100dvh - var(--vit-splash-offset)));
	}

	/* Pinned right under the fixed nav, the screen that is left. */
	.stage .frame {
		position: sticky;
		top: var(--vit-splash-offset);
		height: calc(var(--device-h) - var(--vit-splash-offset));
		height: calc(100dvh - var(--vit-splash-offset));
		box-sizing: border-box;
		overflow: hidden;
	}

	.stage .sections {
		position: relative;
		height: calc(var(--device-h) - var(--vit-splash-offset));
		height: calc(100dvh - var(--vit-splash-offset));
	}

	/* The cards move WHOLE, one screen up or down, on one curve: the current
	   leaves through the top of the frame as the next comes in through the
	   bottom (or back the other way), and the frame's overflow clips them. */
	.stage .sections :global(section.area) {
		position: absolute;
		inset: 0;
		min-height: 0;
		overflow: hidden;
		will-change: transform;
		transition: transform var(--vit-slide-ms) cubic-bezier(0.65, 0, 0.35, 1);
	}

	.stage .sections :global(section.area.upcoming) {
		transform: translateY(100%);
		pointer-events: none;
	}

	.stage .sections :global(section.area.passed) {
		transform: translateY(-100%);
		pointer-events: none;
	}

	/* THE PULL: `--vit-swipe-pull` is the share of the threshold the wheel
	   has covered, signed (down positive). The current card gives with it
	   and the card it is heading for shows its edge; while a pull is on, the
	   cards follow the wheel at once rather than easing. */
	.stage {
		--vit-swipe-pull: 0;
		--vit-pull-down: max(var(--vit-swipe-pull), 0);
		--vit-pull-up: max(calc(-1 * var(--vit-swipe-pull)), 0);
	}

	.stage .sections :global(section.area.current) {
		transform: translateY(calc(var(--vit-swipe-pull) * -14vh));
	}

	.stage .sections :global(section.area.next) {
		transform: translateY(calc(100% - var(--vit-pull-down) * 14vh));
	}

	.stage .sections :global(section.area.prev) {
		transform: translateY(calc(-100% + var(--vit-pull-up) * 14vh));
	}

	.stage.pulling .sections :global(section.area) {
		transition-duration: 90ms;
		transition-timing-function: linear;
	}

	.stage .see-all {
		position: absolute;
		right: calc(var(--vit-corner) + var(--space-4));
		bottom: var(--space-4);
		margin: 0;
		padding: 0;
	}

	/* The two clusters hang from a sticky screen inside a layer the size of
	   the whole frame, so they hold their place while the areas slide past
	   beneath, and the frame's end pushes the screen up: the clusters never
	   reach the section below. (A zero-height sticky box would stay put
	   until the region had wholly scrolled by, and the lower cluster would
	   hang over whatever follows; a screen-tall one with a negative margin
	   would too, since the margin widens the range the box may stick in.) */
	.decor {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}

	.screen {
		position: sticky;
		top: 0;
		height: var(--device-h);
		height: 100dvh;
	}

	.corner {
		position: absolute;
		right: 0;
		width: var(--vit-corner);
		height: var(--vit-corner);
	}

	.corner.top {
		top: 4rem;
	}

	.corner.bottom {
		top: calc(var(--device-h) - 14.5rem);
	}

	/* `display: block` and no stretching: a sticky element inside a stretched
	   grid cell would be as tall as the column and never stick. */
	/* Above the sections: a parked label reads over a picture. */
	.rail-column {
		display: block;
		position: relative;
		z-index: 2;
	}

	.rail {
		position: sticky;
		top: var(--vit-splash-offset);
		height: calc(var(--device-h) - var(--vit-splash-offset));
		height: calc(100dvh - var(--vit-splash-offset));
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* On the stage the frame is the screen and the rail is exactly as tall:
	   an explicit height, since a percentage inside the frame's auto row
	   would resolve to nothing. */
	.stage .rail {
		height: calc(var(--device-h) - var(--vit-splash-offset));
		height: calc(100dvh - var(--vit-splash-offset));
	}

	/* Two places on the rail, and a move between them. The current node
	   sits at the top row, level with its area's heading (TimelineArea pads
	   for it); every other node — passed or to come — waits at the bottom of
	   the screen, in the areas' order (`--r` is its rank among them), so all
	   the steps stay in view. */
	.rail li {
		position: absolute;
		left: 0;
		transform: translateY(-50%);
		transition:
			top var(--vit-slide-ms) cubic-bezier(0.65, 0, 0.35, 1),
			opacity 300ms ease;
	}

	.rail li.current {
		top: var(--vit-rail-top);
	}

	.rail li.passed,
	.rail li.upcoming {
		top: calc(100% - var(--vit-rail-bottom) - (var(--n) - 2 - var(--r)) * var(--vit-rail-step));
		opacity: calc(var(--vit-rail-reveal, 1) * 0.7);
	}

	/* Following a heading (the stacked flow, measured): the node is where the
	   scroll puts it, at once, and a parked one keeps its label legible over
	   whatever the page has there. */
	.rail li.following {
		transition: opacity 240ms ease;
	}

	.rail li.following .label {
		padding-inline: 0.25rem;
		background: var(--color-surface);
	}

	/* The track line the dots sit on, drawn from the top as the timeline
	   rises into view (see the effect); the nodes come up with it. */
	.rail::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: calc(0.75rem - 1px);
		width: 1px;
		background: var(--color-navy);
		transform: scaleY(var(--vit-rail-reveal, 1));
		transform-origin: top;
		transition: transform 120ms linear;
	}

	.rail li {
		opacity: var(--vit-rail-reveal, 1);
	}

	/* The tick from the node to its label — and, for the current one, to
	   the area's heading, which stands where its label would. */
	.rail li::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 1.5rem;
		width: 2rem;
		height: 1px;
		background: var(--color-navy);
		transition: width 400ms cubic-bezier(0.65, 0, 0.35, 1);
	}

	.rail li.current::after {
		width: calc(var(--vit-rail-width) + var(--space-4) - 1.5rem);
	}

	.rail li.current .label {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.rail a {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: calc(2rem + var(--space-2));
		max-width: var(--vit-rail-width);
		color: var(--color-navy);
		text-decoration: none;
		font-size: var(--text-sm);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	/* A navy core in a white ring in a navy line, the design's node. */
	.dot {
		flex: 0 0 auto;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		background: var(--color-navy);
		box-shadow: inset 0 0 0 4px var(--color-surface);
		border: 1px solid var(--color-navy);
		box-sizing: border-box;
		transition: transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.current .dot {
		transform: scale(1.25);
	}

	/* Wraps inside the column rather than running on over the headings. */
	.label {
		min-width: 0;
		max-width: calc(var(--vit-rail-width) - 2rem - var(--space-2) - 1.5rem);
		line-height: 1.2;
		/* Between words only: a long single word stays whole. */
		overflow-wrap: normal;
		transition: font-size 300ms ease;
	}

	.current .label {
		font-size: var(--text-base);
	}

	@media (prefers-reduced-motion: reduce) {
		.rail li,
		.rail::before,
		.dot,
		.label {
			transition: none;
		}
	}

	.rail a:focus-visible {
		outline: 2px solid var(--color-brand);
		outline-offset: 4px;
	}

	.sections {
		position: relative;
		z-index: 1;
		min-width: 0;
	}

	/* Beside the lower cluster, not under it. */
	.add-slot {
		margin: 0 0 var(--space-4);
	}

	.see-all {
		margin: 0 0 var(--space-5);
		padding-inline-end: calc(var(--vit-corner) + var(--space-4));
		text-align: right;
		font-size: var(--text-sm);
	}

	/* A phone keeps the scrolly: the rail becomes a strip that sticks to the
	   top while the sections flow under it. Block layout, not the grid — a
	   sticky element is held by its containing block, and in a one-column
	   grid that would be the rail's own row rather than the whole timeline. */
	@media (max-width: 900px) {
		/* One column with the page's gutter; the rail is a strip on top. */
		.frame {
			display: block;
			padding-inline: var(--space-3);
		}

		.decor {
			display: none;
		}

		.rail li::after {
			display: none;
		}

		.rail li.current .label {
			position: static;
			width: auto;
			height: auto;
			clip-path: none;
		}

		.rail a {
			gap: var(--space-2);
		}

		.rail-column {
			position: sticky;
			top: var(--vit-splash-offset);
			z-index: var(--z-raised);
			background: var(--color-surface);
		}

		.rail {
			position: static;
			display: flex;
			flex-direction: row;
			gap: var(--space-3);
			height: auto;
			padding: var(--space-2) 0;
			overflow-x: auto;
			scrollbar-width: none;
		}

		.rail::before {
			display: none;
		}

		/* The strip lays its nodes out in a row; the three places are for the
		   tall rail. */
		.rail li,
		.rail li.passed,
		.rail li.current,
		.rail li.upcoming {
			position: static;
			transform: none;
			opacity: 1;
		}

		.rail a {
			white-space: nowrap;
		}

		.current .label {
			font-size: var(--text-sm);
		}
	}
</style>
