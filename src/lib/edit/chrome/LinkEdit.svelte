<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '../../components/ui/Button.svelte';
	import Icon from '../../components/ui/Icon.svelte';
	import Modal from '../../components/ui/Modal.svelte';
	import { getUiConfig } from '../../config/context.js';
	import { getEditAdapter } from '../context.js';
	import type { EditDescriptor, PropertyDescriptor } from '../types.js';

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
	 * with the reason. Without an adapter or a descriptor the control renders
	 * untouched, byte-identical to a read-only build.
	 */
	interface Props {
		/** Inline-label half; undefined leaves the control alone. */
		text: { edit: EditDescriptor | undefined; value: string };
		/** Destination half; undefined hides the Adreça field. */
		href: { descriptor: PropertyDescriptor | undefined; value: string };
		/** Accessible name for the modal, e.g. the link's current text. */
		label?: string;
		control: Snippet;
	}

	let { text, href, label = undefined, control }: Props = $props();

	const adapter = getEditAdapter();
	const config = getUiConfig();
	const messages = $derived(config.editMessages);

	const editing = $derived(text.edit !== undefined && (adapter?.isEditing ?? false));
	// The Adreça field needs both a place to save to and a verb to save with.
	const editsHref = $derived(href.descriptor !== undefined && adapter?.saveProperty !== undefined);

	let open = $state(false);
	let draftText = $state('');
	let draftHref = $state('');
	let saving = $state(false);
	let error = $state<string | null>(null);

	function show(): void {
		draftText = text.value;
		draftHref = href.value;
		error = null;
		open = true;
	}

	/** Escape/Cancel·la/backdrop: discard the drafts, keep the stored values. */
	function cancel(): void {
		if (saving) return;
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
			open = false;
		} catch (thrown) {
			error =
				thrown instanceof Error && thrown.message ? thrown.message : messages.edit_saveError();
		} finally {
			saving = false;
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
		</div>
		{#if error}
			<p class="error" role="alert">{error}</p>
		{/if}
		<div class="actions">
			<Button pending={saving ? 1 : 0} onclick={() => void save()}>{messages.edit_save()}</Button>
			<Button variant="ghost" pending={null} onclick={cancel}>{messages.edit_cancel()}</Button>
		</div>
	</Modal>
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
</style>
