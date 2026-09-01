<script lang="ts">
	import Editable from '../../edit/Editable.svelte';
	import type { EditDescriptor } from '../../edit/types.js';

	/**
	 * An editorial intro paragraph.
	 *
	 * Owns the intro's element and styling, which five route style blocks
	 * repeated. It deliberately does NOT decide what an empty block means: the
	 * foundation site's repository integration test asserts that every key a
	 * page declares resolves to non-empty copy, so `''` is a failing suite
	 * rather than a state to render around. This component used to guard for
	 * it, and that guard taught every new render site that it had a decision
	 * to make here.
	 *
	 * Not for a hero subtitle or a band lede: those are different visual roles
	 * with their own styling, not editorial intros.
	 */
	interface Props {
		/** Copy for the block. Asserted non-empty; see the note above. */
		text: string;
		/** Marks the copy editable where an edit adapter is active. */
		edit?: EditDescriptor;
	}

	let { text, edit }: Props = $props();
</script>

<Editable {edit} value={text}>
	{#snippet children(value, attrs)}
		<p class="intro" {...attrs}>{value}</p>
	{/snippet}
</Editable>

<style>
	.intro {
		color: var(--color-ink-secondary);
		max-width: 60ch;
	}
</style>
