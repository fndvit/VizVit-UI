<script lang="ts">
	import EditFrame from '../../edit/chrome/EditFrame.svelte';
	import EditPanel from '../../edit/chrome/EditPanel.svelte';
	import type { PropertyDescriptor } from '../../edit/types.js';

	interface Props {
		/** Ties the label to the input; override when a page renders two. */
		id?: string;
		value?: string;
		placeholder: string;
		label: string;
		/** Called after the debounce delay with the trimmed query. */
		onsearch: (query: string) => void;
		debounceMs?: number;
		/**
		 * A placeholder cannot hold a caret, so it edits through the frame's
		 * panel: one text row over whatever the host's descriptor names
		 * (a chrome key on the foundation site). Inert without an adapter.
		 */
		placeholderEdit?: PropertyDescriptor;
	}

	const DEFAULT_DEBOUNCE_MS = 300;

	let {
		id = 'search-input',
		value = '',
		placeholder,
		label,
		onsearch,
		debounceMs = DEFAULT_DEBOUNCE_MS,
		placeholderEdit
	}: Props = $props();

	const frameSpec = $derived(placeholderEdit !== undefined ? { label, hasPanel: true } : undefined);

	// svelte-ignore state_referenced_locally
	let query = $state(value);
	let timer: ReturnType<typeof setTimeout> | undefined;

	/**
	 * The last query this input reported, so it can tell its own echo from a
	 * new value. The caller writes what we emit back into `value`, and on the
	 * weeklies index that round trip lands mid-debounce: adopting `value`
	 * unconditionally would overwrite the characters typed since.
	 */
	// svelte-ignore state_referenced_locally
	let emitted = $state(value);

	// `value` seeds the field and then follows it, but only when the caller
	// reports something this input did not ask for — a navigation that changed
	// the filters. Without this the box kept the previous page's search text
	// while the results below it came back unfiltered.
	$effect(() => {
		if (value !== emitted) {
			query = value;
			emitted = value;
		}
	});

	function emit(): void {
		emitted = query.trim();
		onsearch(emitted);
	}

	function handleInput(): void {
		clearTimeout(timer);
		timer = setTimeout(emit, debounceMs);
	}

	// The pending timer outlives the component without this. Typing and then
	// clicking a result within the debounce window fired `onsearch` from a
	// destroyed input, and on the weeklies index that writes the query back to
	// the URL — rewriting the address bar of whatever page the reader had just
	// navigated to.
	$effect(() => () => clearTimeout(timer));

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		clearTimeout(timer);
		emit();
	}
</script>

<form role="search" onsubmit={handleSubmit}>
	<!-- Inside the form, so the host's toolbar layout never gains a child. -->
	<EditFrame spec={frameSpec}>
		{#snippet panel()}
			{#if placeholderEdit}
				<EditPanel rows={[{ descriptor: placeholderEdit, value: placeholder }]} />
			{/if}
		{/snippet}
		<label class="visually-hidden" for={id}>{label}</label>
		<input
			{id}
			class="control"
			type="search"
			{placeholder}
			bind:value={query}
			oninput={handleInput}
		/>
	</EditFrame>
</form>

<style>
	input {
		width: 100%;
		max-width: 24rem;
		padding: var(--space-2) var(--space-3);
	}
</style>
