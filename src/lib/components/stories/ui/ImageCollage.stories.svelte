<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { sampleAreas } from '../../../fixtures.js';
	import ImageCollage from '../../ui/ImageCollage.svelte';

	const { Story } = defineMeta({
		title: 'UI/ImageCollage',
		component: ImageCollage
	});
</script>

<Story name="Four" args={{ images: sampleAreas[0].images }} />
<Story name="Three" args={{ images: sampleAreas[1].images }} />
<Story name="Two" args={{ images: sampleAreas[0].images.slice(0, 2) }} />
<Story name="One" args={{ images: sampleAreas[0].images.slice(0, 1) }} />
