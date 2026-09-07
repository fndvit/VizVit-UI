<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * The floating layer an EditFrame opens its panel in. Absolutely
	 * positioned INSIDE the frame (no portal: in-flow positioning needs no
	 * SSR-unfriendly machinery, and modality is only for destructive confirm,
	 * which native <dialog> covers). Escape and outside pointerdown close it;
	 * the OPENER owns focus return, because only it knows its own element —
	 * the Nav menu pattern.
	 */
	interface Props {
		label: string;
		onclose: () => void;
		children: Snippet;
	}

	let { label, onclose, children }: Props = $props();

	let popover: HTMLDivElement | undefined = $state();

	// Focus the first control so the keyboard lands where the caret goes.
	$effect(() => {
		popover?.querySelector<HTMLElement>('input, select, textarea, button, [tabindex]')?.focus();
	});

	function onWindowKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') onclose();
	}

	function onWindowPointerdown(event: PointerEvent): void {
		// The opening click's pointerdown fired before this listener existed,
		// so only genuinely outside presses land here.
		if (popover && !popover.contains(event.target as Node)) onclose();
	}
</script>

<svelte:window onkeydown={onWindowKeydown} onpointerdown={onWindowPointerdown} />

<div class="popover" role="dialog" aria-label={label} bind:this={popover}>
	{@render children()}
</div>

<style>
	.popover {
		position: absolute;
		top: var(--space-2);
		right: var(--space-2);
		width: min(20rem, 90vw);
		z-index: var(--z-overlay);
		background: var(--color-surface);
		border: 1px solid var(--color-hairline);
		border-radius: var(--radius);
		box-shadow: var(--shadow-2);
		padding: var(--space-3);
	}
</style>
