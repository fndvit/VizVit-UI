<script module lang="ts">
	import type { FormResultOf, RemoteField, RemoteFormInstance } from '../../forms/types.js';

	/** One preflighted comment form (the main box, or one reply box). */
	export type CommentFormInstance = RemoteFormInstance<
		{ body: RemoteField; weeklySlug: RemoteField; parentId: RemoteField },
		FormResultOf
	>;
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import Editable from '../../edit/Editable.svelte';
	import { COMMENT_BODY } from '../../forms/constraints.js';
	import type { CommentData, CommentThreadData } from '../../content/types.js';
	import Button from '../ui/Button.svelte';
	import DateText from '../ui/DateText.svelte';
	import Field from '../ui/Field.svelte';
	import FormErrorFeedback from '../ui/FormErrorFeedback.svelte';
	import Link from '../ui/Link.svelte';
	import ReactionBar, { type ReactionBarForms } from './ReactionBar.svelte';

	interface Props {
		comments: CommentThreadData[];
		weeklySlug: string;
		isLoggedIn: boolean;
		/**
		 * The main comment form, preflighted by the host page. One RemoteForm
		 * instance can only attach to one <form> at a time, so every reply form
		 * gets its own through `replyFormFor` — the host builds each with
		 * `commentForm.for(threadId).preflight(schema)`, keeping schema and
		 * keying on its side of the seam. Every instance must be preflighted
		 * itself: a keyed form falls back to the base schema only while the
		 * base form renders, so each says so explicitly.
		 */
		commentForm: CommentFormInstance;
		replyFormFor: (threadId: string) => CommentFormInstance;
		/** The reaction forms, handed through to each comment's ReactionBar. */
		reactionForms: ReactionBarForms;
	}

	let { comments, weeklySlug, isLoggedIn, commentForm, replyFormFor, reactionForms }: Props =
		$props();

	const config = getUiConfig();
	const msg = $derived(config.messages);

	// No custom enhance: kit's default post-submit behavior already resets
	// the form and re-runs the page's load functions in place (no navigation,
	// scroll preserved).
	const main = $derived(commentForm);

	const errorMessages = $derived({ unauthenticated: msg.comments_loginPrompt() });
</script>

{#snippet commentMeta(comment: CommentData)}
	<p class="meta">
		<strong>{comment.displayName}</strong>
		<DateText value={comment.createdAt} />
	</p>
	<p class="body">{comment.body}</p>
	<ReactionBar
		reactions={comment.reactions}
		target={{ kind: 'comment', id: comment.id }}
		{isLoggedIn}
		forms={reactionForms}
	/>
{/snippet}

<section aria-labelledby="comments-heading">
	<Editable edit={config.messageEdit?.('comments_title')} value={msg.comments_title()}>
		{#snippet children(text, attrs)}
			<h2 class="subsection-heading" id="comments-heading" {...attrs}>{text}</h2>
		{/snippet}
	</Editable>

	{#if comments.length === 0}
		<Editable edit={config.messageEdit?.('comments_empty')} value={msg.comments_empty()}>
			{#snippet children(text, attrs)}<p class="empty" {...attrs}>{text}</p>{/snippet}
		</Editable>
	{:else}
		<ul class="list">
			{#each comments as thread (thread.id)}
				<li>
					{@render commentMeta(thread)}

					{#if thread.replies.length > 0}
						<ul class="replies">
							{#each thread.replies as reply (reply.id)}
								<li>{@render commentMeta(reply)}</li>
							{/each}
						</ul>
					{/if}

					{#if isLoggedIn}
						{@const reply = replyFormFor(String(thread.id))}
						<!-- Native disclosure: the reply form opens without JS. -->
						<details class="reply">
							<summary>{msg.comments_replyLabel()}</summary>
							<form class="form-stack" {...reply}>
								<Field
									id="reply-body-{thread.id}"
									label={msg.comments_bodyLabel()}
									field={reply.fields.body}
									constraint={COMMENT_BODY}
									hideLabel
								>
									{#snippet children(attrs)}
										<textarea
											class="control"
											required
											rows="3"
											{...attrs}
											{...reply.fields.body.as('text')}
										></textarea>
									{/snippet}
								</Field>
								<input {...reply.fields.weeklySlug.as('hidden', weeklySlug)} />
								<input {...reply.fields.parentId.as('hidden', String(thread.id))} />
								<div class="actions">
									<Button type="submit" pending={reply.pending}>
										{msg.comments_replySubmit()}
									</Button>
								</div>
								<FormErrorFeedback result={reply.result} messages={errorMessages} />
							</form>
						</details>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}

	{#if isLoggedIn}
		<form class="form-stack" {...main}>
			<Field
				id="comment-body"
				label={msg.comments_bodyLabel()}
				field={main.fields.body}
				constraint={COMMENT_BODY}
			>
				{#snippet children(attrs)}
					<textarea class="control" required rows="4" {...attrs} {...main.fields.body.as('text')}
					></textarea>
				{/snippet}
			</Field>

			<input {...main.fields.weeklySlug.as('hidden', weeklySlug)} />

			<div class="actions">
				<Button type="submit" pending={main.pending}>{msg.comments_submit()}</Button>
			</div>

			<FormErrorFeedback result={main.result} messages={errorMessages} />
		</form>
	{:else}
		<p class="login-prompt">
			<Editable
				edit={config.messageEdit?.('comments_loginPrompt')}
				value={msg.comments_loginPrompt()}
			>
				{#snippet children(text, attrs)}<span {...attrs}>{text}</span>{/snippet}
			</Editable>
			<Link href="/login">{msg.comments_loginLink()}</Link>
			·
			<Link href="/signup">{msg.comments_signupLink()}</Link>
		</p>
	{/if}
</section>

<style>
	.empty,
	.login-prompt {
		color: var(--color-ink-secondary);
	}

	.list {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.list > li {
		border-bottom: 1px solid var(--color-hairline);
		padding-bottom: var(--space-3);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.replies {
		list-style: none;
		margin: 0;
		padding: 0 0 0 var(--space-4);
		border-left: 2px solid var(--color-hairline);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.replies li {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.meta {
		display: flex;
		gap: var(--space-2);
		align-items: baseline;
		margin: 0;
	}

	.body {
		margin: 0;
		white-space: pre-line;
	}

	.reply summary {
		cursor: pointer;
		color: var(--color-ink-secondary);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.reply form {
		margin-top: var(--space-2);
	}

	form {
		max-width: 32rem;
	}

	textarea {
		padding: var(--space-2);
		resize: vertical;
	}
</style>
