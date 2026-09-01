<script lang="ts">
	import Field from '../../ui/Field.svelte';
	import type { FieldConstraint } from '../../../content/types.js';

	/**
	 * Test-only host for Field: supplies the control snippet the way every real
	 * caller does, so the attrs contract is what gets exercised.
	 */
	interface Props {
		id: string;
		label: string;
		hideLabel?: boolean;
		/** Stands in for the schema's output — Field renders the first message. */
		issues?: Array<{ message: string }>;
		/** The schema's bounds, or null for a control with no length. */
		constraint?: FieldConstraint | null;
	}

	let { id, label, hideLabel = false, issues, constraint = null }: Props = $props();

	const field = { issues: () => issues };
</script>

<Field {id} {label} {field} {hideLabel} {constraint}>
	{#snippet children(attrs)}
		<input class="control" type="text" {...attrs} />
	{/snippet}
</Field>
