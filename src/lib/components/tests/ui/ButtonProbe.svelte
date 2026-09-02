<script lang="ts">
	import Button from '../../ui/Button.svelte';

	/**
	 * Test-only host for Button: supplies the label as the children snippet,
	 * the way every real call site does. The two prop branches (form button vs
	 * anchor) are exercised through `href`.
	 */
	interface Props {
		pending?: number | null;
		disabled?: boolean;
		variant?: 'primary' | 'navy' | 'ghost';
		size?: 'md' | 'sm';
		href?: string;
		download?: boolean;
		label?: string;
	}

	let {
		pending = null,
		disabled = false,
		variant = 'primary',
		size = 'md',
		href = undefined,
		download = false,
		label = 'Envia'
	}: Props = $props();
</script>

{#if href !== undefined}
	<Button {variant} {size} {href} {download}>{label}</Button>
{:else}
	<Button type="submit" {pending} {disabled} {variant} {size}>{label}</Button>
{/if}
