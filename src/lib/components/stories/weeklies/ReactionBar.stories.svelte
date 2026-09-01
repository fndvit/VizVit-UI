<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { createRemoteFormMock } from '../../../testing/remote-form.js';
	import ReactionBar from '../../weeklies/ReactionBar.svelte';

	const sample = [
		{ reaction: 'like', count: 12, mine: true },
		{ reaction: 'love', count: 3, mine: false },
		{ reaction: 'clap', count: 0, mine: false }
	];

	const { Story } = defineMeta({
		title: 'Weeklies/ReactionBar',
		component: ReactionBar,
		// Storybook has no server behind these forms; render-only stand-ins
		// come in through the same props the app fills with the real ones.
		args: {
			weeklyReactionForm: createRemoteFormMock(),
			commentReactionForm: createRemoteFormMock()
		},
		parameters: {
			docs: {
				description: {
					component:
						'Toggleable emoji reactions (one tiny form per reaction — no-JS friendly). Logged out it shows read-only tallies. Toggling inside Storybook has no API behind it.'
				}
			}
		}
	});
</script>

<Story
	name="Logged in"
	args={{ reactions: sample, target: { kind: 'weekly', slug: 'exemple-weekly' }, isLoggedIn: true }}
/>

<Story
	name="Logged out"
	args={{
		reactions: sample,
		target: { kind: 'weekly', slug: 'exemple-weekly' },
		isLoggedIn: false
	}}
/>

<Story
	name="On a comment"
	args={{ reactions: sample, target: { kind: 'comment', id: 7 }, isLoggedIn: true }}
/>
