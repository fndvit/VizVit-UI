<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import EditModeDemo from './EditModeDemo.svelte';

	const { Story } = defineMeta({
		title: 'Edit mode/EditMode',
		component: EditModeDemo,
		parameters: { layout: 'padded' }
	});
</script>

<!-- Click any outlined text, type, and blur or press Enter; saves land in the log. -->
<Story name="Interactive" />

<!-- Every save rejects: the outline turns to the error slot and the draft stays. -->
<Story name="Failing saves" args={{ failing: true }} />
