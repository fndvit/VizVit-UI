<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RichText from '../../ui/RichText.svelte';

	const body = [
		'## Per què importa',
		'La distància entre planetes és tan gran que cap mapa a escala cap en una pantalla.',
		'Aquest exercici ho fa tangible amb objectes quotidians.'
	].join('\n\n');

	const { Story } = defineMeta({
		title: 'UI/RichText',
		component: RichText
	});
</script>

<Story name="Default" args={{ body }} />
