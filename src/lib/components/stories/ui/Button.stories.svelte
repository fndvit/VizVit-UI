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

<!-- The closed variant × size set. primary md is the pre-variant look. -->
<Story name="Variants">
	{#snippet template()}
		<div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
			<Button pending={null}>Primary</Button>
			<Button pending={null} variant="navy">Navy</Button>
			<Button pending={null} variant="ghost">Ghost</Button>
			<Button pending={null} size="sm">Primary sm</Button>
			<Button pending={null} variant="navy" size="sm">Navy sm</Button>
			<Button pending={null} variant="ghost" size="sm">Ghost sm</Button>
		</div>
	{/snippet}
</Story>

<!-- An anchor styled as a button: downloads, external tools. No pending. -->
<Story name="Anchor">
	{#snippet template()}
		<Button href="/export.csv" download variant="navy">Descarrega CSV</Button>
	{/snippet}
</Story>
