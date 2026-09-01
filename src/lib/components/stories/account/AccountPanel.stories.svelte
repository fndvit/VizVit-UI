<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { createRemoteFormMock } from '../../../testing/remote-form.js';
	import AccountPanel from '../../account/AccountPanel.svelte';

	const { Story } = defineMeta({
		title: 'Account/AccountPanel',
		component: AccountPanel,
		// Storybook has no server behind these forms; render-only stand-ins
		// come in through the same props the app fills with the real ones.
		args: {
			updateNameForm: createRemoteFormMock(),
			newsletterToggleForm: createRemoteFormMock(),
			deleteAccountForm: createRemoteFormMock(),
			logoutForm: createRemoteFormMock()
		},
		parameters: {
			docs: {
				description: {
					component:
						'Account self-service: display name, newsletter toggle, data export, logout, and account deletion. Submitting inside Storybook has no API behind it.'
				}
			}
		}
	});
</script>

<Story
	name="Subscribed"
	args={{
		displayName: 'Núria',
		email: 'nuria@example.org',
		isSubscribed: true,
		canDelete: true
	}}
/>

<Story
	name="Not subscribed"
	args={{
		displayName: 'Núria',
		email: 'nuria@example.org',
		isSubscribed: false,
		canDelete: true
	}}
/>

<Story
	name="Deletion unavailable"
	args={{
		displayName: 'Núria',
		email: 'nuria@example.org',
		isSubscribed: false,
		canDelete: false
	}}
/>
