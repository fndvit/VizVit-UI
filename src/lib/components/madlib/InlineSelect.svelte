<!--
  @component InlineSelect

  A select that sits inside running text: the chosen label, underlined, with a
  small caret, and a listbox that drops below it. It inherits the font, size
  and line-height of the text around it, which is the whole point — a native
  `<select>` cannot be made to read as a word in a sentence.

  It is the control `<Madlib>` renders for each blank, and it is exported on
  its own for a lone blank in a heading ("Practices in [Spain]").

  ## Theming
  Reads the madlib token family, with fallbacks, so it renders standalone:

  | property                       | role                                   |
  |--------------------------------|----------------------------------------|
  | `--vit-madlib-control-weight`  | weight of the chosen label             |
  | `--vit-madlib-muted-color`     | the unchosen options                   |
  | `--vit-madlib-select-accent`   | the underline while open or hovered    |
  | `--vit-madlib-menu-bg`         | the listbox surface                    |
  | `--vit-madlib-menu-hover`      | the option under the pointer / chosen  |
  | `--vit-madlib-menu-shadow`     | the listbox shadow                     |
  | `--vit-madlib-menu-max-height` | the listbox scroll height              |
  | `--vit-madlib-menu-z`          | the listbox stacking order             |

  @property value - The chosen option's value
  @property options - The options offered, in order
  @property onchange - Fired with the new value when an option is picked
  @property onopen - Fired when the listbox is opened, before it shows
  @property label - Accessible name for the control, when the surrounding text does not give one
  @property class - Extra classes appended to the wrapper
-->
<script lang="ts" module>
	/** One option row. `value` is what the control carries: a string, always. */
	export interface InlineOption {
		value: string;
		label: string;
		disabled?: boolean;
	}
</script>

<script lang="ts">
	import { fly } from 'svelte/transition';

	let {
		value,
		options,
		onchange,
		onopen,
		label,
		class: className = ''
	}: {
		value: string;
		options: readonly InlineOption[];
		onchange?: (value: string) => void;
		onopen?: () => void;
		label?: string;
		class?: string;
	} = $props();

	let open = $state(false);
	let wrapper: HTMLElement | undefined = $state();

	const chosen = $derived(options.find((option) => option.value === value)?.label ?? '');

	function toggle() {
		if (!open) onopen?.();
		open = !open;
	}

	function pick(option: InlineOption) {
		if (option.disabled) return;
		open = false;
		onchange?.(option.value);
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			open = false;
		} else if (event.key === 'ArrowDown' && !open) {
			event.preventDefault();
			toggle();
		}
	}

	/** Any click that lands outside the control closes it. */
	function onwindowclick(event: MouseEvent) {
		if (open && wrapper && !wrapper.contains(event.target as Node)) open = false;
	}
</script>

<svelte:window onclick={onwindowclick} />

<span bind:this={wrapper} class="vit-inline-select {className}">
	<button
		type="button"
		class="vit-inline-select__trigger"
		class:vit-inline-select__trigger--open={open}
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-label={label}
		onclick={toggle}
		{onkeydown}
	>
		<!-- The trigger is as wide as the CHOSEN label only, so the sentence
		     reflows as the value changes. The menu carries the widest option. -->
		<span class="vit-inline-select__value">{chosen}</span>
		<svg class="vit-inline-select__caret" viewBox="0 0 12 12" fill="none" aria-hidden="true">
			<path
				d="M2.5 4.5L6 8L9.5 4.5"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>

	{#if open}
		<ul class="vit-inline-select__menu" role="listbox" transition:fly={{ y: -8, duration: 150 }}>
			{#each options as option (option.value)}
				<li
					role="option"
					aria-selected={option.value === value}
					aria-disabled={option.disabled || undefined}
					class="vit-inline-select__option"
					class:vit-inline-select__option--chosen={option.value === value}
					class:vit-inline-select__option--disabled={option.disabled}
					tabindex={option.disabled ? -1 : 0}
					onclick={() => pick(option)}
					onkeydown={(event) => event.key === 'Enter' && pick(option)}
				>
					{option.label}
				</li>
			{/each}
		</ul>
	{/if}
</span>

<style>
	.vit-inline-select {
		position: relative;
		display: inline-block;
	}

	.vit-inline-select__trigger {
		display: inline;
		padding: 0 0 0.1em;
		margin: 0;
		border: 0;
		border-bottom: 2px solid currentColor;
		background: transparent;
		color: inherit;
		font: inherit;
		font-weight: var(--vit-madlib-control-weight, 700);
		cursor: pointer;
		transition: border-color 200ms;
	}

	.vit-inline-select__trigger:hover,
	.vit-inline-select__trigger--open {
		border-bottom-color: var(--vit-madlib-select-accent, currentColor);
	}

	.vit-inline-select__value {
		white-space: nowrap;
	}

	.vit-inline-select__caret {
		display: inline;
		width: 0.5em;
		height: 0.5em;
		margin-left: 0.125em;
		flex-shrink: 0;
		transition: transform 200ms;
	}

	.vit-inline-select__trigger--open .vit-inline-select__caret {
		transform: rotate(180deg);
	}

	.vit-inline-select__menu {
		position: absolute;
		left: 0;
		z-index: var(--vit-madlib-menu-z, 40);
		margin: 0.25em 0 0;
		padding: 0.25em 0;
		list-style: none;
		width: max-content;
		max-width: 42rem;
		max-height: var(--vit-madlib-menu-max-height, 15rem);
		overflow: auto;
		background: var(--vit-madlib-menu-bg, #ffffff);
		box-shadow: var(--vit-madlib-menu-shadow, none);
		font: inherit;
		scrollbar-width: thin;
	}

	.vit-inline-select__option {
		padding: 0.375em 1em;
		font-weight: var(--vit-madlib-control-weight, 700);
		color: var(--vit-madlib-muted-color, color-mix(in srgb, currentColor 35%, transparent));
		cursor: pointer;
		transition: background-color 150ms;
	}

	.vit-inline-select__option:hover,
	.vit-inline-select__option:focus-visible {
		background: var(--vit-madlib-menu-hover, color-mix(in srgb, currentColor 10%, transparent));
	}

	.vit-inline-select__option--chosen {
		color: inherit;
		background: var(--vit-madlib-menu-hover, color-mix(in srgb, currentColor 10%, transparent));
	}

	.vit-inline-select__option--disabled {
		opacity: 0.4;
		pointer-events: none;
	}
</style>
