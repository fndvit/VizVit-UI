<!--
	@component CrossfadeVideo

	One responsive video: a desktop element and a mobile element, each with the
	same three `<source>`s (webm → "safe" mp4 → mp4), plus the play / ended /
	replay state that every scrolly video on the site used to re-implement.

	Only one of the two elements is ever displayed (`desktopClass` /
	`mobileClass` carry the breakpoint), but both exist so the browser picks the
	right encode without a JS media query — the arrangement the feature
	components already used.

	Playback comes in two flavours:
	- **managed** (default): the component plays from the first frame whenever
	  `active` turns true and pauses when it turns false.
	- **native** (`autoplay`): playback is the browser's, and `active` only
	  matters for whatever classes the caller crossfades with.

	Swapping the `<source>` children of a live `<video>` has no effect, so the
	elements are keyed on their sources and recreated when those change.

	@prop {string} [srcBase] - Folder the standard file names expand from:
		`<srcBase>/desktop.webm`, `/desktop-safe.mp4`, `/desktop.mp4` and the
		matching `mobile.*`. Ignored when `sources` is given.
	@prop {CrossfadeVideoSources} [sources] - Explicit per-breakpoint sources,
		for folders that don't follow the `desktop.*` / `mobile.*` naming.
	@prop {boolean} [active=true] - Whether this video is the one on screen.
		Drives managed playback.
	@prop {boolean} [autoplay=false] - Hand playback to the browser (`autoplay`
		on both elements) instead of managing it.
	@prop {boolean} [loop=false] - Loop both elements.
	@prop {string} [poster] - Poster frame for both elements.
	@prop {string} [class] - Classes shared by both `<video>` elements.
	@prop {string} [desktopClass='hidden lg:block'] - Extra classes on the
		desktop element, carrying its breakpoint.
	@prop {string} [mobileClass='block lg:hidden'] - Extra classes on the
		mobile element, carrying its breakpoint.
	@prop {boolean} [replayable=true] - Whether reaching the end offers a replay.
	@prop {string} [replayClass] - Extra classes on the replay button, which is
		already `absolute inset-0` over the caller's positioned wrapper.
	@prop {string} [replayLabel='Replay video'] - Replay button aria-label.
	@prop {Snippet} [overlay] - Replay button content. Defaults to the shared
		reload badge.
	@prop {() => void} [onended] - Called once when the video reaches its end.
