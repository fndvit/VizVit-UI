<script lang="ts">
	import type { EditableProps } from './chrome-props.js';
	import { getEditAdapter, getEditChrome } from './context.js';

	/**
	 * The inline-edit primitive's GATE. It renders no element of its own: the
	 * child snippet receives the text and a bag of attributes, and spreads
	 * both onto whatever semantic element the call site owns —
	 *
	 *   <Editable edit={descriptor} value={title}>
	 *     {#snippet children(text, attrs)}<h3 {...attrs}>{text}</h3>{/snippet}
	 *   </Editable>
	 *
	 * — the same contract Field uses for its control attrs, and for the same
	 * reason: the element (h1, p, span) is part of the document outline and
	 * belongs to the caller, not behind a prop.
	 *
	 * Inactive — no `edit` descriptor, no adapter in context (a read-only
	 * app), or the adapter's `isEditing` off — it renders the child with an
	 * empty attribute bag: no listeners, no wrapper, no cost. Active, it
	 * mounts the LIVE half the host installed (`edit/live/Editable.svelte`,
	 * through `setEditAdapter`'s chrome), which owns the contenteditable, the
	 * commit lifecycle and the announcements. This file imports none of that,
	 * so a renderer that imports it ships none of that (`chrome-props.ts`).
	 */
	let { edit, value, children }: EditableProps = $props();

	const adapter = getEditAdapter();
	const chrome = getEditChrome();

	const active = $derived(edit !== undefined && (adapter?.isEditing ?? false));
</script>

{#if active && chrome}
	{@const Live = chrome.Editable}
	<Live {edit} {value} {children} />
{:else}
	{@render children(value, {})}
{/if}
