<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { createRemoteFormMock } from '../../../testing/remote-form.js';
	import CommentSection from '../../weeklies/CommentSection.svelte';

	const noReactions = [
		{ reaction: 'like', count: 0, mine: false },
		{ reaction: 'love', count: 0, mine: false },
		{ reaction: 'clap', count: 0, mine: false }
	];

	const sampleComments = [
		{
			id: 1,
			body: 'Quina visualització més clara — gràcies per compartir les fonts!',
			displayName: 'Núria',
			createdAt: '2026-08-10T09:30:00.000Z',
			reactions: [
				{ reaction: 'like', count: 4, mine: true },
				{ reaction: 'love', count: 1, mine: false },
				{ reaction: 'clap', count: 0, mine: false }
			],
			replies: [
				{
					id: 3,
					body: 'Totalment d’acord!',
					displayName: 'Pau',
					createdAt: '2026-08-11T08:00:00.000Z',
					reactions: noReactions
				}
			]
		},
		{
			id: 2,
			body: 'Would love to see this broken down by comarca.',
			displayName: 'Sam',
			createdAt: '2026-08-12T17:05:00.000Z',
			reactions: noReactions,
			replies: []
		}
	];

	const { Story } = defineMeta({
		title: 'Weeklies/CommentSection',
		component: CommentSection,
		// Storybook has no server behind these forms; render-only stand-ins
		// come in through the same props the app fills with the real ones.
		args: {
			commentForm: createRemoteFormMock()
		},
		parameters: {
			docs: {
				description: {
					component:
						'Published comments plus the comment form (logged in) or a login/signup prompt (logged out). Posting inside Storybook has no API behind it.'
				}
			}
		}
	});
</script>

<Story
	name="Logged in"
	args={{ comments: sampleComments, weeklySlug: 'exemple-weekly', isLoggedIn: true }}
/>

<Story
	name="Logged out"
	args={{ comments: sampleComments, weeklySlug: 'exemple-weekly', isLoggedIn: false }}
/>

<Story name="Empty" args={{ comments: [], weeklySlug: 'exemple-weekly', isLoggedIn: false }} />
