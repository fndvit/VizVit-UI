<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '../../components/ui/Button.svelte';
	import Icon from '../../components/ui/Icon.svelte';
	import Modal from '../../components/ui/Modal.svelte';
	import { getUiConfig } from '../../config/context.js';
	import { getEditAdapter } from '../context.js';
	import type { EditDescriptor, EntityOp, PropertyDescriptor } from '../types.js';
	import ConfirmDialog from './ConfirmDialog.svelte';

	/**
	 * A LINK edited whole: one modal for its text and its destination, instead
	 * of an inline label swap plus a separate property panel — a link's two
	 * halves belong to one gesture.
	 *
	 * While the adapter is editing and a text descriptor is supplied, the
	 * control is REPLACED by a button wearing the label (the ActionLabel rule:
	 * a caret or a click inside a live link would navigate mid-edit) that
	 * opens the modal. Desa commits ONLY the halves that changed — the text
	 * through `adapter.save`, the destination through `adapter.saveProperty` —
	 * so a failure on one keeps the other's success and the modal stays open
	 * with the reason. Extra rows (a menu link's Ordre) and a confirmed
	 * Elimina ride in the same modal when the host supplies them. Without an
	 * adapter or a descriptor the control renders untouched, byte-identical to
	 * a read-only build.
	 */
	interface Props {
		/** Inline-label half; undefined leaves the control alone. */
		text: { edit: EditDescriptor | undefined; value: string };
		/** Destination half; undefined hides the Adreça field. */
		href: { descriptor: PropertyDescriptor | undefined; value: string };
		/**
		 * Extra property rows under Adreça — a menu link's Ordre. Labelled from
		 * their descriptors, committed on Desa only when changed.
		 */
		extras?: { descriptor: PropertyDescriptor; value: string | null }[];
		/** With `adapter.applyOp`, the modal gains a confirmed Elimina action. */
		removeOp?: EntityOp;
		/** Accessible name for the modal, e.g. the link's current text. */
		label?: string;
		control: Snippet;
	}

	let {
		text,
		href,
		extras = undefined,
		removeOp = undefined,
		label = undefined,
		control
	}: Props = $props();

	const adapter = getEditAdapter();
	const config = getUiConfig();
	const messages = $derived(config.editMessages);

	const editing = $derived(text.edit !== undefined && (adapter?.isEditing ?? false));
	// Every field beyond the text needs both a place and a verb to save with.
	const editsHref = $derived(href.descriptor !== undefined && adapter?.saveProperty !== undefined);
	const editableExtras = $derived(adapter?.saveProperty !== undefined ? (extras ?? []) : []);
	const removable = $derived(removeOp !== undefined && adapter?.applyOp !== undefined);

	let open = $state(false);
	let draftText = $state('');
	let draftHref = $state('');
	let draftExtras = $state<string[]>([]);
	let saving = $state(false);
	let confirmingRemove = $state(false);
	let removing = $state(false);
	let error = $state<string | null>(null);

	function show(): void {
		draftText = text.value;
		draftHref = href.value;
		draftExtras = editableExtras.map((extra) => extra.value ?? '');
		error = null;
		open = true;
	}

	/** Escape/Cancel·la/backdrop: discard the drafts, keep the stored values. */
	function cancel(): void {
		if (saving || removing) return;
		open = false;
	}

	async function save(): Promise<void> {
		if (!adapter || text.edit === undefined) return;
		const nextText = draftText.trim();
		const nextHref = draftHref.trim();
		saving = true;
		error = null;
		try {
			// Sequential on purpose: if the text lands and the address fails, the
			// reseeded draft no longer differs, so a retry commits only what is
			// still pending.
			if (nextText !== text.value) {
				await adapter.save(text.edit, nextText);
				draftText = nextText;
			}
			if (editsHref && href.descriptor && nextHref !== href.value) {
				await adapter.saveProperty!(href.descriptor, nextHref);
				draftHref = nextHref;
			}
			for (const [index, extra] of editableExtras.entries()) {
				const next = draftExtras[index].trim();
				if (next === (extra.value ?? '')) continue;
				await adapter.saveProperty!(extra.descriptor, next);
				draftExtras[index] = next;
			}
			open = false;
		} catch (thrown) {
			error =
				thrown instanceof Error && thrown.message ? thrown.message : messages.edit_saveError();
		} finally {
			saving = false;
		}
	}

	/** Confirmed removal closes everything; a failure reports in THIS modal. */
	async function remove(): Promise<void> {
		if (!adapter?.applyOp || removeOp === undefined) return;
		removing = true;
		error = null;
		try {
			await adapter.applyOp(removeOp);
			confirmingRemove = false;
			open = false;
		} catch (thrown) {
			confirmingRemove = false;
			error =
				thrown instanceof Error && thrown.message ? thrown.message : messages.edit_saveError();
		} finally {
			removing = false;
		}
	}
