<!--
  @component Madlib

  A sentence with blanks, each blank a control: "Show me [open positions] in
  [Barcelona] over the last [12 months]". The blanks are the levels of a
  {@link ./sentenceTree} — what a level offers depends on what was chosen
  above it — and the value is the **path** of chosen ids, root to leaf.

  The component owns nothing but the projection. `walkTree` turns the path into
  one level per blank; `replaceAt` turns a pick into the next full path,
  keeping the deeper choices that still apply; the host receives that path in
  `onchange` and decides what it means. It never holds a copy of the path, so
  a host that rejects or rewrites a change simply does not pass it back.

  ## Controls
  Every blank is an {@link ./InlineSelect} unless `controls` says otherwise. A
  level rendered as a `toggle` lists its options in the text — active one bold
  and underlined, the others muted, separated by bars — and takes a line of its
  own together with the text before it, so a two-way branch can read as a
  headline over the rest of the sentence:

  ```
  Farming in the  present | future
  Show me where [all crops] are grown, by [area]
  ```

  ## Theming
  CSS custom properties with plain fallbacks; the font, size and weight of the
  text around each control are inherited by the control:

  | property                        | role                                        |
  |---------------------------------|---------------------------------------------|
  | `--vit-madlib-font`             | the sentence's font family                  |
  | `--vit-madlib-color`            | the sentence's colour                        |
  | `--vit-madlib-lead-size`        | font size of a toggle's line                |
  | `--vit-madlib-lead-line-height` | line height of a toggle's line              |
  | `--vit-madlib-size`             | font size of the dropdown lines             |
  | `--vit-madlib-line-height`      | line height of the dropdown lines           |
  | `--vit-madlib-weight`           | weight of the running text                  |
  | `--vit-madlib-control-weight`   | weight of a chosen option                   |
  | `--vit-madlib-muted-color`      | unchosen toggle options, bars, menu options |
  | `--vit-madlib-accent`           | the active toggle option's underline        |

  The `InlineSelect` tokens (`--vit-madlib-select-accent`, `--vit-madlib-menu-*`)
  apply to every dropdown in the sentence.

  @property tree - The sentence tree
  @property path - The chosen node ids, root to leaf
  @property onchange - Fired with the next full path when any blank changes
  @property controls - How each depth is rendered; `'dropdown'` when omitted
  @property onopen - Fired when any control is activated, before the change (a
  host cycling through sentences stops here)
  @property contentWidth - Bindable: the widest rendered line, in px, remeasured on every change
  @property class - Extra classes appended to the wrapper
-->
<script lang="ts" module>
	import type { SentenceLevel, SentenceNode } from './sentenceTree.js';

	/** How one level of the sentence is rendered. */
	export type MadlibControl = 'dropdown' | 'toggle';

	/** Picks the control for a level. Receives the depth and the resolved level. */
	export type MadlibControls = (depth: number, level: SentenceLevel) => MadlibControl;
</script>

<script lang="ts">
	import InlineSelect from './InlineSelect.svelte';
	import { replaceAt, walkTree } from './sentenceTree.js';

	let {
		tree,
		path,
		onchange,
		controls,
		onopen,
		contentWidth = $bindable(0),
		class: className = ''
	}: {
		tree: SentenceNode;
		path: readonly string[];
		onchange: (path: string[]) => void;
		controls?: MadlibControls;
		onopen?: () => void;
		contentWidth?: number;
		class?: string;
	} = $props();

	/** One blank of the sentence, with the text that introduces it. */
	interface Blank {
		depth: number;
		level: SentenceLevel;
		control: MadlibControl;
		/** The root's label for the first blank, the previous node's connector after. */
		lead: string | undefined;
	}

	/** A rendered line: a toggle stands alone on a lead line; dropdowns flow together. */
	interface Line {
		kind: 'lead' | 'body';
		blanks: Blank[];
	}

	const levels = $derived(walkTree(tree, path));

	const lines = $derived.by((): Line[] => {
		const out: Line[] = [];
		levels.forEach((level, depth) => {
			const blank: Blank = {
				depth,
				level,
				control: controls?.(depth, level) ?? 'dropdown',
				lead: depth === 0 ? tree.label : levels[depth - 1].node.connector
			};
			const last = out[out.length - 1];
			if (blank.control === 'toggle') out.push({ kind: 'lead', blanks: [blank] });
			else if (last?.kind === 'body') last.blanks.push(blank);
			else out.push({ kind: 'body', blanks: [blank] });
		});
		return out;
	});

	/**
	 * A leaf's own `connector` has no next control to introduce, so it trails
	 * the sentence rather than being dropped.
	 */
	const trailing = $derived.by(() => {
		const last = levels[levels.length - 1];
		return last && !last.node.children?.length ? last.node.connector : undefined;
	});

	let root: HTMLElement | undefined = $state();

	/**
	 * The space between a control and the text after it — none when that text
	 * opens with punctuation (", under a" hugs the control it follows).
	 * @param text - The connector or leading text about to be rendered
	 * @returns A single space, or nothing before punctuation
	 */
	const gap = (text: string) => (/^[,.;:!?)]/.test(text) ? '' : ' ');

	function pick(depth: number, id: string) {
		onchange(replaceAt(tree, path, depth, id));
	}

	function activate(depth: number, id: string) {
		onopen?.();
		pick(depth, id);
	}

	/**
	 * The widest rendered line: inline rects grouped by their row. A host
	 * aligning something under the sentence (a legend, a caption) wants the
	 * text's width, not the block's.
	 */
	function measure() {
		if (!root) return;
		const range = document.createRange();
		range.selectNodeContents(root);
		const left = root.getBoundingClientRect().left;
		const rows: Record<number, number> = {};
		for (const rect of range.getClientRects()) {
			const row = Math.round(rect.top);
			rows[row] = Math.max(rows[row] ?? 0, rect.right - left);
		}
		contentWidth = Math.ceil(Math.max(0, ...Object.values(rows)));
	}

	$effect(() => {
		void path;
		const frame = requestAnimationFrame(measure);
		return () => cancelAnimationFrame(frame);
	});
