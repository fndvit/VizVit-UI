<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import { withNewsletterIntent } from '../../forms/transport.js';
	import type { NewsletterToggleFormInstance } from './AccountPanel.svelte';
	import Button from '../ui/Button.svelte';
	import FormResultSlot from '../ui/FormResultSlot.svelte';
	import Link from '../ui/Link.svelte';
	import LocaleField from '../ui/LocaleField.svelte';

	interface Props {
		/** From the root layout: null when logged out. */
		account?: { displayName: string; newsletterSubscribed: boolean } | null;
		/** The remote form the host layout passes in. */
		newsletterToggleForm: NewsletterToggleFormInstance;
	}

	let { account = null, newsletterToggleForm }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);

	// The newsletter is registered-users-only (the account email is already
	// verified — no app mail needed). Logged out, the band routes to the auth
	// pages carrying the intent as ?newsletter=1 (never an email in a URL).
	const f = $derived(newsletterToggleForm);
</script>

<section class="newsletter" aria-labelledby="newsletter-title">
	<div class="inner band">
		<h2 id="newsletter-title">{msg.newsletter_title()}</h2>
		<p>{msg.newsletter_intro()}</p>

		{#if account === null}
			<p class="prompt">
				{msg.newsletter_promptLoggedOut()}
				<Link href={withNewsletterIntent('/signup')}>{msg.comments_signupLink()}</Link>
				·
				<Link href={withNewsletterIntent('/login')}>{msg.comments_loginLink()}</Link>
			</p>
		{:else if account.newsletterSubscribed}
			<p class="prompt">
				{msg.newsletter_subscribedNote()}
				<Link href="/account">{msg.account_navLabel()}</Link>
			</p>
		{:else}
			<form {...f}>
				<input {...f.fields.action.as('hidden', 'subscribe')} />
				<LocaleField field={f.fields.locale} />
				<Button type="submit" pending={f.pending}>
					{msg.account_newsletterSubscribe()}
				</Button>
			</form>
			{#if f.result}
				<div class="feedback-slot">
					<FormResultSlot result={f.result} successMessage={msg.account_newsletterSuccessOn()} />
				</div>
			{/if}
		{/if}
	</div>
</section>

<style>
	.newsletter {
		background: var(--color-band-grey);
	}

	.inner {
		text-align: center;
	}

	h2 {
		text-transform: uppercase;
		letter-spacing: 0.15em;
		font-size: var(--text-lg);
	}

	.prompt {
		color: var(--color-ink-secondary);
	}

	form {
		display: flex;
		justify-content: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.feedback-slot {
		margin-top: var(--space-3);
	}
</style>
