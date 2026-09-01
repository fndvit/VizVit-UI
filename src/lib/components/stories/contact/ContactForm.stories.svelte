<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { createRemoteFormMock } from '../../../testing/remote-form.js';
	import ContactForm from '../../contact/ContactForm.svelte';

	const { Story } = defineMeta({
		title: 'Get Involved/ContactForm',
		component: ContactForm,
		// Storybook has no server behind these forms; render-only stand-ins
		// come in through the same props the app fills with the real ones.
		args: {
			form: createRemoteFormMock()
		},
		parameters: {
			docs: {
				description: {
					component:
						'Submitting inside Storybook has no API behind it, so the error state shows after submit — the success path needs the real app.'
				}
			}
		}
	});
</script>

<Story name="Default" />