</script>

{#if editing}
	<button
		type="button"
		class="link-swap"
		data-vit-editing="idle"
		aria-label={messages.edit_editLink({ label: label ?? text.value })}
		onclick={show}
	>
		{text.value}
		<Icon name="pencil" size={13} />
	</button>
	<Modal
		{open}
		title={messages.edit_editLink({ label: label ?? text.value })}
		onclose={cancel}
		closeLabel={messages.edit_close()}
	>
		<div class="fields">
			<label>
				<span>{messages.edit_linkText()}</span>
				<input type="text" bind:value={draftText} disabled={saving} />
			</label>
			{#if editsHref}
				<label>
					<span>{messages.edit_linkUrl()}</span>
					<!-- type=text, not url: site destinations are relative paths. -->
					<input type="text" bind:value={draftHref} disabled={saving} />
				</label>
			{/if}
			{#each editableExtras as extra, index (index)}
				<label>
					<span>{extra.descriptor.label}</span>
					<input type="text" bind:value={draftExtras[index]} disabled={saving} />
				</label>
			{/each}
		</div>
		{#if error}
			<p class="error" role="alert">{error}</p>
		{/if}
		<div class="actions">
			<Button pending={saving ? 1 : 0} onclick={() => void save()}>{messages.edit_save()}</Button>
			<Button variant="ghost" pending={null} onclick={cancel}>{messages.edit_cancel()}</Button>
			{#if removable}
				<span class="danger">
					<Button variant="ghost" pending={null} onclick={() => (confirmingRemove = true)}>
						{messages.edit_remove()}
					</Button>
				</span>
			{/if}
		</div>
	</Modal>
	{#if removable}
		<ConfirmDialog
			open={confirmingRemove}
			title={messages.edit_remove()}
			message={messages.edit_removeConfirm({ label: label ?? text.value })}
			confirmLabel={messages.edit_remove()}
			pending={removing}
			onconfirm={() => void remove()}
			oncancel={() => (confirmingRemove = false)}
		/>
	{/if}
{:else}
	{@render control()}
{/if}

<style>
	/* The ActionLabel footprint plus a pencil hint: the same dashed affordance
	   (base.css paints [data-vit-editing]), but a click OPENS rather than
	   focuses — this swap is a button, never a caret. */
	.link-swap {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: 0.2em 0.4em;
		border: none;
		background: transparent;
		font: inherit;
		color: inherit;
		cursor: pointer;
	}

	.fields {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	label {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	/* PropertyRow's control look — the modal is the panel, relocated. */
	input {
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 400;
		color: var(--color-ink);
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--color-hairline);
		border-radius: var(--radius);
		background: var(--color-surface);
		width: 100%;
	}

	.error {
		margin: var(--space-3) 0 0;
		color: var(--series-8);
		font-size: var(--text-sm);
	}

	.actions {
		display: flex;
		gap: var(--space-2);
		margin-top: var(--space-4);
	}

	/* Elimina sits apart from the commit pair, wearing the error hue — the
	   ConfirmDialog token override, reused. */
	.danger {
		margin-left: auto;
		--color-brand: var(--series-8);
		--color-ink: var(--series-8);
	}
</style>
