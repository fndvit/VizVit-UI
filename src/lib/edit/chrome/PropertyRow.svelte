<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { ParameterlessKey } from '../../config/types.js';
	import { getEditAdapter } from '../context.js';
	import { commitState, propertyValue } from '../commit.svelte.js';
	import type { PropertyDescriptor, PropertyValue } from '../types.js';

	/**
	 * One property of an EditPanel: label, a control by `descriptor.type`, and
	 * its own commit lifecycle — literally Editable's now, through
	 * `../commit.svelte.js`, where it used to be a second copy of the same
	 * four states, the same follow-the-prop effect and the same three
	 * announcements. Each row commits on change/blur independently; a failed
	 * save keeps the draft in the control so nothing typed is lost.
	 *
	 * The row assumes an adapter with `saveProperty` exists — EditPanel only
	 * renders when the frame's triple gate already established both.
	 *
	 * The control state is text throughout — a flag's boolean rides as
	 * 'true'/'false' in its <select> and becomes a boolean again only at the
	 * adapter boundary, so one draft/saved pair serves every type.
	 */
	interface Props {
		descriptor: PropertyDescriptor;
		value: PropertyValue;
	}

	let { descriptor, value }: Props = $props();

	const adapter = getEditAdapter();
	const config = getUiConfig();

	/** The control's reading of a property value. */
	const asText = (next: PropertyValue): string =>
		typeof next === 'boolean' ? String(next) : (next ?? '');

	/** A flag state's wording, from the same catalog the site renders. */
	const wording = (key: ParameterlessKey): string => config.messages[key]?.() ?? key;

	// svelte-ignore state_referenced_locally
	const commit_ = commitState(asText(value), config.editMessages);
	// svelte-ignore state_referenced_locally
	let draft = $state(asText(value));
	let fileInput: HTMLInputElement | undefined = $state();

	$effect(() => {
		const adopted = commit_.follow(asText(value));
		if (adopted !== null) draft = adopted;
	});

	async function persist(next: PropertyValue): Promise<void> {
		if (!adapter?.saveProperty) return;
		const landed = await commit_.commit(asText(next), () =>
			adapter.saveProperty!(descriptor, next)
		);
		// Draft stays in the control on failure; the editor decides whether to
		// retry. On success it takes the value the adapter actually stored.
		if (landed) draft = asText(next);
	}

	function commit(): void {
		const trimmed = draft.trim();
		if (trimmed === commit_.saved) {
			commit_.settle();
			return;
		}
		if (descriptor.type === 'flag') {
			void persist(propertyValue(descriptor, trimmed));
			return;
		}
		if (trimmed === '') {
			if (!descriptor.nullable) {
				commit_.refuse(config.editMessages.edit_emptyRequired());
				return;
			}
			void persist(null);
			return;
		}
		void persist(trimmed);
	}

	function markDirty(): void {
		commit_.markDirty();
	}

	async function upload(event: Event): Promise<void> {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file || !adapter?.uploadImage) return;
		try {
			// The upload and the write are ONE gesture to the editor, so the
			// upload runs inside the same commit: a failed upload reports as a
			// failed save, which is what it is from the panel's side.
			await commit_.commit(asText(value), async () => {
				const path = await adapter.uploadImage!(descriptor, file);
				await adapter.saveProperty!(descriptor, path);
				draft = asText(path);
			});
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
			data-vit-editing={commit_.status}
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
	{:else if descriptor.type === 'flag'}
		<!-- Two states, worded from the catalog: the host names the pair
		     (published/draft, open/closed), the adapter receives a boolean. -->
		<select
			{id}
			data-vit-editing={commit_.status}
			value={draft}
			onchange={(event) => {
				draft = event.currentTarget.value;
				commit();
			}}
		>
			<option value="true">{wording(descriptor.on ?? 'status_published')}</option>
			<option value="false">{wording(descriptor.off ?? 'status_draft')}</option>
		</select>
	{:else if descriptor.type === 'image'}
		{#if commit_.saved}
			<img class="thumb" src={commit_.saved} alt="" />
		{/if}
		<input
			{id}
			type="text"
			data-vit-editing={commit_.status}
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
			data-vit-editing={commit_.status}
			placeholder={descriptor.placeholder}
			bind:value={draft}
			oninput={markDirty}
			onchange={commit}
		/>
	{/if}

	{#if descriptor.nullable && commit_.saved !== ''}
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

	<span class="status" role="status">{commit_.announcement}</span>
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
