<script lang="ts">
	import Button from '../../ui/Button.svelte';

	/**
	 * Test-only host for Button: supplies the label as the children snippet,
	 * the way every real call site does.
	 */
	interface Props {
		pending: number | null;
		disabled?: boolean;
		label?: string;
	}

	let { pending, disabled = false, label = 'Envia' }: Props = $props();
</script>

<Button type="submit" {pending} {disabled}>{label}</Button>
