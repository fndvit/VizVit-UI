<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconButton from './IconButton.svelte';

	interface Props {
		open: boolean;
		title: string;
		onclose: () => void;
		/** Accessible name of the close control. A prop, not a UiMessages key:
		 * `messages` is replaced wholesale by hosts, and a new required key
		 * would break every existing catalog. */
		closeLabel?: string;
		children: Snippet;
	}

	let { open, title, onclose, closeLabel = 'Tanca', children }: Props = $props();

	let dialog: HTMLDialogElement | undefined = $state();

	// Native <dialog>: showModal() traps focus and layers the backdrop; the
	// cancel event covers Escape.
	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});

	function onclick(event: MouseEvent) {
		// Backdrop click: the dialog element itself is the target only outside
		// the panel content.
		if (event.target === dialog) onclose();
	}
</script>

<dialog bind:this={dialog} oncancel={onclose} {onclick}>
	<div class="panel">
		<div class="top">
			<h2>{title}</h2>
			<IconButton icon="close" label={closeLabel} onclick={onclose} />
		</div>
		{@render children()}
	</div>
</dialog>

<style>
	dialog {
		margin: auto;
		border: none;
		border-radius: var(--radius);
		padding: 0;
		background: var(--color-surface);
		box-shadow: var(--shadow-2);
		min-width: min(34rem, 90vw);
	}

	dialog::backdrop {
		background: color-mix(in srgb, var(--color-ink) 45%, transparent);
	}

	.panel {
		padding: var(--space-4) var(--space-5) var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
	}

	h2 {
		font-weight: 600;
		font-size: var(--text-lg);
		margin: 0;
	}
</style>
