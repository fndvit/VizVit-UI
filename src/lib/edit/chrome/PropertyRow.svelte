<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import { getEditAdapter } from '../context.js';
	import type { PropertyDescriptor } from '../types.js';

	/**
	 * One property of an EditPanel: label, a control by `descriptor.type`, and
	 * its own commit lifecycle — Editable's state machine, panel-shaped. Each
	 * row commits on change/blur independently; a failed save keeps the draft
	 * in the control so nothing typed is lost.
	 *
	 * The row assumes an adapter with `saveProperty` exists — EditPanel only
	 * renders when the frame's triple gate already established both.
	 */
	interface Props {
		descriptor: PropertyDescriptor;
		value: string | null;
	}

	let { descriptor, value }: Props = $props();

	const adapter = getEditAdapter();
	const config = getUiConfig();

	let status = $state<'idle' | 'dirty' | 'saving' | 'error'>('idle');
	let announcement = $state('');
	/** Last persisted value, what a failed draft is measured against. */
	// svelte-ignore state_referenced_locally
	let savedValue = $state(value ?? '');
	// svelte-ignore state_referenced_locally
	let draft = $state(value ?? '');
	let fileInput: HTMLInputElement | undefined = $state();

	// Follow the prop only while idle — never repaint a held draft (the
	// Editable rule).
	// svelte-ignore state_referenced_locally
	let lastPropValue = $state(value ?? '');
	$effect(() => {
		const next = value ?? '';
		if (next !== lastPropValue) {
			lastPropValue = next;
			if (status === 'idle') {
				savedValue = next;
				draft = next;
			}
		}
	});

	async function persist(next: string | null): Promise<void> {
		if (!adapter?.saveProperty) return;
		status = 'saving';
		announcement = config.editMessages.edit_saving();
		try {
			await adapter.saveProperty(descriptor, next);
			savedValue = next ?? '';
			draft = next ?? '';
			status = 'idle';
			announcement = config.editMessages.edit_saved();
		} catch {
			// Draft stays in the control; the editor decides whether to retry.
			status = 'error';
			announcement = config.editMessages.edit_saveError();
		}
	}

	function commit(): void {
		const trimmed = draft.trim();
		if (trimmed === savedValue) {
			status = 'idle';
			return;
		}
		if (trimmed === '') {
			if (!descriptor.nullable) {
				status = 'error';
				announcement = config.editMessages.edit_emptyRequired();
				return;
			}
			void persist(null);
			return;
		}
		void persist(trimmed);
	}

	function markDirty(): void {
		if (status !== 'saving') status = 'dirty';
	}

	async function upload(event: Event): Promise<void> {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file || !adapter?.uploadImage) return;
		status = 'saving';
		announcement = config.editMessages.edit_saving();
		try {
			const path = await adapter.uploadImage(descriptor, file);
			await persist(path);
		} catch {
			status = 'error';
			announcement = config.editMessages.edit_saveError();
		} finally {
			if (fileInput) fileInput.value = '';
		}
	}

	// One id per instance so the label reaches its control.
	const id = $props.id();
</script>

<div class="row">
	<label for={id}>{descriptor.label}</label>

	{#if descriptor.type === 'select'}
		<select
			{id}
			data-vit-editing={status}
			value={draft}
			onchange={(event) => {
				draft = event.currentTarget.value;
				commit();
			}}
		>
			{#each descriptor.options ?? [] as option (option.value)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	{:else if descriptor.type === 'image'}
		{#if savedValue}
			<img class="thumb" src={savedValue} alt="" />
		{/if}
		<input
			{id}
			type="text"
			data-vit-editing={status}
			placeholder={descriptor.placeholder}
			bind:value={draft}
			oninput={markDirty}
			onchange={commit}
		/>
		{#if adapter?.uploadImage}
			<input
				bind:this={fileInput}
				class="file"
				type="file"
				accept="image/*"
				onchange={(event) => void upload(event)}
				aria-label={config.editMessages.edit_uploadImage()}
			/>
			<button type="button" class="aux" onclick={() => fileInput?.click()}>
				{config.editMessages.edit_uploadImage()}
			</button>
		{/if}
	{:else}
		<input
			{id}
			type={descriptor.type === 'date' ? 'date' : descriptor.type === 'url' ? 'url' : 'text'}
			data-vit-editing={status}
			placeholder={descriptor.placeholder}
			bind:value={draft}
			oninput={markDirty}
			onchange={commit}
		/>
	{/if}

	{#if descriptor.nullable && savedValue !== ''}
		<button
			type="button"
			class="aux"
			onclick={() => {
				draft = '';
				void persist(null);
			}}
		>
			{config.editMessages.edit_clearValue()}
		</button>
	{/if}

	<span class="status" role="status">{announcement}</span>
</div>

<style>
	.row {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	label {
		font-size: var(--text-sm);
		font-weight: 600;
	}

	input:not(.file),
	select {
		font: inherit;
		font-size: var(--text-sm);
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--color-hairline);
		border-radius: var(--radius);
		background: var(--color-surface);
		color: var(--color-ink);
		width: 100%;
	}

	.thumb {
		max-width: 100%;
		max-height: 6rem;
		object-fit: cover;
		border-radius: var(--radius);
	}

	/* The real picker; the styled button drives it. */
	.file {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}

	.aux {
		align-self: flex-start;
		border: none;
		background: none;
		padding: 0;
		font-size: var(--text-sm);
		color: var(--color-brand);
		cursor: pointer;
		text-decoration: underline;
	}

	.status {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
</style>
