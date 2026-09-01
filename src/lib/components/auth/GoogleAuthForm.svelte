<script module lang="ts">
	import type { RemoteField, RemoteFormInstance } from '../../forms/types.js';

	/** The Google-login remote form (no preflight: it has no typed fields to check). */
	export type GoogleLoginFormInstance = RemoteFormInstance<{
		newsletter: RemoteField;
		locale: RemoteField;
	}>;
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import Button from '../ui/Button.svelte';
	import FormErrorFeedback from '../ui/FormErrorFeedback.svelte';
	import LocaleField from '../ui/LocaleField.svelte';
	import NewsletterIntentField from '../ui/NewsletterIntentField.svelte';

	interface Props {
		/**
		 * Newsletter intent to carry: the band's ?newsletter=1 on /login, or
		 * the live state of the signup page's single consent block.
		 */
		newsletterIntent?: boolean;
		/**
		 * Refuse the submission until consent is given (signup page, mirroring
		 * the shared terms checkbox). Whether consent is owed *yet* is the
		 * signup consent gate's question, not this module's — it reports false
		 * before hydration so the no-JS fallback stays usable. /login has no
		 * consent block and passes nothing.
		 */
		requireConsent?: boolean;
		/** The remote form the host page passes in. */
		googleLoginForm: GoogleLoginFormInstance;
	}

	let { newsletterIntent = false, requireConsent = false, googleLoginForm }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);

	// One button for both journeys: with public signups open, a first-time
	// Google sign-in creates the account, a returning one just logs in.
	const google = $derived(googleLoginForm);
</script>

<div class="google">
	<p class="divider" role="separator">{msg.login_divider()}</p>

	<form class="form-stack" {...google}>
		{#if newsletterIntent}
			<!-- Mirrors the single consent block (signup) or the band's intent
			     (login); the field module owns the encoding. -->
			<NewsletterIntentField field={google.fields.newsletter} />
		{/if}
		<LocaleField field={google.fields.locale} />
		<div class="actions">
			<Button type="submit" pending={google.pending} disabled={requireConsent}>
				{msg.login_googleSubmit()}
			</Button>
		</div>
		<FormErrorFeedback result={google.result} />
	</form>
</div>

<style>
	.google {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		max-width: 24rem;
	}
</style>
