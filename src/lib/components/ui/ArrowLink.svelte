<script lang="ts">
	import { linkDoor } from '../../utils/paths.js';
	import InlineText from './InlineText.svelte';
	import Link from './Link.svelte';

	/**
	 * A link that is a short sentence and a long thin arrow — «To our **lab
	 * timeline** ⟶», «Go to **weeklies** ⟶», «Meet our **team** ⟶». The
	 * wording renders its `**runs**` bold (`InlineText`); the arrow is drawn,
	 * a rule and a head in the text's colour, and lengthens under the
	 * pointer. One primitive for every such link on the site, so they all
	 * read the same: the timeline's areas, the full-timeline link, the
	 * weeklies' and the «know more» ones. A site path goes through `Link`; an
	 * external URL (an area's own `https://` destination) is a plain
	 * `rel="external noopener"` anchor — `linkDoor`, the collage's rule too.
	 */
	interface Props {
		href: string;
		/** The sentence, with `**bold**` runs. */
		text: string;
	}

	let { href, text }: Props = $props();

	const door = $derived(linkDoor(href));
</script>

<span class="arrow-link">
	{#if door === 'external'}
		<a {href} rel="external noopener">
			<InlineText {text} />
			<span class="arrow" aria-hidden="true"></span>
		</a>
	{:else}
		<Link href={door === 'internal' ? href : ''}>
			<InlineText {text} />
			<span class="arrow" aria-hidden="true"></span>
		</Link>
	{/if}
</span>

<style>
	.arrow-link {
		font-size: var(--text-base);
		font-weight: 300;
	}

	.arrow-link :global(a) {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-navy);
		text-decoration: none;
	}

	.arrow-link :global(strong) {
		font-weight: 700;
	}

	.arrow {
		position: relative;
		display: inline-block;
		width: 5rem;
		height: 1px;
		background: currentColor;
		transition: width var(--transition-fast);
	}

	.arrow::after {
		content: '';
		position: absolute;
		right: 0;
		top: -0.25rem;
		width: 0.5rem;
		height: 0.5rem;
		border-top: 1px solid currentColor;
		border-right: 1px solid currentColor;
		transform: rotate(45deg);
	}

	.arrow-link :global(a:hover .arrow) {
		width: 6.5rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.arrow {
			transition: none;
		}
	}
</style>
