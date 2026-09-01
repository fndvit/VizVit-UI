<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Footer from '../../layout/Footer.svelte';

	const links = [
		{ href: '/what-we-do', label: 'Què fem' },
		{ href: '/who-we-are', label: 'Qui som' },
		{ href: '/weeklies', label: 'Weeklies' },
		{ href: '/transparency', label: 'Transparència' },
		{ href: '/get-involved', label: "Implica-t'hi" }
	];

	const { Story } = defineMeta({
		title: 'Layout/Footer',
		component: Footer,
		args: { links },
		parameters: { layout: 'fullscreen' }
	});
</script>

<Story name="Default" />
