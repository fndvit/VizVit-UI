<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import GhostButton from '../../ui/GhostButton.svelte';

	const { Story } = defineMeta({
		title: 'UI/GhostButton',
		component: GhostButton
	});
</script>

<Story name="Ghost">
	{#snippet template()}
		<GhostButton>Copia l'enllaç</GhostButton>
	{/snippet}
</Story>

<Story name="Chip">
	{#snippet template()}
		<GhostButton variant="chip" aria-pressed="false">Ciència</GhostButton>
	{/snippet}
</Story>

<Story name="ChipPressed">
	{#snippet template()}
		<GhostButton variant="chip" aria-pressed="true">Ciència</GhostButton>
	{/snippet}
</Story>
