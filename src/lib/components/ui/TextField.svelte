<script lang="ts">
	import type { FullAutoFill, HTMLInputAttributes } from 'svelte/elements';

	interface Props {
		label: string;
		type?: 'text' | 'email' | 'password' | 'time' | 'date';
		id: string;
		value?: string;
		required?: boolean;
		autocomplete?: FullAutoFill;
		/**
		 * How the field presents itself. Three, which is what the call sites
		 * always were:
		 *
		 * - `field` — the labelled form field, the default.
		 * - `cell` — a table or modal cell. Smaller, and the label goes to the
		 *   screen reader only.
		 * - `bare` — full size, label for the screen reader only, wording
		 *   carried by the placeholder.
		 *
		 * It replaces two booleans that encoded three variants between them: no
		 * call site ever passed both, one of the four combinations meant
		 * nothing, and the compact one quietly did THREE things.
		 */
		variant?: 'field' | 'cell' | 'bare';
		/** Overrides the label-derived default ('user' rather than 'email'). */
		placeholder?: string;
		error?: string | null;
		/**
		 * A remote form field's attachment (`login.fields.email.as('email')`),
		 * spread onto the input instead of binding — without it every remote
		 * form routes around this module and re-declares the underline styling.
		 */
		attributes?: HTMLInputAttributes;
	}

	let {
		label,
		type = 'text',
		id,
		value = $bindable(''),
		required = false,
		autocomplete,
		variant = 'field',
		placeholder,
		error = null,
		attributes
	}: Props = $props();

	const shared = $derived({
		id,
		type,
		required,
		autocomplete,
		placeholder: placeholder ?? (variant === 'field' ? label.toLowerCase() : undefined),
		'aria-invalid': error ? true : undefined,
		'aria-describedby': error ? `${id}-error` : undefined
	});
</script>

<div class="field" class:cell={variant === 'cell'}>
	<label for={id} class:visually-hidden={variant !== 'field'}>{label}</label>
	{#if attributes}
		<!-- The form owns the value and its name; `type` comes from `as(...)`. -->
		<input {...shared} {...attributes} />
	{:else}
		<input {...shared} bind:value />
	{/if}
	{#if error}
		<p class="error" id="{id}-error">{error}</p>
	{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	label {
		font-size: var(--text-sm);
		font-weight: 500;
	}

	input {
		border: none;
		border-bottom: 1.5px solid var(--color-brand);
		background: transparent;
		padding: 0.4rem 0.1rem;
		font-family: var(--font-sans);
		font-size: var(--text-base);
		color: var(--color-ink);
	}

	input::placeholder {
		font-style: italic;
		color: var(--color-ink-muted);
	}

	input:focus-visible {
		outline: none;
		border-bottom-color: var(--color-navy);
	}

	.cell input {
		font-size: 0.9rem;
		padding: 0.2rem 0.1rem;
	}

	.error {
		color: var(--series-8);
		font-size: 0.8rem;
		margin: 0;
	}
</style>