</script>

<div bind:this={root} class="vit-madlib {className}">
	{#if levels.length === 0}
		<span class="vit-madlib__line vit-madlib__line--lead">{tree.label}</span>
	{/if}
	{#each lines as line, i (i)}
		<span class="vit-madlib__line vit-madlib__line--{line.kind}">
			{#each line.blanks as blank (blank.depth)}
				{#if blank.lead}<span class="vit-madlib__text">{`${gap(blank.lead)}${blank.lead} `}</span
					>{/if}
				{#if blank.control === 'toggle'}
					{#each blank.level.siblings as option, j (option.id)}
						{#if j > 0}<span class="vit-madlib__separator" aria-hidden="true">|</span>{/if}
						<button
							type="button"
							class="vit-madlib__toggle"
							class:vit-madlib__toggle--active={option.id === blank.level.node.id}
							aria-pressed={option.id === blank.level.node.id}
							onclick={() => activate(blank.depth, option.id)}
						>
							{option.label}
						</button>
					{/each}
				{:else}
					<InlineSelect
						value={blank.level.node.id}
						options={blank.level.siblings.map((s) => ({ value: s.id, label: s.label }))}
						onchange={(id) => pick(blank.depth, id)}
						{onopen}
					/>
				{/if}
			{/each}
			{#if line === lines[lines.length - 1] && trailing}
				<span class="vit-madlib__text">{`${gap(trailing)}${trailing}`}</span>
			{/if}
		</span>
	{/each}
</div>

<style>
	.vit-madlib {
		font-family: var(--vit-madlib-font, inherit);
		color: var(--vit-madlib-color, inherit);
		font-weight: var(--vit-madlib-weight, inherit);
		text-wrap: balance;
	}

	.vit-madlib__line {
		display: block;
	}

	.vit-madlib__line--lead {
		font-size: var(--vit-madlib-lead-size, 1em);
		line-height: var(--vit-madlib-lead-line-height, 1.4);
	}

	.vit-madlib__line--body {
		font-size: var(--vit-madlib-size, 1em);
		line-height: var(--vit-madlib-line-height, 1.4);
	}

	.vit-madlib__separator {
		padding: 0 0.375em;
		color: var(--vit-madlib-muted-color, color-mix(in srgb, currentColor 35%, transparent));
	}

	.vit-madlib__toggle {
		padding: 0 0 0.125em;
		margin: 0;
		border: 0;
		border-bottom: 2px solid transparent;
		background: transparent;
		font: inherit;
		color: var(--vit-madlib-muted-color, color-mix(in srgb, currentColor 35%, transparent));
		cursor: pointer;
		transition: color 200ms;
	}

	.vit-madlib__toggle:hover {
		color: inherit;
		opacity: 0.6;
	}

	.vit-madlib__toggle--active,
	.vit-madlib__toggle--active:hover {
		color: inherit;
		opacity: 1;
		font-weight: var(--vit-madlib-control-weight, 700);
		border-bottom-color: var(--vit-madlib-accent, currentColor);
	}
</style>
