<script lang="ts">
	import IconButton from '../../components/ui/IconButton.svelte';
	import { getUiConfig } from '../../config/context.js';
	import { getEditAdapter, getRecordFrame } from '../context.js';
	import type { EditFrameProps } from '../chrome-props.js';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import EditPopover from './EditPopover.svelte';

	/**
	 * The page-builder wrapper: a corner toolbar (revealed on hover AND
	 * :focus-within — never hover-only) with ONE door to the row — a pencil
	 * that opens the host's record editor, or, for a host without one, a gear
	 * that opens the property panel — and a trash that confirms, then applies
	 * the remove op.
	 *
	 * Triple-gated per affordance: spec present ∧ adapter editing ∧ the
	 * capability method present. With nothing to offer it renders the children
	 * ALONE — zero wrapper element, so an unadapted app's DOM is byte-identical
	 * (pinned by test). Components mount it INSIDE their own root element, so
	 * the wrapper never disturbs the parent's flex/grid.
	 */
	let { spec, panel, children }: EditFrameProps = $props();

	const adapter = getEditAdapter();
	const config = getUiConfig();

	const editing = $derived(spec !== undefined && (adapter?.isEditing ?? false));
	const opensRecord = getRecordFrame();
	// The pencil: the host's full form for this row, where a panel is the
	// wrong shape (three languages of text, a photo, a slug). Whether this
	// frame opens a record is the gate's answer — the one `Editable` reads to
	// go inert inside it — so the two can never disagree.
	const showPencil = $derived(opensRecord?.() ?? false);
	// ONE door: the form holds everything the panel would, so where the
	// form is offered the panel is not — two buttons for overlapping fields
	// read as two things to learn. A host without a form keeps the panel.
	// Both doors wear the same pencil: to the person editing, either one is
	// "edit this", and a second icon only asked what the difference was.
	const showGear = $derived(
		!showPencil &&
			editing &&
			spec?.hasPanel === true &&
			panel !== undefined &&
			adapter?.saveProperty !== undefined
	);
	const showTrash = $derived(
		editing && spec?.removeOp !== undefined && adapter?.applyOp !== undefined
	);
	const framed = $derived(showGear || showTrash || showPencil);

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
					icon="pencil"
					label={config.editMessages.edit_properties({ label: spec.label })}
					onclick={() => (panelOpen = !panelOpen)}
				/>
			{/if}
			{#if showPencil && spec.record}
				{@const record = spec.record}
				<IconButton
					icon="pencil"
					label={config.editMessages.edit_editRecord({ label: spec.label })}
					onclick={() => adapter?.openRecord?.(record)}
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
	}

	/* The ring is a layer ABOVE the frame's own content and inside its box:
	   an outline paints outside the box, where the next card or section
	   painted over it, and an inset shadow on the frame itself would sit
	   under its image. */
	.vit-edit-frame::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: inset 0 0 0 1px transparent;
		pointer-events: none;
		z-index: var(--z-raised);
		transition: box-shadow var(--transition-fast);
	}

	.vit-edit-frame:hover::after,
	.vit-edit-frame:focus-within::after {
		box-shadow: inset 0 0 0 1px var(--color-brand);
	}

	.toolbar {
		/* Inside the frame's corner, so it never floats over what sits above. */
		position: absolute;
		top: var(--space-1);
		right: var(--space-1);
		display: flex;
		gap: 2px;
		z-index: calc(var(--z-raised) + 1);
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
