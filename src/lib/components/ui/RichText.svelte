<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import { renderBody } from '../../content/richtext.js';
	import { getEditAdapter } from '../../edit/context.js';
	import type { EditDescriptor } from '../../edit/types.js';
	import Button from './Button.svelte';
	import GhostButton from './GhostButton.svelte';

	/**
	 * Renders the block mini-format (`## ` subheadings, blank-line paragraphs)
	 * with real elements — never `{@html}`.
	 *
	 * With an `edit` descriptor and an active adapter it offers a source
	 * editor: the mini-format *is* the stored format, so a textarea over the
	 * raw body with a live preview underneath is the honest v1. A block-level
	 * WYSIWYG is future work; the save contract would not change.
	 */
	interface Props {
		body: string;
		/** Marks the body editable where an edit adapter is active. */
		edit?: EditDescriptor;
	}

	let { body, edit }: Props = $props();

	const adapter = getEditAdapter();
	const config = getUiConfig();
	const canEdit = $derived(edit !== undefined && (adapter?.isEditing ?? false));

	/** Last persisted body: what renders, and what Cancel·la returns to. */
	// svelte-ignore state_referenced_locally
	let savedBody = $state(body);
	let draft = $state('');
	let isOpen = $state(false);
	let status = $state<'idle' | 'saving' | 'error'>('idle');

	// Follow the prop when the app reloads content — and only then (after a
	// save, savedBody has legitimately advanced past the prop). Never over an
	// open editor.
	// svelte-ignore state_referenced_locally
	let lastPropBody = $state(body);
	$effect(() => {
		if (body !== lastPropBody) {
			lastPropBody = body;
			if (!isOpen) savedBody = body;
		}
	});

	const blocks = $derived(renderBody(savedBody));
	const preview = $derived(renderBody(draft));

	function open(): void {
		draft = savedBody;
		status = 'idle';
		isOpen = true;
	}

	function cancel(): void {
		isOpen = false;
		status = 'idle';
	}

	async function save(): Promise<void> {
		if (!edit || !adapter) return;
		status = 'saving';
		try {
			await adapter.save(edit, draft);
			savedBody = draft;
			isOpen = false;
			status = 'idle';
		} catch {
			// The draft stays in the textarea; the reader decides whether to retry.
			status = 'error';
		}
	}
</script>

{#if canEdit && isOpen}
	<div class="editor">
		<textarea
			class="control"
			bind:value={draft}
			rows={Math.max(6, draft.split('\n').length + 1)}
			aria-label={edit?.label ?? config.editMessages.edit_editBody()}
		></textarea>
		<div class="actions">
			<Button pending={status === 'saving' ? 1 : 0} onclick={() => void save()}>
				{config.editMessages.edit_save()}
			</Button>
			<GhostButton onclick={cancel}>{config.editMessages.edit_cancel()}</GhostButton>
			{#if status === 'error'}
				<p class="error" role="alert">{config.editMessages.edit_saveError()}. Torna-ho a provar.</p>
			{/if}
		</div>
		<div class="richtext preview" aria-label={config.editMessages.edit_preview()}>
			{#each preview as block, index (index)}
				{#if block.type === 'h2'}
					<h2>{block.text}</h2>
				{:else}
					<p>{block.text}</p>
				{/if}
			{/each}
		</div>
	</div>
{:else}
	<div class="richtext">
		{#each blocks as block, index (index)}
			{#if block.type === 'h2'}
				<h2>{block.text}</h2>
			{:else}
				<p>{block.text}</p>
			{/if}
		{/each}
		{#if canEdit}
			<p class="edit-row">
				<GhostButton onclick={open}>{config.editMessages.edit_edit()}</GhostButton>
			</p>
		{/if}
	</div>
{/if}

<style>
	.richtext {
		max-width: 65ch;
	}

	h2 {
		font-size: var(--text-lg);
		margin-block: var(--space-4) var(--space-2);
	}

	.editor {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		max-width: 65ch;
	}

	textarea {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		font: inherit;
		resize: vertical;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.error {
		margin: 0;
		color: var(--series-8);
		font-size: var(--text-sm);
	}

	.preview {
		border-top: 1px dashed var(--color-hairline);
		padding-top: var(--space-3);
	}

	.edit-row {
		margin: var(--space-2) 0 0;
	}
</style>
