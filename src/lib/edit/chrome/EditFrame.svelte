<script lang="ts">
	import type { EditFrameProps } from '../chrome-props.js';
	import { getEditAdapter, getEditChrome, setRecordFrame } from '../context.js';

	/**
	 * The page-builder wrapper's GATE. With no spec, no adapter or editing
	 * off it renders the children ALONE — zero wrapper element, so an
	 * unadapted app's DOM is byte-identical (pinned by test). Editing, it
	 * mounts the live frame the host installed (`edit/live/EditFrame.svelte`),
	 * which owns the corner toolbar, the property popover and the confirmed
	 * remove, and which applies the finer per-affordance gates itself.
	 * Components mount this INSIDE their own root element, so the wrapper
	 * never disturbs the parent's flex/grid. A frame whose spec names a
	 * `record` also tells its children so: inside it, `Editable` is inert.
	 */
	let { spec, panel, children }: EditFrameProps = $props();

	const adapter = getEditAdapter();
	const chrome = getEditChrome();

	const editing = $derived(spec !== undefined && (adapter?.isEditing ?? false));
	// ONE door per card: where the pencil opens the host's form, the children's
	// inline text stays plain (`Editable` reads this). The form holds every
	// field; a caption edited in place beside a form that edits it too was
	// two ways to change one thing, and the inline way only reached some.
	setRecordFrame(() => editing && spec?.record !== undefined && adapter?.openRecord !== undefined);
</script>

{#if editing && chrome}
	{@const Live = chrome.EditFrame}
	<Live {spec} {panel} {children} />
{:else}
	{@render children()}
{/if}
