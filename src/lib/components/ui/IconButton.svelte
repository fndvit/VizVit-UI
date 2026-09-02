<script lang="ts">
	import Icon, { type IconName } from './Icon.svelte';

	interface Props {
		icon: IconName;
		/** Accessible name — icon-only buttons must say what they do. */
		label: string;
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
	}

	let { icon, label, disabled = false, onclick }: Props = $props();
</script>

<button type="button" aria-label={label} title={label} {disabled} {onclick}>
	<Icon name={icon} size={18} />
</button>

<style>
	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.35rem;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: var(--color-ink);
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	button:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-ink) 8%, transparent);
	}

	button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
