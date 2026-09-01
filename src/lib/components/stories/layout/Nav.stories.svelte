<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Nav from '../../layout/Nav.svelte';

	const links = [
		{ href: '/what-we-do', label: 'Què fem' },
		{ href: '/who-we-are', label: 'Qui som' },
		{ href: '/weeklies', label: 'Weeklies' },
		{ href: '/transparency', label: 'Transparència' },
		{ href: '/get-involved', label: "Implica-t'hi" }
	];

	const { Story } = defineMeta({
		title: 'Layout/Nav',
		component: Nav,
		args: { links },
		parameters: { layout: 'fullscreen' }
	});
</script>

<Story name="Default" />

<Story name="Logged in" args={{ account: { displayName: 'Núria' } }} />
