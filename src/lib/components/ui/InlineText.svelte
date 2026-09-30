<script lang="ts">
	import { renderInline } from '../../content/richtext.js';
	import type { EditableAttrs } from '../../edit/chrome-props.js';

	/**
	 * A paragraph's runs as real elements: `**text**` in the source is a
	 * `<strong>`. Renders no element of its own — the caller owns the `<p>`
	 * (or the `<h1>`), this fills it — so it drops into any `Editable`
	 * snippet. Which is where the one rule lives: while a CARET is in the
	 * element the RAW source renders, markers and all, because the editor
	 * reads the draft back as `innerText` and a `<strong>` run would commit
	 * without its `**`; the moment focus leaves, the runs are back. The
	 * switch is the element's attributes: an `Editable` snippet hands them
	 * over as `attrs`, and this reads `data-vit-caret` off them — not
	 * `contenteditable`, which the live editor keeps on for as long as edit
	 * mode is, so every run in the CMS mirror used to show its markers.
	 */
	interface Props {
		text: string;
		/** The element's attributes from an `Editable` snippet; with a caret in it the source renders verbatim. */
		attrs?: EditableAttrs;
	}

	let { text, attrs = undefined }: Props = $props();

	const live = $derived(attrs !== undefined && 'data-vit-caret' in attrs);
	const runs = $derived(live ? [{ text, strong: false }] : renderInline(text));
</script>

{#each runs as run, index (index)}{#if run.strong}<strong>{run.text}</strong
		>{:else}{run.text}{/if}{/each}
