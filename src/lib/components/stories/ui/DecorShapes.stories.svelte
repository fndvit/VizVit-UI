<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DecorShapes from '../../ui/DecorShapes.svelte';

	const { Story } = defineMeta({
		title: 'UI/DecorShapes',
		component: DecorShapes
	});
</script>

<Story name="Default" args={{ flip: false }} />
<Story name="Flipped" args={{ flip: true }} />
