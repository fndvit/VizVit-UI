<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import ActionLabel from '../../edit/ActionLabel.svelte';
	import Editable from '../../edit/Editable.svelte';
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
		<Editable edit={config.messageEdit?.('newsletter_title')} value={msg.newsletter_title()}>
			{#snippet children(text, attrs)}<h2 id="newsletter-title" {...attrs}>{text}</h2>{/snippet}
		</Editable>
		<Editable edit={config.messageEdit?.('newsletter_intro')} value={msg.newsletter_intro()}>
			{#snippet children(text, attrs)}<p {...attrs}>{text}</p>{/snippet}
		</Editable>

		{#if account === null}
			<p class="prompt">
				<Editable
					edit={config.messageEdit?.('newsletter_promptLoggedOut')}
					value={msg.newsletter_promptLoggedOut()}
				>
					{#snippet children(text, attrs)}<span {...attrs}>{text}</span>{/snippet}
				</Editable>
				<ActionLabel
					edit={config.messageEdit?.('comments_signupLink')}
					value={msg.comments_signupLink()}
				>
					{#snippet control()}<Link href={withNewsletterIntent('/signup')}
							>{msg.comments_signupLink()}</Link
						>{/snippet}
				</ActionLabel>
				·
				<ActionLabel
					edit={config.messageEdit?.('comments_loginLink')}
					value={msg.comments_loginLink()}
				>
					{#snippet control()}<Link href={withNewsletterIntent('/login')}
							>{msg.comments_loginLink()}</Link
						>{/snippet}
				</ActionLabel>
			</p>
		{:else if account.newsletterSubscribed}
			<p class="prompt">
				<Editable
					edit={config.messageEdit?.('newsletter_subscribedNote')}
					value={msg.newsletter_subscribedNote()}
				>
					{#snippet children(text, attrs)}<span {...attrs}>{text}</span>{/snippet}
				</Editable>
				<ActionLabel edit={config.messageEdit?.('account_navLabel')} value={msg.account_navLabel()}>
					{#snippet control()}<Link href="/account">{msg.account_navLabel()}</Link>{/snippet}
				</ActionLabel>
			</p>
		{:else}
			<form {...f}>
				<input {...f.fields.action.as('hidden', 'subscribe')} />
				<LocaleField field={f.fields.locale} />
				<ActionLabel
					edit={config.messageEdit?.('account_newsletterSubscribe')}
					value={msg.account_newsletterSubscribe()}
				>
					{#snippet control()}
						<Button type="submit" pending={f.pending}>
							{msg.account_newsletterSubscribe()}
						</Button>
					{/snippet}
				</ActionLabel>
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
