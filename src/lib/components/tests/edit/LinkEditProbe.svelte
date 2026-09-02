<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { setUiConfig } from '../../../config/context.js';
	import type { UiMessages } from '../../../config/types.js';
	import { setEditAdapter } from '../../../edit/context.js';
	import LinkEdit from '../../../edit/chrome/LinkEdit.svelte';
	import type {
		EditAdapter,
		EditDescriptor,
		EntityOp,
		PropertyDescriptor
	} from '../../../edit/types.js';
	import { createRemoteFormMock } from '../../../testing/remote-form.js';
	import type { NewsletterToggleFormInstance } from '../../account/AccountPanel.svelte';
	import NewsletterSignup from '../../account/NewsletterSignup.svelte';
	import CommentSection from '../../weeklies/CommentSection.svelte';

	/**
	 * The link modal under a test-owned adapter: bare LinkEdit mechanics, and
	 * the two components that resolve their own keys through it. `adapter:
	 * null` = read-only app; `messages` overrides the catalog wholesale (an
	 * old host = a catalog without the optional *Href keys).
	 */
	interface Props {
		adapter?: EditAdapter | null;
		mode?: 'bare' | 'newsletter' | 'comments';
		text?: { edit: EditDescriptor | undefined; value: string };
		href?: { descriptor: PropertyDescriptor | undefined; value: string };
		extras?: { descriptor: PropertyDescriptor; value: string | null }[];
		removeOp?: EntityOp;
		messageEdit?: (key: string) => EditDescriptor | undefined;
		messages?: UiMessages;
	}

	let {
		adapter = null,
		mode = 'bare',
		text = { edit: undefined, value: 'Enllaç' },
		href = { descriptor: undefined, value: '/on' },
		extras = undefined,
		removeOp = undefined,
		messageEdit = undefined,
		messages = undefined
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	if (adapter) setEditAdapter(adapter);
	setUiConfig(() => (messages ? { messageEdit, messages } : { messageEdit }));

	type CommentSectionProps = ComponentProps<typeof CommentSection>;
</script>

{#if mode === 'bare'}
	<LinkEdit {text} {href} {extras} {removeOp}>
		{#snippet control()}<a href={href.value}>{text.value}</a>{/snippet}
	</LinkEdit>
{:else if mode === 'newsletter'}
	<NewsletterSignup
		account={null}
		newsletterToggleForm={createRemoteFormMock<NewsletterToggleFormInstance>()}
	/>
{:else}
	<CommentSection
		comments={[]}
		weeklySlug="setmana"
		isLoggedIn={false}
		commentForm={createRemoteFormMock<CommentSectionProps['commentForm']>()}
		replyFormFor={() => createRemoteFormMock<CommentSectionProps['commentForm']>()}
		reactionForms={{
			weeklyReactionForm:
				createRemoteFormMock<CommentSectionProps['reactionForms']['weeklyReactionForm']>(),
			commentReactionForm:
				createRemoteFormMock<CommentSectionProps['reactionForms']['commentReactionForm']>()
		}}
	/>
{/if}
