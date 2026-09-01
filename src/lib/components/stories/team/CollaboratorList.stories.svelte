<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { sampleCollaborators } from '../../../fixtures.js';
	import CollaboratorList from '../../team/CollaboratorList.svelte';

	const { Story } = defineMeta({
		title: 'Team/CollaboratorList',
		component: CollaboratorList
	});
</script>

<Story name="Default" args={{ collaborators: sampleCollaborators }} />
