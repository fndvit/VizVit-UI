<script module lang="ts">
	import type { FormResultOf, RemoteField, RemoteFormInstance } from '../../forms/types.js';

	/** The preflighted password-login form the host page passes in. */
	export type LoginFormInstance = RemoteFormInstance<
		{ email: RemoteField; password: RemoteField; newsletter: RemoteField; locale: RemoteField },
		FormResultOf<object, 'invalidCredentials'>
	>;

	/** The preflighted magic-link form. */
	export type MagicLinkFormInstance = RemoteFormInstance<{
		email: RemoteField;
		locale: RemoteField;
		website: RemoteField;
	}>;
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import { EMAIL, LOGIN_PASSWORD } from '../../forms/constraints.js';
	import Button from '../ui/Button.svelte';
	import Field from '../ui/Field.svelte';
	import FormErrorFeedback from '../ui/FormErrorFeedback.svelte';
	import FormFeedback from '../ui/FormFeedback.svelte';
	import Honeypot from '../ui/Honeypot.svelte';
	import LocaleField from '../ui/LocaleField.svelte';
	import NewsletterIntentField from '../ui/NewsletterIntentField.svelte';

	interface Props {
		/**
		 * One finished sentence for a bounced auth landing, or null when the
		 * visitor arrived normally. The host app owns the closed set of landing
		 * failures and the copy for each; this component only renders the one
		 * that applies.
		 */
		redirectErrorMessage?: string | null;
		/** True when arriving from the newsletter band (?newsletter=1). */
		newsletterIntent?: boolean;
		/**
		 * The remote forms, already preflighted against the host app's schemas
		 * — validation belongs to the app's server contract, so the call site
		 * runs `form.preflight(schema)` and hands the result in. Progressive
		 * enhancement is unchanged: without JavaScript each form posts natively
		 * and the page re-renders with the result.
		 */
		loginForm: LoginFormInstance;
		magicLinkForm: MagicLinkFormInstance;
	}

	let {
		redirectErrorMessage = null,
		newsletterIntent = false,
		loginForm,
		magicLinkForm
	}: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);
	const login = $derived(loginForm);
	const magic = $derived(magicLinkForm);
</script>

<div class="login">
	<form class="form-stack" {...login}>
		<Field
			id="login-email"
			label={msg.login_emailLabel()}
			field={login.fields.email}
			constraint={EMAIL}
		>
			{#snippet children(attrs)}
				<input
					class="control"
					required
					autocomplete="email"
					{...attrs}
					{...login.fields.email.as('email')}
				/>
			{/snippet}
		</Field>

		<Field
			id="login-password"
			label={msg.login_passwordLabel()}
			field={login.fields.password}
			constraint={LOGIN_PASSWORD}
		>
			{#snippet children(attrs)}
				<input
					class="control"
					required
					autocomplete="current-password"
					{...attrs}
					{...login.fields.password.as('password')}
				/>
			{/snippet}
		</Field>

		{#if newsletterIntent}
			<NewsletterIntentField field={login.fields.newsletter} />
		{/if}
		<LocaleField field={login.fields.locale} />

		<div class="actions">
			<Button type="submit" pending={login.pending}>{msg.login_submit()}</Button>
		</div>

		{#if login.result && !login.result.ok}
			<FormErrorFeedback
				result={login.result}
				messages={{ invalidCredentials: msg.login_error_invalidCredentials() }}
			/>
		{:else if redirectErrorMessage}
			<!-- One sentence per landing, mapped by the host app off its closed
			     set of landing failures — a new code fails the build there, not in
			     an else arm here. Neither sentence reveals whether an address has
			     an account: both are reachable only with a token in hand and
			     describe the token's fate, not the address's. -->
			<FormFeedback kind="error">{redirectErrorMessage}</FormFeedback>
		{/if}
	</form>

	<p class="divider" role="separator">{msg.login_divider()}</p>

	{#if magic.result?.ok}
		<FormFeedback kind="success">{msg.login_magicLinkSuccess()}</FormFeedback>
	{:else}
		<form class="form-stack" {...magic}>
			<Field
				id="magic-email"
				label={msg.login_emailLabel()}
				field={magic.fields.email}
				constraint={EMAIL}
			>
				{#snippet children(attrs)}
					<input
						class="control"
						required
						autocomplete="email"
						{...attrs}
						{...magic.fields.email.as('email')}
					/>
				{/snippet}
			</Field>

			<!-- Localizes the /auth/confirm landing via the roundtrip cookie. -->
			<LocaleField field={magic.fields.locale} />

			<!-- Honeypot: invisible to humans, tempting to bots. This form mails an
			     attacker-chosen address unauthenticated, and a tripped trap returns
			     the same value a real request does — so the success branch above
			     renders identically either way. The password form above carries no
			     trap: its success is a redirect, so there is no value to fake. -->
			<Honeypot form={magic.fields} id="magic-website" />

			<div class="actions">
				<Button type="submit" pending={magic.pending}>{msg.login_magicLinkSubmit()}</Button>
			</div>

			<FormErrorFeedback result={magic.result} />
		</form>
	{/if}
</div>

<style>
	.login {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		max-width: 24rem;
	}

	input {
		padding: var(--space-2);
	}
</style>
