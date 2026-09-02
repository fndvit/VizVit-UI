<script module lang="ts">
	import type { FormResultOf, RemoteField, RemoteFormInstance } from '../../forms/types.js';

	/** The preflighted contact form the host page passes in. */
	export type ContactFormInstance = RemoteFormInstance<
		{
			category: RemoteField;
			name: RemoteField;
			email: RemoteField;
			message: RemoteField;
			locale: RemoteField;
			website: RemoteField;
		},
		FormResultOf
	> & {
		fields: { allIssues(): Array<{ message: string }> | undefined };
	};
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import ActionLabel from '../../edit/ActionLabel.svelte';
	import EditFrame from '../../edit/chrome/EditFrame.svelte';
	import EditPanel from '../../edit/chrome/EditPanel.svelte';
	import { chromeProperty } from '../../edit/helpers.js';
	import { CONTACT_MESSAGE, CONTACT_NAME, EMAIL } from '../../forms/constraints.js';
	import { CONTACT_CATEGORIES } from '../../content/types.js';
	import { contactCategoryLabel } from '../../utils/contact.js';
	import Button from '../ui/Button.svelte';
	import Field from '../ui/Field.svelte';
	import FormErrorFeedback from '../ui/FormErrorFeedback.svelte';
	import FormFeedback from '../ui/FormFeedback.svelte';
	import Honeypot from '../ui/Honeypot.svelte';
	import LocaleField from '../ui/LocaleField.svelte';

	interface Props {
		/**
		 * The remote form, preflighted by the host page against its schema.
		 * Progressive enhancement is unchanged: without JavaScript the form
		 * posts natively and the page re-renders with the result.
		 */
		form: ContactFormInstance;
	}

	let { form }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);
	const f = $derived(form);

	// Derived, not restated: the package owns which categories exist and in
	// what order (the host schema derives its enum from CONTACT_CATEGORIES),
	// and the messages own the copy for each.
	const categories = CONTACT_CATEGORIES;

	/**
	 * An <option> cannot hold a caret, so the category labels edit through
	 * the frame's panel — one text row per category, over the SAME chrome
	 * keys the options render. Gated the way the form's other wording is:
	 * only where the host exposes `messageEdit` (the CMS mirror); the frame
	 * itself further requires an editing adapter with `saveProperty`.
	 */
	const categoryRows = $derived(
		config.messageEdit
			? categories.map((category) => ({
					descriptor: chromeProperty(`contact_category_${category}`, {
						type: 'text' as const,
						label: contactCategoryLabel(category, msg)
					}),
					value: contactCategoryLabel(category, msg)
				}))
			: []
	);
	const categoryFrameSpec = $derived(
		categoryRows.length > 0 ? { label: msg.contact_categoryLabel(), hasPanel: true } : undefined
	);
</script>

{#if f.result?.ok}
	<FormFeedback kind="success">{msg.contact_success()}</FormFeedback>
{:else}
	<form class="form-stack" {...f}>
		<EditFrame spec={categoryFrameSpec}>
			{#snippet panel()}
				<EditPanel rows={categoryRows} />
			{/snippet}
			<Field
				id="contact-category"
				label={msg.contact_categoryLabel()}
				labelEdit={config.messageEdit?.('contact_categoryLabel')}
				field={f.fields.category}
				constraint={null}
			>
				{#snippet children(attrs)}
					<select class="control" {...attrs} {...f.fields.category.as('select')}>
						{#each categories as category (category)}
							<option value={category}>{contactCategoryLabel(category, msg)}</option>
						{/each}
					</select>
				{/snippet}
			</Field>
		</EditFrame>

		<Field
			id="contact-name"
			label={msg.contact_nameLabel()}
			labelEdit={config.messageEdit?.('contact_nameLabel')}
			field={f.fields.name}
			constraint={CONTACT_NAME}
		>
			{#snippet children(attrs)}
				<input
					class="control"
					required
					autocomplete="name"
					{...attrs}
					{...f.fields.name.as('text')}
				/>
			{/snippet}
		</Field>

		<Field
			id="contact-email"
			label={msg.contact_emailLabel()}
			labelEdit={config.messageEdit?.('contact_emailLabel')}
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
			id="contact-message"
			label={msg.contact_messageLabel()}
			labelEdit={config.messageEdit?.('contact_messageLabel')}
			field={f.fields.message}
			constraint={CONTACT_MESSAGE}
		>
			{#snippet children(attrs)}
				<textarea class="control" required rows="6" {...attrs} {...f.fields.message.as('text')}
				></textarea>
			{/snippet}
		</Field>

		<LocaleField field={f.fields.locale} />

		<Honeypot form={f.fields} id="contact-website" />

		<div class="actions">
			<ActionLabel edit={config.messageEdit?.('contact_submit')} value={msg.contact_submit()}>
				{#snippet control()}
					<Button type="submit" pending={f.pending}>{msg.contact_submit()}</Button>
				{/snippet}
			</ActionLabel>
		</div>

		{#if f.result && !f.result.ok}
			<FormErrorFeedback result={f.result} />
		{:else if f.fields.allIssues()?.length}
			<FormFeedback kind="error">{msg.contact_invalid()}</FormFeedback>
		{/if}
	</form>
{/if}

<style>
	form {
		max-width: 32rem;
	}

	input,
	select,
	textarea {
		padding: var(--space-2);
	}

	textarea {
		resize: vertical;
	}
</style>
