<script module lang="ts">
	import type { RemoteField, RemoteFormInstance } from '../../forms/types.js';

	/** The preflighted signup form the host page passes in. */
	export type SignupFormInstance = RemoteFormInstance<{
		displayName: RemoteField;
		email: RemoteField;
		password: RemoteField;
		terms: RemoteField;
		newsletter: RemoteField;
		locale: RemoteField;
		website: RemoteField;
	}>;
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import { DISPLAY_NAME, EMAIL, PASSWORD } from '../../forms/constraints.js';
	import Button from '../ui/Button.svelte';
	import Field from '../ui/Field.svelte';
	import FormErrorFeedback from '../ui/FormErrorFeedback.svelte';
	import FormFeedback from '../ui/FormFeedback.svelte';
	import Honeypot from '../ui/Honeypot.svelte';
	import Link from '../ui/Link.svelte';
	import LocaleField from '../ui/LocaleField.svelte';

	interface Props {
		/** True when arriving from the newsletter band (?newsletter=1). */
		newsletterIntent?: boolean;
		/**
		 * Callbacks for the single consent block's live state, so the page can
		 * mirror it into the Google flow — one set of checkboxes for both
		 * signup methods (callback props per the foundation's convention).
		 */
		onTermsChange?: (accepted: boolean) => void;
		onNewsletterChange?: (checked: boolean) => void;
		/** The remote form, preflighted by the host page against its schema. */
		signupForm: SignupFormInstance;
	}

	let { newsletterIntent = false, onTermsChange, onNewsletterChange, signupForm }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);
	const f = $derived(signupForm);
</script>

{#if f.result?.ok}
	<FormFeedback kind="success">{msg.signup_success()}</FormFeedback>
{:else}
	<form class="form-stack" {...f}>
		<Field
			id="signup-name"
			label={msg.signup_nameLabel()}
			field={f.fields.displayName}
			constraint={DISPLAY_NAME}
		>
			{#snippet children(attrs)}
				<input
					class="control"
					required
					autocomplete="nickname"
					{...attrs}
					{...f.fields.displayName.as('text')}
				/>
			{/snippet}
		</Field>

		<Field
			id="signup-email"
			label={msg.login_emailLabel()}
			field={f.fields.email}
			constraint={EMAIL}
		>
			{#snippet children(attrs)}
				<input
					class="control"
					required
					autocomplete="email"
					{...attrs}
					{...f.fields.email.as('email')}
				/>
			{/snippet}
		</Field>

		<Field
			id="signup-password"
			label={msg.signup_passwordLabel()}
			field={f.fields.password}
			constraint={PASSWORD}
		>
			{#snippet children(attrs)}
				<input
					class="control"
					required
					autocomplete="new-password"
					{...attrs}
					{...f.fields.password.as('password')}
				/>
			{/snippet}
		</Field>

		<label class="checkbox">
			<input
				required
				onchange={(event) => onTermsChange?.(event.currentTarget.checked)}
				{...f.fields.terms.as('checkbox')}
			/>
			<span>
				{msg.signup_termsPre()}
				<Link href="/legal">{msg.signup_termsLink()}</Link>
			</span>
		</label>

		<label class="checkbox">
			<input
				onchange={(event) => onNewsletterChange?.(event.currentTarget.checked)}
				{...f.fields.newsletter.as('checkbox', newsletterIntent)}
			/>
			<span>{msg.signup_newsletterLabel()}</span>
		</label>

		<!-- Localizes the /auth/confirm landing via the roundtrip cookie. -->
		<LocaleField field={f.fields.locale} />

		<!-- Honeypot: invisible to humans, tempting to bots. -->
		<Honeypot form={f.fields} id="signup-website" />

		<div class="actions">
			<Button type="submit" pending={f.pending}>{msg.signup_submit()}</Button>
		</div>
		<FormErrorFeedback result={f.result} />
	</form>
{/if}

<style>
	form {
		max-width: 24rem;
	}

	input {
		padding: var(--space-2);
	}

	.checkbox {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		font-weight: 400;
		font-size: var(--text-sm);
		color: var(--color-ink-secondary);
	}

	.checkbox input {
		padding: 0;
	}
</style>
