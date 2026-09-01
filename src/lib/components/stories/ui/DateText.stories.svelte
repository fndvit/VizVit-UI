<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DateText from '../../ui/DateText.svelte';

	const { Story } = defineMeta({
		title: 'UI/DateText',
		component: DateText
	});
</script>

<Story name="Date" args={{ value: '2026-03-14' }} />

<!-- A comment's createdAt: the attribute keeps the time, the text shows the day. -->
<Story name="Timestamp" args={{ value: '2026-03-14T09:41:00.000Z' }} />
