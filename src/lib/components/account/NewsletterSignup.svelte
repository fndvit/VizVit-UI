<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import ActionLabel from '../../edit/ActionLabel.svelte';
	import Editable from '../../edit/Editable.svelte';
	import WordedLink from '../../edit/chrome/WordedLink.svelte';
	import { AUTH_PATHS, withNewsletterIntent } from '../../forms/transport.js';
	import type { NewsletterToggleFormInstance } from './AccountPanel.svelte';
	import Button from '../ui/Button.svelte';
	import FormResultSlot from '../ui/FormResultSlot.svelte';
	import Link from '../ui/Link.svelte';
	import LocaleField from '../ui/LocaleField.svelte';
	import TileMosaic from '../ui/TileMosaic.svelte';

	/**
	 * The newsletter band: a white card over a mosaic of big tiles in navy,
	 * the mark's pink and cream — the heading and the blurb side by side,
	 * then the way in, then the privacy line. The mosaic is décor; the card
	 * carries everything a reader needs.
	 */
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

	/** The band's tiles: the brand's three, the pink being the mark's. */
	const HUES = [
		'var(--color-navy)',
		'var(--color-navy)',
		'var(--vit-brand-mark)',
		'var(--color-cream)',
		'var(--color-cream)'
	];
</script>

<section class="newsletter" aria-labelledby="newsletter-title">
	<div class="mosaic" aria-hidden="true">
		<TileMosaic cols={14} rows={4} seed={23} density={0.84} hues={HUES} />
	</div>
	<div class="inner band">
		<div class="card">
			<div class="head">
				<Editable edit={config.messageEdit?.('newsletter_title')} value={msg.newsletter_title()}>
					{#snippet children(text, attrs)}<h2 id="newsletter-title" {...attrs}>{text}</h2>{/snippet}
				</Editable>
				<Editable edit={config.messageEdit?.('newsletter_intro')} value={msg.newsletter_intro()}>
					{#snippet children(text, attrs)}<p class="intro" {...attrs}>{text}</p>{/snippet}
				</Editable>
			</div>

			{#if account === null}
				<p class="prompt">
					<Editable
						edit={config.messageEdit?.('newsletter_promptLoggedOut')}
						value={msg.newsletter_promptLoggedOut()}
					>
						{#snippet children(text, attrs)}<span {...attrs}>{text}</span>{/snippet}
					</Editable>
				</p>
				<!-- The destinations are OPTIONAL catalog keys added after these
				     components first shipped; a host without them keeps the
				     built-in paths, and the intent query rides on whatever the key
				     resolves to. -->
				<p class="ways">
					<WordedLink
						text="comments_signupLink"
						href="comments_signupLinkHref"
						fallback={AUTH_PATHS.signup}
					>
						{#snippet link(href, text)}
							<Link href={withNewsletterIntent(href)} class="way primary">{text}</Link>
						{/snippet}
					</WordedLink>
					<WordedLink
						text="comments_loginLink"
						href="comments_loginLinkHref"
						fallback={AUTH_PATHS.login}
					>
						{#snippet link(href, text)}
							<Link href={withNewsletterIntent(href)} class="way">{text}</Link>
						{/snippet}
					</WordedLink>
				</p>
			{:else if account.newsletterSubscribed}
				<p class="prompt">
					<Editable
						edit={config.messageEdit?.('newsletter_subscribedNote')}
						value={msg.newsletter_subscribedNote()}
					>
						{#snippet children(text, attrs)}<span {...attrs}>{text}</span>{/snippet}
					</Editable>
					<ActionLabel
						edit={config.messageEdit?.('account_navLabel')}
						value={msg.account_navLabel()}
					>
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

			<Editable edit={config.messageEdit?.('newsletter_privacy')} value={msg.newsletter_privacy()}>
				{#snippet children(text, attrs)}<p class="privacy" {...attrs}>{text}</p>{/snippet}
			</Editable>
		</div>
	</div>
</section>

<style>
	.newsletter {
		position: relative;
		overflow: clip;
		background: var(--color-surface);
	}

	.mosaic {
		position: absolute;
		inset: 0;
	}

	.inner {
		position: relative;
		padding-block: var(--space-6);
	}

	.card {
		max-width: 38rem;
		margin-inline: auto;
		padding: var(--space-5);
		background: var(--color-surface);
		color: var(--color-navy);
	}

	.head {
		display: flex;
		align-items: baseline;
		gap: var(--space-4);
		flex-wrap: wrap;
		margin-bottom: var(--space-4);
	}

	h2 {
		margin: 0;
		font-size: var(--text-2xl);
		font-weight: 300;
		line-height: 1.1;
	}

	.intro {
		flex: 1 1 14rem;
		margin: 0;
		font-weight: 300;
	}

	.prompt {
		margin: 0 0 var(--space-3);
		font-weight: 300;
	}

	/* The ways in, as pills: the first in navy, the second outlined. */
	.ways {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin: 0;
	}

	.ways :global(a.way) {
		display: inline-block;
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--color-navy);
		border-radius: 999px;
		color: var(--color-navy);
		text-decoration: none;
	}

	.ways :global(a.way.primary) {
		background: var(--color-navy);
		color: var(--color-surface);
	}

	form {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.feedback-slot {
		margin-top: var(--space-3);
	}

	.privacy {
		margin: var(--space-3) 0 0;
		font-size: var(--text-sm);
		font-weight: 300;
	}
</style>
