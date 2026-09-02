<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getEditAdapter } from './context.js';
	import Editable from './Editable.svelte';
	import type { EditDescriptor } from './types.js';

	/**
	 * The label of an INTERACTIVE control — a button, a nav link — made
	 * editable the way WeeklieCard's title is: while the adapter is editing
	 * and a descriptor is supplied, the control is REPLACED by its label as
	 * editable text, because a caret inside a live control would activate it
	 * (a link navigates mid-draft, a label focuses its input). The control
	 * comes back the moment editing turns off; with no descriptor or no
	 * adapter it renders untouched, byte-identical to a read-only build.
	 */
	interface Props {
		/** Undefined leaves the control alone — the inert default. */
		edit: EditDescriptor | undefined;
		/** The label text the control renders. */
		value: string;
		/** The real control, rendered whenever the label is not being edited. */
		control: Snippet;
	}

	let { edit, value, control }: Props = $props();

	const adapter = getEditAdapter();
	const editing = $derived(edit !== undefined && (adapter?.isEditing ?? false));
</script>

{#if editing}
	<Editable {edit} {value}>
		{#snippet children(text, attrs)}<span class="action-label" {...attrs}>{text}</span>{/snippet}
	</Editable>
{:else}
	{@render control()}
{/if}

<style>
	/* Roughly the control's footprint, so the swap doesn't collapse the row. */
	.action-label {
		display: inline-block;
		padding: 0.2em 0.4em;
	}
</style>
