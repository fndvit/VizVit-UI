<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Pagination from '../../ui/Pagination.svelte';

	const href = (page: number): string => (page > 1 ? `/weeklies?page=${page}` : '/weeklies');

	const { Story } = defineMeta({
		title: 'UI/Pagination',
		component: Pagination,
		args: { total: 30, pageSize: 12, href }
	});
</script>

<!-- Three pages of twelve: the first and last pages lose one of the two links. -->
<Story name="FirstPage" args={{ page: 1 }} />
<Story name="MiddlePage" args={{ page: 2 }} />
<Story name="LastPage" args={{ page: 3 }} />
<!-- A single page renders nothing at all. -->
<Story name="SinglePage" args={{ page: 1, total: 12 }} />
