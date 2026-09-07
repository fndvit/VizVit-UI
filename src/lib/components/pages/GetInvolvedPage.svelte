<script module lang="ts">
	import type { CopyEditFor } from '../../content/pages.js';
	import type { JobOpeningData } from '../../content/types.js';
	import type { CollectionRef } from '../../edit/types.js';
	import type { JobEditMap } from '../jobs/JobList.svelte';

	/**
	 * What a CMS may open on /get-involved. The five «why get in touch» rows
	 * are copy blocks and edit through `copy` like the headings; `jobs` names
	 * the openings' collection, which turns on the list's add slot and removes.
	 */
	export interface GetInvolvedPageEdit {
		copy?: CopyEditFor<'get-involved'>;
		jobFor?: (job: JobOpeningData) => JobEditMap | undefined;
		jobs?: CollectionRef;
	}
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import { GET_INVOLVED_REASON_KEYS, type PageCopy } from '../../content/pages.js';
	import Editable from '../../edit/Editable.svelte';
	import ContactForm, { type ContactFormInstance } from '../contact/ContactForm.svelte';
	import JobList from '../jobs/JobList.svelte';
	import PageShell from '../layout/PageShell.svelte';
	import CopyIntro from '../ui/CopyIntro.svelte';
	import DecorShapes from '../ui/DecorShapes.svelte';

	/**
	 * The contact page: the reasons to write beside the contact form, the
	 * funding band, the open roles. The form arrives preflighted by the host
	 * against its own schema (the website's `contactForm.preflight(...)`; a
	 * CMS mirror passes the package's inert mock) — the one prop the hosts
	 * fill differently.
	 *
	 * The reasons list derives from `GET_INVOLVED_REASON_KEYS`, in that
	 * order, and does NOT skip a block with no row yet — the same answer
	 * CopyIntro gives, and the one `PageCopy` states.
	 */
	interface Props {
		content: PageCopy<'get-involved'>;
		jobs: JobOpeningData[];
		form: ContactFormInstance;
		edit?: GetInvolvedPageEdit;
	}

	let { content, jobs, form, edit }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);
</script>

<PageShell title={msg.nav_getInvolved()}>
	<Editable edit={config.messageEdit?.('nav_getInvolved')} value={msg.nav_getInvolved()}>
		{#snippet children(text, attrs)}<h1 {...attrs}>{text}</h1>{/snippet}
	</Editable>

	<section class="contact" aria-labelledby="contact-heading">
		<div class="contact-text">
			<Editable edit={edit?.copy?.('contact_heading')} value={content.contact_heading}>
				{#snippet children(text, attrs)}
					<h2 class="section-heading" id="contact-heading" {...attrs}>{text}</h2>
				{/snippet}
			</Editable>
			<CopyIntro text={content.contact_intro} edit={edit?.copy?.('contact_intro')} />
			<ul class="reasons">
				{#each GET_INVOLVED_REASON_KEYS as key (key)}
					<!-- The li itself is the editable node: no extra span, so the
					     read-only markup stays the website's. -->
					<Editable edit={edit?.copy?.(key)} value={content[key]}>
						{#snippet children(text, attrs)}<li {...attrs}>{text}</li>{/snippet}
					</Editable>
				{/each}
			</ul>
		</div>
		<ContactForm {form} />
	</section>

	<section class="funding" aria-labelledby="funding-heading">
		<div>
			<Editable edit={edit?.copy?.('funding_heading')} value={content.funding_heading}>
				{#snippet children(text, attrs)}
					<h2 class="section-heading" id="funding-heading" {...attrs}>{text}</h2>
				{/snippet}
			</Editable>
			<CopyIntro text={content.funding_body} edit={edit?.copy?.('funding_body')} />
		</div>
		<DecorShapes flip />
	</section>

	<section aria-labelledby="careers-heading">
		<Editable edit={edit?.copy?.('careers_heading')} value={content.careers_heading}>
			{#snippet children(text, attrs)}
				<h2 class="section-heading" id="careers-heading" {...attrs}>{text}</h2>
			{/snippet}
		</Editable>
		<CopyIntro text={content.careers_intro} edit={edit?.copy?.('careers_intro')} />
		<JobList {jobs} editFor={edit?.jobFor} collection={edit?.jobs} />
	</section>
</PageShell>

<style>
	.contact {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: var(--space-5);
		align-items: start;
	}

	.reasons {
		padding-left: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		color: var(--color-ink-secondary);
	}

	.funding {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-5);
		margin-block: var(--space-6);
		padding: var(--space-4);
		background: var(--color-cream);
		border-radius: var(--radius-lg);
	}

	@media (max-width: 720px) {
		.contact {
			grid-template-columns: 1fr;
		}

		.funding {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
