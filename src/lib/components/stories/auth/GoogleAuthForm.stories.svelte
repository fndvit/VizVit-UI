<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { createRemoteFormMock } from '../../../testing/remote-form.js';
	import GoogleAuthForm from '../../auth/GoogleAuthForm.svelte';

	const { Story } = defineMeta({
		title: 'Auth/GoogleAuthForm',
		component: GoogleAuthForm,
		// Storybook has no server behind these forms; render-only stand-ins
		// come in through the same props the app fills with the real ones.
		args: {
			googleLoginForm: createRemoteFormMock()
		},
		parameters: {
			docs: {
				description: {
					component:
						'Google sign-in button shared by /login and /signup: a first-time Google user gets an account, a returning one signs in. Submitting inside Storybook has no auth API behind it.'
				}
			}
		}
	});
</script>

<Story name="Default" />
