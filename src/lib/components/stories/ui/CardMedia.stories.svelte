<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CardMedia from '../../ui/CardMedia.svelte';

	const { Story } = defineMeta({
		title: 'UI/CardMedia',
		component: CardMedia,
		args: { src: '/images/placeholders/wide.svg', alt: '' }
	});
</script>

<Story name="Widescreen" args={{ ratio: '16 / 9', width: '480' }} />
<Story
	name="Square"
	args={{ src: '/images/placeholders/square.svg', ratio: '1 / 1', width: '240' }}
/>
<Story
	name="Portrait"
	args={{ src: '/images/placeholders/portrait.svg', ratio: '4 / 5', width: '240' }}
/>
<Story name="NaturalHeight" args={{ width: '480' }} />
