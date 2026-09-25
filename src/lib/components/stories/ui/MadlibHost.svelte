<script lang="ts">
	import Madlib from '../../madlib/Madlib.svelte';
	import { defaultPath, leafPaths, type SentenceNode } from '../../madlib/sentenceTree.js';

	/**
	 * Story host for Madlib: owns the path the way a page does, and the
	 * cycling a preview runs until the reader takes over.
	 */
	let {
		headline = false,
		themed = false,
		cycling = false
	}: {
		/** Render the first level as a toggle. */
		headline?: boolean;
		/** Restyle through the `--vit-madlib-*` tokens. */
		themed?: boolean;
		/** Cycle through every sentence until a control is touched. */
		cycling?: boolean;
	} = $props();

	const periods = (): SentenceNode[] => [
		{ id: '12m', label: '12 months' },
		{ id: '5y', label: '5 years' }
	];

	const tree: SentenceNode = {
		id: 'root',
		label: 'Show me',
		children: [
			{
				id: 'jobs',
				label: 'open positions',
				connector: 'in',
				children: [
					{ id: 'bcn', label: 'Barcelona', connector: 'over the last', children: periods() },
					{ id: 'remote', label: 'remote roles', connector: 'over the last', children: periods() }
				]
			},
			{
				id: 'projects',
				label: 'projects',
				connector: 'started in the last',
				children: periods()
			}
		]
	};

	let path = $state(defaultPath(tree));
	let width = $state(0);

	// svelte-ignore state_referenced_locally
	let running = $state(cycling);
	const all = leafPaths(tree);

	$effect(() => {
		if (!running) return;
		let index = 0;
		const timer = setInterval(() => {
			index = (index + 1) % all.length;
			path = all[index];
		}, 2000);
		return () => clearInterval(timer);
	});
</script>

<div class:themed style="font-size: 20px;">
	<Madlib
		{tree}
		{path}
		controls={headline ? (depth) => (depth === 0 ? 'toggle' : 'dropdown') : undefined}
		onchange={(next) => (path = next)}
		onopen={() => (running = false)}
		bind:contentWidth={width}
	/>
	<p class="readout">
		path = {JSON.stringify(path)} · widest line {width}px
		{#if running}· cycling{/if}
	</p>
</div>

<style>
	.themed {
		--vit-madlib-font: var(--font-serif);
		--vit-madlib-color: var(--color-navy);
		--vit-madlib-weight: 300;
		--vit-madlib-lead-size: 0.9em;
		--vit-madlib-size: 1.2em;
		--vit-madlib-accent: var(--color-orange);
		--vit-madlib-select-accent: var(--color-brand);
		--vit-madlib-menu-bg: var(--color-cream);
		--vit-madlib-menu-hover: var(--color-band-grey);
		--vit-madlib-menu-shadow: var(--shadow-1);
	}

	.readout {
		margin-top: var(--space-4);
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		color: var(--color-ink-muted);
	}
</style>
