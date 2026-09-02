<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconButton from '../../components/ui/IconButton.svelte';
	import { getUiConfig } from '../../config/context.js';
	import { getEditAdapter } from '../context.js';
	import type { EntityOp } from '../types.js';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import EditPopover from './EditPopover.svelte';

	/** What one framed component tells the frame about itself. */
	export interface EditFrameSpec {
		/** Human name of the thing, e.g. "Fita: Neix la fundació". */
		label: string;
		/** Gates the gear — true when the panel snippet has rows to show. */
		hasPanel?: boolean;
		/** Gates the trash: removing this item from its collection. */
		removeOp?: Extract<EntityOp, { kind: 'remove' }>;
	}

	/**
	 * The page-builder wrapper: a corner toolbar (revealed on hover AND
	 * :focus-within — never hover-only) with a gear that opens the property
	 * panel and a trash that confirms, then applies the remove op.
	 *
	 * Triple-gated per affordance: spec present ∧ adapter editing ∧ the
	 * capability method present. With nothing to offer it renders the children
	 * ALONE — zero wrapper element, so an unadapted app's DOM is byte-identical
	 * (pinned by test). Components mount it INSIDE their own root element, so
	 * the wrapper never disturbs the parent's flex/grid.
	 */
	interface Props {
		spec?: EditFrameSpec;
		/** The panel content — an EditPanel with this component's rows. */
		panel?: Snippet;
		children: Snippet;
	}

	let { spec, panel, children }: Props = $props();

	const adapter = getEditAdapter();
	const config = getUiConfig();

	const editing = $derived(spec !== undefined && (adapter?.isEditing ?? false));
	const showGear = $derived(
		editing && spec?.hasPanel === true && panel !== undefined && adapter?.saveProperty !== undefined
	);
	const showTrash = $derived(
		editing && spec?.removeOp !== undefined && adapter?.applyOp !== undefined
	);
	const framed = $derived(showGear || showTrash);

	let panelOpen = $state(false);
	let confirming = $state(false);
	let removing = $state(false);
	let announcement = $state('');
	let toolbar: HTMLDivElement | undefined = $state();

	function closePanel(): void {
		panelOpen = false;
		// The popover owned focus; hand it back to the control that opened it.
		toolbar?.querySelector('button')?.focus();
	}

	async function remove(): Promise<void> {
		if (!adapter?.applyOp || !spec?.removeOp) return;
		removing = true;
		try {
			await adapter.applyOp(spec.removeOp);
			// The host's refresh unmounts this frame with the removed item.
			confirming = false;
		} catch {
			confirming = false;
			announcement = config.editMessages.edit_saveError();
		} finally {
			removing = false;
		}
	}
</script>

{#if framed && spec}
	<div class="vit-edit-frame">
		{@render children()}
		<div class="toolbar" bind:this={toolbar}>
			{#if showGear}
				<IconButton
					icon="gear"
					label={config.editMessages.edit_properties({ label: spec.label })}
					onclick={() => (panelOpen = !panelOpen)}
				/>
			{/if}
			{#if showTrash}
				<IconButton
					icon="trash"
					label={config.editMessages.edit_remove()}
					onclick={() => (confirming = true)}
				/>
			{/if}
		</div>
		{#if panelOpen && panel}
			<EditPopover
				label={config.editMessages.edit_properties({ label: spec.label })}
				onclose={closePanel}
			>
				{@render panel()}
			</EditPopover>
		{/if}
		{#if showTrash}
			<ConfirmDialog
				open={confirming}
				title={config.editMessages.edit_remove()}
				message={config.editMessages.edit_removeConfirm({ label: spec.label })}
				confirmLabel={config.editMessages.edit_remove()}
				pending={removing}
				onconfirm={() => void remove()}
				oncancel={() => (confirming = false)}
			/>
		{/if}
		<span class="status" role="status">{announcement}</span>
	</div>
{:else}
	{@render children()}
{/if}

<style>
	.vit-edit-frame {
		position: relative;
		border-radius: var(--radius);
		outline: 1px dashed transparent;
		outline-offset: 4px;
		transition: outline-color var(--transition-fast);
	}

	.vit-edit-frame:hover,
	.vit-edit-frame:focus-within {
		outline-color: var(--color-brand);
	}

	.toolbar {
		position: absolute;
		top: calc(-1 * var(--space-2));
		right: 0;
		display: flex;
		gap: 2px;
		z-index: var(--z-raised);
		background: var(--color-surface);
		border: 1px solid var(--color-hairline);
		border-radius: var(--radius);
		box-shadow: var(--shadow-1);
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--transition-fast);
	}

	.vit-edit-frame:hover .toolbar,
	.vit-edit-frame:focus-within .toolbar {
		opacity: 1;
		pointer-events: auto;
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
