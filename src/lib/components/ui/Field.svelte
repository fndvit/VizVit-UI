<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { FieldConstraint } from '../../content/types.js';
	import ActionLabel from '../../edit/ActionLabel.svelte';
	import type { EditDescriptor } from '../../edit/types.js';

	/** Attributes the control must spread (`{...attrs}`) to stay wired. */
	interface ControlAttrs {
		id: string;
		'aria-describedby': string | undefined;
		maxlength: number | undefined;
		minlength: number | undefined;
	}

	/**
	 * The message comes from the validation that failed, not from the caller.
	 * Every call site used to hand Field the sentence as a prop while issues()
	 * was read as a boolean, so the constraint and the sentence describing it
	 * lived in different files and could never disagree loudly. The host app's schemas own
	 * both now (the foundation site: `boundedText` in its schema layer).
	 *
	 * The numbers travel the same way for the same reason. They used to be
	 * imported by each form and spelled out as a `maxlength` beside the input,
	 * which is how the password and email bounds came to be enforced on the
	 * server and stated nowhere in the markup: forgetting an attribute breaks
	 * nothing visible and no test. A field that declares its constraint here
	 * cannot render a control without it.
	 *
	 * `constraint` is required and explicitly nullable rather than optional,
	 * because optional is what let the hole reopen. The round that moved the
	 * numbers here counted eleven bounded fields and shipped the twelfth — the
	 * magic-link email — with no bound stated in the browser, and nothing could
	 * fail: an omitted prop and a control that genuinely has no length were the
	 * same value. They are different values now. A control with no length says
	 * `null` and says so on purpose; a bounded field that says nothing does not
	 * compile.
	 */
	interface Props {
		/** Control id; the error paragraph gets `${id}-error`. */
		id: string;
		label: string;
		/** The remote form field; its first issue is what gets rendered. */
		field: { issues(): Array<{ message: string }> | undefined };
		/**
		 * The schema's bounds for this field, become the control's length
		 * attributes. `null` for controls with no length: checkboxes, selects.
		 */
		constraint: FieldConstraint | null;
		/** Render the label visually hidden (surrounding context already labels it). */
		hideLabel?: boolean;
		/**
		 * Edit descriptor for the LABEL's wording. While editing, only the
		 * label swaps for editable text — an editable span is not a <label>,
		 * so clicking it no longer focuses the control, and the control itself
		 * stays rendered and live. Hidden labels are never offered.
		 */
		labelEdit?: EditDescriptor;
		/** The input/textarea/select, spreading the given attrs. */
		children: Snippet<[ControlAttrs]>;
	}

	let {
		id,
		label,
		field,
		constraint,
		hideLabel = false,
		labelEdit = undefined,
		children
	}: Props = $props();

	const errorMessage = $derived(field.issues()?.[0]?.message);
	const showError = $derived(errorMessage !== undefined);
</script>

<div class="field">
	<ActionLabel edit={hideLabel ? undefined : labelEdit} value={label}>
		{#snippet control()}
			<label class:visually-hidden={hideLabel} for={id}>{label}</label>
		{/snippet}
	</ActionLabel>
	{@render children({
		id,
		'aria-describedby': showError ? `${id}-error` : undefined,
		maxlength: constraint?.max,
		minlength: constraint?.min
	})}
	{#if showError}
		<p class="field-error" id="{id}-error">{errorMessage}</p>
	{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	label {
		font-weight: 600;
		font-size: var(--text-sm);
	}

	.field-error {
		color: var(--series-8);
		font-size: var(--text-sm);
		margin: 0;
	}
</style>
