<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { createRemoteFormMock } from '../../../testing/remote-form.js';
	import LoginForm from '../../auth/LoginForm.svelte';

	const { Story } = defineMeta({
		title: 'Auth/LoginForm',
		component: LoginForm,
		// Storybook has no server behind these forms; render-only stand-ins
		// come in through the same props the app fills with the real ones.
		args: {
			loginForm: createRemoteFormMock(),
			magicLinkForm: createRemoteFormMock()
		},
		parameters: {
			docs: {
				description: {
					component:
						'Password, magic-link and Google sign-in forms. Submitting inside Storybook has no auth API behind it — the real flows need the app with the local Supabase stack running.'
				}
			}
		}
	});
</script>

<Story name="Default" />

<Story name="Confirmation link failed" args={{ redirectError: 'confirm' }} />

<Story name="Google sign-in failed" args={{ redirectError: 'oauth' }} />
