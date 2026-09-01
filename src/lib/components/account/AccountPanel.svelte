<script module lang="ts">
	import type { FormResultOf, RemoteField, RemoteFormInstance } from '../../forms/types.js';

	/** The preflighted display-name form. */
	export type UpdateNameFormInstance = RemoteFormInstance<{
		displayName: RemoteField;
		locale: RemoteField;
	}>;

	/** The newsletter toggle; its success names which way it toggled. */
	export type NewsletterToggleFormInstance = RemoteFormInstance<
		{ action: RemoteField; locale: RemoteField },
		FormResultOf<{ reason: 'subscribed' | 'unsubscribed' }>
	>;

	export type DeleteAccountFormInstance = RemoteFormInstance<{
		confirm: RemoteField;
		locale: RemoteField;
	}>;

	export type LogoutFormInstance = RemoteFormInstance<{ locale: RemoteField }>;
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import { DISPLAY_NAME } from '../../forms/constraints.js';
	import Button from '../ui/Button.svelte';
	import Field from '../ui/Field.svelte';
	import FormErrorFeedback from '../ui/FormErrorFeedback.svelte';
	import FormResultSlot from '../ui/FormResultSlot.svelte';
	import Link from '../ui/Link.svelte';
	import LocaleField from '../ui/LocaleField.svelte';

	interface Props {
		displayName: string;
		email: string | null;
		isSubscribed: boolean;
		/** False when the server lacks the admin key for account deletion. */
		canDelete: boolean;
		/** The remote forms, passed by the host page (updateName preflighted). */
		updateNameForm: UpdateNameFormInstance;
		newsletterToggleForm: NewsletterToggleFormInstance;
		deleteAccountForm: DeleteAccountFormInstance;
		logoutForm: LogoutFormInstance;
	}

	let {
		displayName,
		email,
		isSubscribed,
		canDelete,
		updateNameForm,
		newsletterToggleForm,
		deleteAccountForm,
		logoutForm
	}: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);

	const name = $derived(updateNameForm);
	const newsletter = $derived(newsletterToggleForm);
	const del = $derived(deleteAccountForm);

	const newsletterSuccess = $derived(
		newsletter.result?.ok && newsletter.result.reason === 'subscribed'
			? msg.account_newsletterSuccessOn()
			: msg.account_newsletterSuccessOff()
	);
</script>

<div class="panel">
	<section aria-labelledby="account-name-heading">
		<h2 class="subsection-heading" id="account-name-heading">{msg.account_nameHeading()}</h2>
		<form class="form-stack" {...name}>
			<Field
				id="account-name"
				label={msg.account_nameLabel()}
				field={name.fields.displayName}
				constraint={DISPLAY_NAME}
			>
				{#snippet children(attrs)}
					<input
						class="control"
						required
						autocomplete="nickname"
						{...attrs}
						{...name.fields.displayName.as('text', displayName)}
					/>
				{/snippet}
			</Field>
			<div class="actions">
				<Button type="submit" pending={name.pending}>{msg.account_nameSubmit()}</Button>
			</div>
			<FormResultSlot result={name.result} successMessage={msg.account_nameSuccess()} />
		</form>
	</section>

	{#if email}
		<section aria-labelledby="account-newsletter-heading">
			<h2 class="subsection-heading" id="account-newsletter-heading">
				{msg.account_newsletterHeading()}
			</h2>
			<p class="status">
				{isSubscribed
					? msg.account_newsletterStatusOn({ email })
					: msg.account_newsletterStatusOff()}
			</p>
			<form class="form-stack" {...newsletter}>
				<input
					{...newsletter.fields.action.as('hidden', isSubscribed ? 'unsubscribe' : 'subscribe')}
				/>
				<LocaleField field={newsletter.fields.locale} />
				<div class="actions">
					<Button type="submit" pending={newsletter.pending}>
						{isSubscribed ? msg.account_newsletterUnsubscribe() : msg.account_newsletterSubscribe()}
					</Button>
				</div>
				<FormResultSlot result={newsletter.result} successMessage={newsletterSuccess} />
			</form>
		</section>
	{/if}

	<section aria-labelledby="account-data-heading">
		<h2 class="subsection-heading" id="account-data-heading">{msg.account_dataHeading()}</h2>
		<p class="status">{msg.account_dataDescription()}</p>
		<p>
			<Link class="download" href="/account/data" download>{msg.account_dataDownload()}</Link>
		</p>
	</section>

	<section aria-labelledby="account-logout-heading">
		<h2 class="subsection-heading" id="account-logout-heading">{msg.account_logout()}</h2>
		<form class="form-stack" {...logoutForm}>
			<LocaleField field={logoutForm.fields.locale} />
			<div class="actions">
				<Button type="submit" pending={logoutForm.pending}>{msg.account_logout()}</Button>
			</div>
			<!-- Success redirects, so only a failure ever renders here — and a
			logout that failed leaves the reader signed in with nothing said. -->
			<FormErrorFeedback result={logoutForm.result} />
		</form>
	</section>

	<section class="danger" aria-labelledby="account-delete-heading">
		<h2 class="subsection-heading" id="account-delete-heading">{msg.account_deleteHeading()}</h2>
		<p class="status">{msg.account_deleteWarning()}</p>
		{#if canDelete}
			<form class="form-stack" {...del}>
				<label class="confirm">
					<input required {...del.fields.confirm.as('checkbox')} />
					{msg.account_deleteConfirmLabel()}
				</label>
				<LocaleField field={del.fields.locale} />
				<div class="actions">
					<Button type="submit" pending={del.pending}>{msg.account_deleteSubmit()}</Button>
				</div>
				<FormErrorFeedback
					result={del.result}
					messages={{ unavailable: msg.account_error_unavailable() }}
				/>
			</form>
		{:else}
			<p class="status">{msg.account_error_unavailable()}</p>
		{/if}
	</section>
</div>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		max-width: 32rem;
	}

	section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	/* Size is the declared one; only the rhythm is this panel's. */
	.subsection-heading {
		margin: 0;
	}

	input {
		padding: var(--space-2);
	}

	.status {
		color: var(--color-ink-secondary);
		margin: 0;
	}

	/* Link renders the anchor, so the scope class cannot land on it — the same
	   :global reach ProjectCard and the home page's CTAs use. */
	section :global(a.download) {
		color: var(--color-brand);
	}

	.confirm {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		font-weight: 400;
		font-size: var(--text-base);
	}

	.confirm input {
		padding: 0;
	}

	.danger {
		border: 1px solid var(--series-8);
		border-radius: var(--radius);
		padding: var(--space-3);
	}

	.danger h2 {
		color: var(--series-8);
	}
</style>
