<script module lang="ts">
	import type {
		FormResultOf,
		KeyedRemoteForms,
		RemoteField,
		RemoteFormInstance
	} from '../../forms/types.js';

	/** One reaction chip's form: the target id field plus the reaction. */
	export type WeeklyReactionChip = RemoteFormInstance<
		{ weeklySlug: RemoteField; reaction: RemoteField },
		FormResultOf
	>;
	export type CommentReactionChip = RemoteFormInstance<
		{ commentId: RemoteField; reaction: RemoteField },
		FormResultOf
	>;

	/**
	 * The two keyed remote forms a bar toggles through — every chip is its own
	 * <form>, so each needs its own instance via `.for(key)`. Bundled so
	 * CommentSection can hand them through per comment without naming both.
	 */
	export interface ReactionBarForms {
		weeklyReactionForm: KeyedRemoteForms<WeeklyReactionChip>;
		commentReactionForm: KeyedRemoteForms<CommentReactionChip>;
	}
</script>

<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import type { Reaction, ReactionSummary, ReactionTarget } from '../../content/types.js';
	import FormErrorFeedback from '../ui/FormErrorFeedback.svelte';

	interface Props {
		reactions: ReactionSummary[];
		/** The weekly or comment these reactions belong to. */
		target: ReactionTarget;
		isLoggedIn: boolean;
		/** The keyed remote forms, passed by the host page. */
		forms: ReactionBarForms;
	}

	let { reactions, target, isLoggedIn, forms }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);

	/**
	 * Both presentation facts of a reaction, in one exhaustive record — the
	 * shape milestoneCategoryLabel uses, for the same reason. A fourth Reaction
	 * fails the build here instead of shipping the wrong screen-reader name.
	 */
	const REACTION = $derived<Record<Reaction, { emoji: string; label: () => string }>>({
		like: { emoji: '👍', label: msg.reaction_like },
		love: { emoji: '❤️', label: msg.reaction_love },
		clap: { emoji: '👏', label: msg.reaction_clap }
	});

	/**
	 * The chip's form and the one field that identifies what it reacts to.
	 * The two targets are stored apart, so each names its own form and its own
	 * id field, and nothing else about a chip differs.
	 *
	 * `on` is a parameter rather than the prop so the discriminant narrows here.
	 */
	function chipFor(reaction: Reaction, on: ReactionTarget) {
		if (on.kind === 'weekly') {
			const chip = forms.weeklyReactionForm.for(`${on.slug}|${reaction}`);
			return { chip, idField: chip.fields.weeklySlug.as('hidden', on.slug) };
		}
		const chip = forms.commentReactionForm.for(`${on.id}|${reaction}`);
		return { chip, idField: chip.fields.commentId.as('hidden', String(on.id)) };
	}

	/**
	 * The first failure across the bar's chips. One alert for the bar rather
	 * than one per chip: three stacked alerts for what is always the same
	 * failure would be read out three times.
	 */
	const failure = $derived(
		isLoggedIn
			? reactions
					.map((entry) => chipFor(entry.reaction, target).chip.result)
					.find((result) => result && !result.ok)
			: undefined
	);
</script>

{#snippet chipContent(entry: (typeof reactions)[number])}
	<span aria-hidden="true">{REACTION[entry.reaction].emoji}</span>
	<span class="visually-hidden">{REACTION[entry.reaction].label()}</span>
	{#if entry.count > 0}<span class="count">{entry.count}</span>{/if}
{/snippet}

<div class="bar" role="group" aria-label={msg.reactions_groupLabel()}>
	{#each reactions as entry (entry.reaction)}
		{#if isLoggedIn}
			{@const { chip, idField } = chipFor(entry.reaction, target)}
			<!-- One tiny form per reaction: toggling works without JavaScript. -->
			<form {...chip}>
				<input {...idField} />
				<input {...chip.fields.reaction.as('hidden', entry.reaction)} />
				<!-- aria-busy, not disabled: a disabled control is unfocusable, so
				disabling a toggle mid-flight drops focus off the chip the reader
				just activated. That is what makes this different from a submit
				whose form is replaced or which redirects away. -->
				<button
					type="submit"
					class="chip"
					class:mine={entry.mine}
					aria-pressed={entry.mine}
					aria-busy={chip.pending > 0 || undefined}
				>
					{@render chipContent(entry)}
				</button>
			</form>
		{:else if entry.count > 0}
			<span class="chip static" title={REACTION[entry.reaction].label()}>
				{@render chipContent(entry)}
			</span>
		{/if}
	{/each}
</div>

<FormErrorFeedback result={failure} />

<style>
	.bar {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	form {
		display: contents;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		border: 1px solid var(--color-hairline);
		border-radius: 999px;
		background: var(--color-surface);
		padding: 0.15rem var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-ink-secondary);
		cursor: pointer;
		transition: border-color var(--transition-fast);
	}

	button.chip:hover {
		border-color: var(--color-brand);
	}

	.chip.mine {
		border-color: var(--color-brand);
		background: color-mix(in srgb, var(--color-brand) 10%, var(--color-surface));
	}

	.chip.static {
		cursor: default;
	}

	.count {
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}
</style>
