<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MadlibHost from './MadlibHost.svelte';

	const { Story } = defineMeta({
		title: 'Madlib/Madlib',
		component: MadlibHost,
		parameters: { layout: 'padded' }
	});
</script>

<!-- Every blank a dropdown: the plain sentence. -->
<Story name="Dropdowns" />

<!-- The first level as a toggle: a two-way headline over the rest. -->
<Story name="Toggle headline" args={{ headline: true }} />

<!-- The same component, restyled through its tokens: a serif sentence with a coloured accent. -->
<Story name="Themed" args={{ headline: true, themed: true }} />

<!-- Cycling through every sentence until the reader touches a control. -->
<Story name="Cycling" args={{ headline: true, cycling: true }} />
