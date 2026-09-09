<script lang="ts" module>
	/** One option row. `value` is what the control carries: a string, always. */
	export interface SelectOption {
		value: string;
		label: string;
		disabled?: boolean;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	/**
	 * A labelled `<select>` — `TextField`'s sibling for a choice out of a list.
	 *
	 * The package had none, so eleven call sites across the two hosts each grew
	 * their own. That produced four spellings of ONE navy pill, a second box
	 * skin whose corner radius was hard-coded past `--radius` because the admin
	 * theme sets that token to `999px`, and two incompatible ways of reporting
	 * the same refusal: the user editor wires `aria-invalid` and
	 * `aria-describedby`, while the record field one module over announced its
	 * rejection with a bare `role="alert()"` and left the control unmarked. A
	 * control that cannot be rendered unwired is the point here, the way
	 * `Field`'s snippet is.
	 *
	 * The value is a STRING and stays one. Both hosts had already converged on
	 * that independently — a `<select>` binds a string, and a year, a row id or
	 * a boolean flag becomes itself again in the one adapter that reads it — so
	 * a value type here would fork the component per caller.
	 */
	interface Props {
		label: string;
		id: string;
		/**
		 * How it presents itself. Three, which is what the call sites were:
		 *
		 * - `field` — labelled box, the default.
		 * - `pill` — filled navy, for a toolbar beside a heading.
		 * - `bare` — box, label to the screen reader only, for inline chrome
		 *   that already reads as labelled by what surrounds it.
		 */
		variant?: 'field' | 'pill' | 'bare';
		/** Label beside the control rather than above it — a toolbar row. */
		inline?: boolean;
		value?: string;
		required?: boolean;
		disabled?: boolean;
		/**
		 * The leading option. `disabled` makes it a placeholder the reader must
		 * choose past; without it the empty value is selectable and MEANS
		 * something — "No manager", "every table".
		 */
		placeholder?: { label: string; disabled?: boolean };
		/** Options whose labels are data. Use `children` when a label is computed. */
		options?: readonly SelectOption[];
		children?: Snippet;
		error?: string | null;
		/** Standing help. Described alongside an error rather than replaced by it. */
		hint?: string | null;
		/**
		 * Beside the binding, not instead of it: the callers that need one are
		 * coercing the string (a year to a number) or acting on the choice (a
		 * template applied, a draft committed).
		 */
		onchange?: (value: string) => void;
		/**
		 * A remote field's `.as('select')` attachment, spread instead of bound —
		 * the same branch `TextField` takes, so a remote form does not route
		 * around this module and re-declare the skin.
		 */
		attributes?: HTMLSelectAttributes;
		/** Native form submit: the browser posts under this name. */
		name?: string;
	}

	let {
		label,
		id,
		variant = 'field',
		inline = false,
		value = $bindable(''),
		required = false,
		disabled = false,
		placeholder,
		options,
		children,
		error = null,
		hint = null,
		onchange,
		attributes,
		name
	}: Props = $props();

	/** Both ids when both are showing: an error does not hide standing help. */
	const describedBy = $derived(
		[error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') ||
			undefined
	);

	const shared = $derived({
		id,
		name,
		required,
		disabled,
		'aria-invalid': error ? true : undefined,
		'aria-describedby': describedBy
	});
</script>

{#snippet body()}
	{#if placeholder}
		<option value="" disabled={placeholder.disabled}>{placeholder.label}</option>
	{/if}
	{#each options ?? [] as option (option.value)}
		<option value={option.value} disabled={option.disabled}>{option.label}</option>
	{/each}
	{@render children?.()}
{/snippet}

<div class="select-field" class:inline class:pill={variant === 'pill'}>
	<label for={id} class:visually-hidden={variant === 'bare'}>{label}</label>
	{#if attributes}
		<!-- The form owns the value and its name. -->
		<select {...shared} {...attributes}>{@render body()}</select>
	{:else}
		<select {...shared} bind:value onchange={(event) => onchange?.(event.currentTarget.value)}>
			{@render body()}
		</select>
	{/if}
	{#if hint}
		<p class="hint" id="{id}-hint">{hint}</p>
	{/if}
	{#if error}
		<p class="error" id="{id}-error">{error}</p>
	{/if}
</div>

<style>
	.select-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.select-field.inline {
		flex-direction: row;
		align-items: center;
		gap: var(--space-2);
	}

	label {
		font-size: var(--text-sm);
		font-weight: 500;
	}

	select {
		border: 1px solid var(--color-axis);
		/* Not `--radius`: the admin theme sets that to 999px for its pill
		   buttons, which is why both of that host's boxed selects hard-coded a
		   corner past it. `--radius-control` is the input corner in both. */
		border-radius: var(--radius-control);
		background: var(--color-surface);
		padding: 0.35rem 0.6rem;
		font-family: var(--font-sans);
		font-size: var(--text-base);
		color: var(--color-ink);
	}

	select:focus-visible {
		outline: none;
		border-color: var(--color-navy);
	}

	select:disabled {
		opacity: 0.5;
	}

	/* The filled toolbar control: a heading's neighbour, not a form field. */
	.pill select {
		border-color: var(--color-navy);
		border-radius: 999px;
		background: var(--color-navy);
		color: var(--color-surface);
		padding: 0.3rem 0.8rem;
		font-size: var(--text-sm);
	}

	.pill select:focus-visible {
		outline: 2px solid var(--color-navy);
		outline-offset: 2px;
	}

	.hint {
		color: var(--color-ink-muted);
		font-size: 0.8rem;
		margin: 0;
	}

	.error {
		color: var(--series-8);
		font-size: 0.8rem;
		margin: 0;
	}
</style>
