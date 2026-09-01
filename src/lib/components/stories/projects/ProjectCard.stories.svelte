<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { sampleProject } from '../../../fixtures.js';
	import ProjectCard from '../../projects/ProjectCard.svelte';

	const { Story } = defineMeta({
		title: 'Projects/ProjectCard',
		component: ProjectCard,
		args: { project: sampleProject }
	});
</script>

<Story name="Grid" args={{ variant: 'grid' }} />
<Story name="Wide" args={{ variant: 'wide' }} />
<Story
	name="ExternalOnly"
	args={{
		variant: 'grid',
		project: { ...sampleProject, hasStory: false, externalUrl: 'https://example.org' }
	}}
/>
