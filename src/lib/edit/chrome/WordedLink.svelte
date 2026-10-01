<script module lang="ts">
	import type { ParameterlessKey } from '../../config/types.js';

	/** A wording key whose message takes no parameters — one the chrome may render as is. */
	export type WordingKey = ParameterlessKey;

	/** A wording key that names a DESTINATION: exactly the `*Href` keys. */
	export type HrefKey = Extract<WordingKey, `${string}Href`>;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getUiConfig } from '../../config/context.js';
	import { chromeProperty } from '../helpers.js';
	import LinkEdit from './LinkEdit.svelte';

	/**
	 * A link whose two halves are wording: a text key and the `*Href` key
	 * that is its destination. Rendered through the control the caller
	 * gives it — a plain `Link`, an `ArrowLink` — with the resolved
	 * destination and text handed in, so a call site names each key ONCE.
	 *
	 * Editing is the pair's: with `messageEdit` the control opens ONE modal
	 * with Text and Adreça, the label saving as wording and the destination
	 * as its `*Href` key. Three modules used to spell this with three copies
	 * of the descriptor helper that did not agree (one set a locale on the
	 * destination, two did not) over keys typed `string`; the keys are typed
	 * here, the destination helper has one spelling, and it carries no
	 * locale — a destination is one value for every locale (the host holds
	 * it as its canonical locale alone, a CHECK on the row), so where it
	 * saves is the host's rule, not a locale this descriptor could name.
	 *
	 * `fallback` is for the destination keys a host catalog may lack — the
	 * auth links predate their `*Href` keys — and is the built-in path.
	 */
	interface Props {
		text: WordingKey;
		href: HrefKey;
		fallback?: string;
		link: Snippet<[href: string, text: string]>;
	}

	let { text, href, fallback = '/', link }: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);

	const label = $derived(msg[text]?.() ?? '');
	const destination = $derived(msg[href]?.() ?? fallback);
	const descriptor = $derived(
		config.messageEdit
			? chromeProperty(href, { type: 'text', label: config.editMessages.edit_linkUrl() })
			: undefined
	);
</script>

<LinkEdit
	text={{ edit: config.messageEdit?.(text), value: label }}
	href={{ descriptor, value: destination }}
>
	{#snippet control()}{@render link(destination, label)}{/snippet}
</LinkEdit>
