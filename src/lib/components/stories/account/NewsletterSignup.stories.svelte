<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { createRemoteFormMock } from '../../../testing/remote-form.js';
	import NewsletterSignup from '../../account/NewsletterSignup.svelte';

	const { Story } = defineMeta({
		title: 'Account/NewsletterSignup',
		component: NewsletterSignup,
		// Storybook has no server behind these forms; render-only stand-ins
		// come in through the same props the app fills with the real ones.
		args: {
			newsletterToggleForm: createRemoteFormMock()
		},
		parameters: {
			layout: 'fullscreen',
			docs: {
				description: {
					component:
						'Registered-users-only newsletter band: logged out it routes to the auth pages with ?newsletter=1; logged in it offers one-click subscription (email from the session).'
				}
			}
		}
	});
</script>

<Story name="Logged out" args={{ account: null }} />

<Story
	name="Logged in, not subscribed"
	args={{ account: { displayName: 'Núria', newsletterSubscribed: false } }}
/>

<Story name="Subscribed" args={{ account: { displayName: 'Núria', newsletterSubscribed: true } }} />
