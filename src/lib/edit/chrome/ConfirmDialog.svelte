<script lang="ts">
	import Button from '../../components/ui/Button.svelte';
	import Modal from '../../components/ui/Modal.svelte';
	import { getUiConfig } from '../../config/context.js';

	/**
	 * Destructive confirmation over the Modal primitive: native <dialog>
	 * handles top layer, backdrop and Escape. The confirm button turns
	 * destructive by overriding the tokens Button's `primary` reads — a theme
	 * decision expressed as token values, not a new Button variant.
	 */
	interface Props {
		open: boolean;
		title: string;
		message: string;
		confirmLabel: string;
		pending?: boolean;
		onconfirm: () => void;
		oncancel: () => void;
	}

	let {
		open,
		title,
		message,
		confirmLabel,
		pending = false,
		onconfirm,
		oncancel
	}: Props = $props();

	const config = getUiConfig();
</script>

<Modal {open} {title} onclose={oncancel} closeLabel={config.editMessages.edit_close()}>
	<p class="message">{message}</p>
	<div class="actions">
		<span class="danger">
			<Button pending={pending ? 1 : 0} onclick={onconfirm}>{confirmLabel}</Button>
		</span>
		<Button variant="ghost" pending={null} onclick={oncancel}>
			{config.editMessages.edit_cancel()}
		</Button>
	</div>
</Modal>

<style>
	.message {
		margin: 0;
		max-width: 44ch;
	}

	.actions {
		display: flex;
		gap: var(--space-2);
	}

	/* Button's primary fill reads --color-brand (hover --color-navy); the
	   error hue is --series-8, so overriding both here IS the destructive
	   variant — no second styling path inside Button. */
	.danger {
		--color-brand: var(--series-8);
		--color-navy: color-mix(in srgb, var(--series-8) 80%, var(--color-ink));
	}
</style>
