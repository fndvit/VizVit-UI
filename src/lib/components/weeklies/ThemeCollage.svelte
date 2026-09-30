<script module lang="ts">
	import type { EditDescriptor, PropertyDescriptor } from '../../edit/types.js';

	/**
	 * Which of a theme's fields are editable where the collage renders:
	 * the name inline, the picture through the frame's panel. No collection
	 * ops — themes are managed where the weeklies are filed.
	 */
	export interface ThemeEditMap {
		name?: EditDescriptor;
		image?: PropertyDescriptor;
		/** Accessible name for the frame, e.g. "Tema Medi ambient". */
		label?: string;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ThemeData } from '../../content/types.js';
	import { getEditAdapter } from '../../edit/context.js';
	import Editable from '../../edit/Editable.svelte';
	import EditFrame from '../../edit/chrome/EditFrame.svelte';
	import EditPanel from '../../edit/chrome/EditPanel.svelte';
	import Link from '../ui/Link.svelte';

	/**
	 * The weeklies' themes as four labelled pictures, the way the home page
	 * offers them: a staggered collage — one picture lower left with its
	 * name reading up its side, one mid with the name under it, one high
	 * right with the name over it, one under that with the name reading
	 * down its side — every picture in the plum of the brand (the photo's
	 * light over the wine), full colour under the pointer. A theme without a
	 * picture is a flat tint, as the design leaves it. Each is a link to the
	 * theme's weeklies.
	 *
	 * The `lead` snippet — the band's heading, intro and search — is laid
	 * INSIDE the collage's grid, over the first two columns of its first
	 * row, so the high-right picture sits level with the heading and the
	 * low-left ones start under the lead, whatever the copy's length.
	 */
	interface Props {
		themes: ThemeData[];
		/** Where a theme leads: the host's weeklies index filtered by it. */
		themeHref: (theme: ThemeData) => string;
		/** Marks a theme's fields editable where an edit adapter is active. */
		editFor?: (theme: ThemeData) => ThemeEditMap | undefined;
		lead?: Snippet;
	}

	let { themes, themeHref, editFor, lead }: Props = $props();

	const adapter = getEditAdapter();
	const shown = $derived(themes.slice(0, 4));

	// While the name is being edited the theme is text, not a link: a caret
	// inside an anchor still navigates on click (the WeeklieCard rule).
	const editing = $derived(adapter?.isEditing ?? false);
</script>

<div class="collage">
	{#if lead}
		<div class="lead">{@render lead()}</div>
	{/if}
	{#each shown as theme, i (theme.slug)}
		{@const edit = editFor?.(theme)}
		{@const rows = edit?.image ? [{ descriptor: edit.image, value: theme.imageUrl ?? '' }] : []}
		{@const nameEditing = edit?.name !== undefined && editing}
		<div
			class="theme"
			class:first={i === 0}
			class:second={i === 1}
			class:third={i === 2}
			class:fourth={i === 3}
		>
			<EditFrame
				spec={rows.length > 0 ? { label: edit?.label ?? theme.name, hasPanel: true } : undefined}
			>
				{#snippet panel()}
					<EditPanel {rows} />
				{/snippet}
				{#if nameEditing}
					<span class="item">
						<span class="label">
							<Editable edit={edit?.name} value={theme.name}>
								{#snippet children(text, attrs)}<span {...attrs}>{text}</span>{/snippet}
							</Editable>
						</span>
						<span class="picture" class:blank={!theme.imageUrl}>
							{#if theme.imageUrl}<img src={theme.imageUrl} alt="" loading="lazy" />{/if}
						</span>
					</span>
				{:else}
					<Link href={themeHref(theme)} class="item">
						<span class="label">{theme.name}</span>
						<span class="picture" class:blank={!theme.imageUrl}>
							{#if theme.imageUrl}<img src={theme.imageUrl} alt="" loading="lazy" />{/if}
						</span>
					</Link>
				{/if}
			</EditFrame>
		</div>
	{/each}
</div>

<style>
	/* Three columns, two rows: the lead over the first two of the top row,
	   the third picture beside it, the rest on the second row. */
	.collage {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		column-gap: var(--space-4);
		row-gap: var(--space-5);
		align-items: start;
	}

	.lead {
		grid-column: 1 / 3;
		grid-row: 1;
	}

	.third {
		grid-column: 3;
		grid-row: 1;
	}

	.first {
		grid-column: 1;
		grid-row: 2;
		margin-top: 12%;
	}

	.second {
		grid-column: 2;
		grid-row: 2;
		margin-top: -12%;
	}

	.fourth {
		grid-column: 3;
		grid-row: 2;
		margin-top: -4%;
	}

	.theme :global(.item) {
		display: grid;
		gap: var(--space-2);
		color: var(--color-navy);
		text-decoration: none;
	}

	/* The name's side: up the left, under, over, down the right. */
	.first :global(.item) {
		grid-template-columns: auto minmax(0, 1fr);
	}

	.first .label {
		writing-mode: vertical-rl;
		transform: rotate(180deg);
		align-self: start;
	}

	.second .label {
		justify-self: end;
	}

	.third .label {
		order: -1;
	}

	.fourth :global(.item) {
		grid-template-columns: minmax(0, 1fr) auto;
	}

	.fourth .label {
		writing-mode: vertical-rl;
		align-self: start;
	}

	.label {
		font-size: var(--text-base);
		font-weight: 700;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		line-height: 1.1;
	}

	/* The plum: a grey photo lending its light to a wine deepened with ink,
	   so the shadows go plum and the lights a pale pink. */
	.picture {
		display: block;
		aspect-ratio: 1;
		width: 100%;
		max-width: 17rem;
		overflow: hidden;
		background: var(--color-plum);
	}

	.picture img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(1) contrast(1.05);
		mix-blend-mode: luminosity;
		transition: filter 400ms ease;
	}

	.theme :global(.item:hover .picture img) {
		filter: none;
		mix-blend-mode: normal;
	}

	.picture.blank {
		background: color-mix(in srgb, var(--color-magenta) 55%, var(--color-surface));
	}

	@media (max-width: 900px) {
		.collage {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.lead {
			grid-column: 1 / 3;
		}

		.first,
		.second,
		.third,
		.fourth {
			grid-column: auto;
			grid-row: auto;
			margin-top: 0;
		}

		.first :global(.item),
		.fourth :global(.item) {
			grid-template-columns: minmax(0, 1fr);
		}

		.first .label,
		.fourth .label {
			writing-mode: horizontal-tb;
			transform: none;
		}

		.second .label {
			justify-self: start;
		}

		.label {
			order: -1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.picture img {
			transition: none;
		}
	}
</style>
