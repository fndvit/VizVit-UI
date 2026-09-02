<script lang="ts">
	import Icon from '../../components/ui/Icon.svelte';
	import { getUiConfig } from '../../config/context.js';
	import { getEditAdapter } from '../context.js';
	import type { EntityOp } from '../types.js';

	/**
	 * The "+" affordance of an editable collection. Renders ONLY while the
	 * adapter is editing AND implements `applyOp` — otherwise nothing, the
	 * byte-identical invariant. The op resolves server-side and the host's
	 * refresh brings the new row in; this control only shows pending/error.
	 */
	interface Props {
		op: Extract<EntityOp, { kind: 'create' }>;
		/** The entity noun for the label, e.g. "una fita". */
		label?: string;
	}

	let { op, label = '' }: Props = $props();

	const adapter = getEditAdapter();
	const config = getUiConfig();

	let pending = $state(false);
	let announcement = $state('');

	const active = $derived((adapter?.isEditing ?? false) && adapter?.applyOp !== undefined);
	const text = $derived(config.editMessages.edit_add({ label }).trim());

	async function add(): Promise<void> {
		if (!adapter?.applyOp || pending) return;
		pending = true;
		announcement = '';
		try {
			await adapter.applyOp(op);
		} catch {
			announcement = config.editMessages.edit_addFailed();
		} finally {
			pending = false;
		}
	}
</script>

{#if active}
	<button type="button" class="add" disabled={pending} onclick={() => void add()}>
		<Icon name="plus" size={16} />
		{text}
	</button>
	<span class="status" role="status">{announcement}</span>
{/if}

<style>
	.add {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-3);
		border: 1px dashed var(--color-ink-muted);
		border-radius: 999px;
		background: transparent;
		color: var(--color-ink);
		font: inherit;
		font-size: var(--text-sm);
		cursor: pointer;
		transition: border-color var(--transition-fast);
	}

	.add:hover:not(:disabled) {
		border-color: var(--color-brand);
		color: var(--color-brand);
	}

	.add:disabled {
		opacity: 0.5;
		cursor: default;
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
