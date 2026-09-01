<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { sampleMember } from '../../../fixtures.js';
	import TeamMemberCard from '../../team/TeamMemberCard.svelte';

	const { Story } = defineMeta({
		title: 'Team/TeamMemberCard',
		component: TeamMemberCard,
		args: { member: sampleMember }
	});
</script>

<Story name="Board" args={{ variant: 'board' }} />
<Story name="Featured" args={{ variant: 'featured' }} />
