<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { createRemoteFormMock } from '../../../testing/remote-form.js';
	import SignupForm from '../../auth/SignupForm.svelte';

	const { Story } = defineMeta({
		title: 'Auth/SignupForm',
		component: SignupForm,
		// Storybook has no server behind these forms; render-only stand-ins
		// come in through the same props the app fills with the real ones.
		args: {
			signupForm: createRemoteFormMock()
		},
		parameters: {
			docs: {
				description: {
					component:
						'Community registration (display name, email, password) with a honeypot. Submitting inside Storybook has no auth API behind it — the confirmation-email flow needs the real app.'
				}
			}
		}
	});
</script>

<Story name="Default" />
