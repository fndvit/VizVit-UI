<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SplashHero from '../../layout/SplashHero.svelte';

	const { Story } = defineMeta({
		title: 'Layout/SplashHero',
		component: SplashHero,
		parameters: { layout: 'fullscreen' },
		args: {
			title: 'Fundació Visualització per a la Transparència',
			tagline:
				"La visualització pot **transformar** l'abast de les dades obertes i revolucionar la **transparència** i el **retiment de comptes**."
		}
	});
</script>

<Story name="Default" />
<Story name="AnotherMosaic" args={{ seed: 21 }} />
