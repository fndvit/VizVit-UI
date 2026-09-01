<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from '../../ui/Button.svelte';

	const { Story } = defineMeta({
		title: 'UI/Button',
		component: Button
	});
</script>

<!-- A control with no remote form behind it says so, rather than saying nothing. -->
<Story name="Default">
	{#snippet template()}
		<Button pending={null}>Envia</Button>
	{/snippet}
</Story>

<!-- Unavailable for a reason of its own, not because it is posting. -->
<Story name="Disabled">
	{#snippet template()}
		<Button pending={null} disabled>Enviant…</Button>
	{/snippet}
</Story>

<!-- Mid-submit: the count comes straight off the remote form. -->
<Story name="Pending">
	{#snippet template()}
		<Button pending={1}>Enviant…</Button>
	{/snippet}
</Story>
