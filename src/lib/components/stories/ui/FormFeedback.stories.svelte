<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FormFeedback from '../../ui/FormFeedback.svelte';

	const { Story } = defineMeta({
		title: 'UI/FormFeedback',
		component: FormFeedback
	});
</script>

<Story name="Success">
	{#snippet template()}
		<FormFeedback kind="success">Missatge enviat. Gràcies!</FormFeedback>
	{/snippet}
</Story>

<Story name="Error">
	{#snippet template()}
		<FormFeedback kind="error">No s'ha pogut enviar el missatge.</FormFeedback>
	{/snippet}
</Story>
