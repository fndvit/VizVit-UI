<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AdminShell from '../../admin/AdminShell.svelte';
	import Logo from '../../ui/Logo.svelte';
	import PageHeading from '../../admin/PageHeading.svelte';

	import type { SidebarItem } from '../../admin/Sidebar.svelte';

	const { Story } = defineMeta({
		title: 'Admin/AdminShell',
		component: AdminShell
	});

	const items: SidebarItem[] = [
		{ href: '/', icon: 'home', label: 'Inici' },
		{ href: '/time-control', icon: 'clock', label: 'Control horari' },
		{ href: '/website', icon: 'globe', label: 'Web' },
		{ href: '/settings', icon: 'gear', label: 'Configuració' }
	];
</script>

<!-- The generic admin shell: the host hands it permission-filtered items,
     its logo, and its own logout control. -->
<Story name="Default">
	{#snippet template()}
		<AdminShell {items} url={new URL('http://localhost/website')}>
			{#snippet logo()}
				<a href="/" aria-label="Inici" style="color: var(--color-ink); display: inline-flex;">
					<Logo size={30} />
				</a>
			{/snippet}
			{#snippet footer()}
				<button type="button" aria-label="Surt" title="Surt">⏻</button>
			{/snippet}
			<div style="padding: 3rem;">
				<PageHeading accent="El" rest="Web" />
				<p>El contingut de la pàgina viu aquí.</p>
			</div>
		</AdminShell>
	{/snippet}
</Story>