-->
<script lang="ts" module>
	/** The three encodes one breakpoint offers, in `<source>` order. */
	export type CrossfadeVideoTrack = {
		/** VP9/webm, preferred where it decodes. */
		webm: string;
		/** Conservatively encoded mp4, for players that choke on the main one. */
		mp4Safe: string;
		/** Main h.264 mp4. */
		mp4: string;
	};

	/** Both breakpoints' encodes. */
	export type CrossfadeVideoSources = {
		desktop: CrossfadeVideoTrack;
		mobile: CrossfadeVideoTrack;
	};

	/** What `bind:this` on a `<CrossfadeVideo>` exposes. */
	export type CrossfadeVideoHandle = { replay: () => void };
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		srcBase = '',
		sources,
		active = true,
		autoplay = false,
		loop = false,
		poster,
		class: className = '',
		desktopClass = 'hidden lg:block',
		mobileClass = 'block lg:hidden',
		replayable = true,
		replayClass = '',
		replayLabel = 'Replay video',
		overlay,
		onended
	}: {
		srcBase?: string;
		sources?: CrossfadeVideoSources;
		active?: boolean;
		autoplay?: boolean;
		loop?: boolean;
		poster?: string;
		class?: string;
		desktopClass?: string;
		mobileClass?: string;
		replayable?: boolean;
		replayClass?: string;
		replayLabel?: string;
		overlay?: Snippet;
		onended?: () => void;
	} = $props();

	const resolved: CrossfadeVideoSources = $derived(
		sources ?? {
			desktop: {
				webm: `${srcBase}/desktop.webm`,
				mp4Safe: `${srcBase}/desktop-safe.mp4`,
				mp4: `${srcBase}/desktop.mp4`
			},
			mobile: {
				webm: `${srcBase}/mobile.webm`,
				mp4Safe: `${srcBase}/mobile-safe.mp4`,
				mp4: `${srcBase}/mobile.mp4`
			}
		}
	);

	/** Recreating the elements is the only way a `<source>` swap takes effect. */
	const srcKey = $derived(`${resolved.desktop.webm}|${resolved.mobile.webm}`);

	let desktopEl = $state<HTMLVideoElement | null>(null);
	let mobileEl = $state<HTMLVideoElement | null>(null);
	let ended = $state(false);

	/** Both elements, in the order they are played/paused. */
	const elements = $derived([desktopEl, mobileEl]);

	/** Rewinds and plays both elements. Autoplay rejections are expected. */
	function playFromStart() {
		ended = false;
		for (const el of elements) {
			if (!el) continue;
			el.currentTime = 0;
			// `play()` returns undefined in non-browser DOMs; normalize before catching
			void Promise.resolve(el.play()).catch(() => {
				// Autoplay may be blocked by the browser — silently fail
			});
		}
	}

	/**
	 * Restarts playback from the first frame.
	 *
	 * Exposed on the component instance so a host that plays on its own trigger
	 * (a section scrolling back into view, say) can ask for a replay.
	 */
	export function replay() {
		playFromStart();
	}

	/** Leaves the video on its last frame and offers the replay affordance. */
	function handleEnded() {
		if (ended) return; // already handled by the other element
		ended = true;
		onended?.();
	}

	$effect(() => {
		if (autoplay) return; // native playback: the browser owns it
		if (active) playFromStart();
		else for (const el of elements) el?.pause();
	});
</script>

{#key srcKey}
	<!-- Desktop -->
	<video
		bind:this={desktopEl}
		muted
		playsinline
		{autoplay}
		{loop}
		{poster}
		onended={handleEnded}
		class="{className} {desktopClass}"
	>
		<source src={resolved.desktop.webm} type="video/webm" />
		<source src={resolved.desktop.mp4Safe} type="video/mp4" />
		<source src={resolved.desktop.mp4} type="video/mp4" />
	</video>

	<!-- Mobile -->
	<video
		bind:this={mobileEl}
		muted
		playsinline
		{autoplay}
		{loop}
		{poster}
		onended={handleEnded}
		class="{className} {mobileClass}"
	>
		<source src={resolved.mobile.webm} type="video/webm" />
		<source src={resolved.mobile.mp4Safe} type="video/mp4" />
		<source src={resolved.mobile.mp4} type="video/mp4" />
	</video>

	{#if ended && replayable}
		<button onclick={replay} class="vit-video__replay {replayClass}" aria-label={replayLabel}>
			{#if overlay}
				{@render overlay()}
			{:else}
				<!-- The default badge draws its own icon rather than fetching one:
				     a package cannot assume a host ships `/common/reload.svg`. Pass
				     the `overlay` snippet to replace it entirely. -->
				<span class="vit-video__replay-badge">
					<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
						<path d="M12 5V2L8 6l4 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7Z" fill="currentColor" />
					</svg>
				</span>
			{/if}
		</button>
	{/if}
{/key}

<style>
	/*
	 * The replay affordance covers the finished video. Presentation is plain CSS
	 * so the component needs no framework; pass `replayClass` or the `overlay`
	 * snippet to restyle it.
	 */
	.vit-video__replay {
		position: absolute;
		inset: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
		pointer-events: auto;
	}

	.vit-video__replay-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--video-badge-padding, 1rem);
		border-radius: 9999px;
		color: var(--video-badge-color, #111827);
		background: var(--video-badge-bg, rgb(255 255 255 / 0.5));
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
	}
</style>
