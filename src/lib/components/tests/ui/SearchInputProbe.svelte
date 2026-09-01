<script lang="ts">
	import SearchInput from '../../ui/SearchInput.svelte';

	/**
	 * Test-only host for SearchInput: owns `value` as live state so a test can
	 * change it the way a navigation does. `rerender` cannot stand in for that —
	 * it remounts the component, which re-seeds the field and would let a
	 * seed-once input pass a test about following its prop.
	 */
	interface Props {
		value?: string;
		onsearch: (query: string) => void;
		debounceMs?: number;
		/** Handed back so the test can drive the prop after mount. */
		control: (set: (next: string) => void) => void;
	}

	let { value = '', onsearch, debounceMs = 300, control }: Props = $props();

	// svelte-ignore state_referenced_locally
	let current = $state(value);

	$effect(() => {
		control((next) => {
			current = next;
		});
	});
</script>

<SearchInput value={current} placeholder="Cerca weeklies" label="Cerca" {onsearch} {debounceMs} />
