<script lang="ts">
	import Editable from '../../edit/Editable.svelte';
	import type { EditDescriptor } from '../../edit/types.js';
	import InlineText from './InlineText.svelte';

	/**
	 * An editorial intro paragraph, in one of two roles: the `intro` of a
	 * page (secondary ink, the measure of a paragraph) or the `lede` of a
	 * band — the home page's weeklies and «know more» bands — light and in
	 * navy under a large light heading. The role is this module's, not an
	 * override from outside: the home page used to restyle the intro through
	 * `:global`, which is the seam crossed from the wrong side.
	 *
	 * Owns the intro's element and styling, which five route style blocks
	 * repeated, and renders `**runs**` as `<strong>` like every other copy
	 * block (raw while a caret is in it). It deliberately does NOT decide
	 * what an empty block means: the foundation site's repository
	 * integration test asserts that every key a page declares resolves to
	 * non-empty copy, so `''` is a failing suite rather than a state to
	 * render around.
	 *
	 * Not for a hero subtitle: that is `SplashHero`'s tagline.
	 */
	interface Props {
		/** Copy for the block. Asserted non-empty; see the note above. */
		text: string;
		/** Marks the copy editable where an edit adapter is active. */
		edit?: EditDescriptor;
		role?: 'intro' | 'lede';
	}

	let { text, edit, role = 'intro' }: Props = $props();
</script>

<Editable {edit} value={text}>
	{#snippet children(value, attrs)}
		<p class="intro" class:lede={role === 'lede'} {...attrs}>
			<InlineText text={value} {attrs} />
		</p>
	{/snippet}
</Editable>

<style>
	.intro {
		/* Its own spacing, not the host's paragraph reset: the mirror resets
		   <p> to no margin and the site does not, so the gap between an intro
		   and the section below it was a different number in each — zero in
		   the CMS, where the next grid sat flush against the text. */
		margin: 0 0 var(--space-4);
		color: var(--color-ink-secondary);
		max-width: 60ch;
	}

	.intro :global(strong) {
		font-weight: 700;
	}

	.lede {
		max-width: 36ch;
		font-weight: 300;
		color: var(--color-navy);
	}
</style>
