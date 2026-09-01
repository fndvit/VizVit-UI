<script lang="ts">
	import { NEWSLETTER_INTENT_VALUE } from '../../forms/transport.js';

	/**
	 * The hidden `newsletter` input that carries a newsletter intent through a
	 * form post. The fourth of the intent's four transports, and the last one to
	 * read its owner: the host app's cookie and URL query
	 * transports both take the value from `NEWSLETTER_INTENT_VALUE`,
	 * while the two markup sites spelled `'1'` and imported nothing.
	 *
	 * That matters because the schema is `z.literal(NEWSLETTER_INTENT_VALUE)`:
	 * changing the owner turns a hand-written literal into a submission that
	 * fails validation on a field the reader cannot see. Dropping the input
	 * instead loses the opt-in after the OAuth roundtrip, with no error and no
	 * red test — the silent-failure shape LocaleField and Honeypot each own a
	 * module for.
	 *
	 * Whether intent is being carried is the caller's fact and stays at the call
	 * site; how it is encoded is this module's. Signup is not a caller: its
	 * consent block binds `z.boolean()` through a visible checkbox, not the
	 * intent literal.
	 */
	interface Props {
		/** The form's `newsletter` field: `form.fields.newsletter`. */
		field: { as(type: 'hidden', value: string): Record<string, unknown> };
	}

	let { field }: Props = $props();
</script>

<input {...field.as('hidden', NEWSLETTER_INTENT_VALUE)} />
