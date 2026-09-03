<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getUiConfig } from '../config/context.js';
	import { getEditAdapter } from './context.js';
	import { commitState } from './commit.svelte.js';
	import type { EditDescriptor } from './types.js';

	/**
	 * The inline-edit primitive. It renders no element of its own: the child
	 * snippet receives the text and a bag of attributes, and spreads both onto
	 * whatever semantic element the call site owns —
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
	 * empty attribute bag: no listeners, no wrapper, no cost.
	 *
	 * Active, it makes the element a plain-text `contenteditable` textbox.
	 * The DOM owns the draft while the reader types; this component reads it
	 * back on commit. Enter commits single-line fields (Cmd/Ctrl+Enter for
	 * 'multiline'), Escape reverts to the last saved value, blur commits a
	 * dirty draft. A failed save keeps the draft on screen in the error state
	 * so nothing typed is lost. State is announced through a visually hidden
	 * `role="status"` region, the pattern ShareRow set for its copy action.
	 *
	 * Styling for the affordance lives in base.css (`[data-vit-editing]`):
	 * the element is rendered by the *caller's* markup, which scoped styles
	 * here could never reach.
	 */
	interface EditableAttrs {
		contenteditable?: 'plaintext-only' | 'true';
		role?: 'textbox';
		'aria-label'?: string;
		'aria-multiline'?: 'true';
		'data-vit-editing'?: 'idle' | 'dirty' | 'saving' | 'error';
		onbeforeinput?: (event: InputEvent) => void;
		oninput?: (event: Event) => void;
		onblur?: (event: FocusEvent) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		onpaste?: (event: ClipboardEvent) => void;
	}

	interface Props {
		/** Identity of the string. Omit it and this is a passthrough. */
		edit?: EditDescriptor;
		value: string;
		children: Snippet<[string, EditableAttrs]>;
	}

	let { edit, value, children }: Props = $props();

	const adapter = getEditAdapter();
	const config = getUiConfig();

	/**
	 * The commit lifecycle — the four states, the announcements, the last
	 * persisted value and the follow-the-prop rule — is shared with
	 * `PropertyRow` (see `./commit.svelte.js`). What stays here is where the
	 * DRAFT lives: in the DOM, because this is a contenteditable.
	 */
	// svelte-ignore state_referenced_locally
	const commit_ = commitState(value, config.editMessages);
	/** What the child snippet renders. Only rewritten while the DOM is not
	 * being typed in — Svelte and the reader must not fight over the node. */
	// svelte-ignore state_referenced_locally
	let renderText = $state(value);

	$effect(() => {
		const adopted = commit_.follow(value);
		if (adopted !== null) renderText = adopted;
	});

	const active = $derived(edit !== undefined && (adapter?.isEditing ?? false));
	const multiline = $derived(edit?.format === 'multiline' || edit?.format === 'richtext');

	/** contenteditable text, innerText keeps line breaks; NBSPs become spaces. */
	function textOf(element: HTMLElement): string {
		return (element.innerText ?? element.textContent ?? '').replace(/\u00a0/g, ' ');
	}

	function handleBeforeInput(event: InputEvent): void {
		// 'plaintext-only' is not universal (Firefox); strip rich insertions.
		if (event.inputType === 'insertFromPaste' || event.inputType === 'insertFromDrop') return;
		if (!multiline && event.inputType === 'insertParagraph') event.preventDefault();
	}

	function handlePaste(event: ClipboardEvent): void {
		// Plain text only, whatever the clipboard holds.
		event.preventDefault();
		const text = event.clipboardData?.getData('text/plain') ?? '';
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;
		const range = selection.getRangeAt(0);
		range.deleteContents();
		range.insertNode(document.createTextNode(multiline ? text : text.replace(/\s*\n\s*/g, ' ')));
		selection.collapseToEnd();
		commit_.markDirty();
	}

	function handleInput(): void {
		commit_.markDirty();
	}

	async function commit(element: HTMLElement): Promise<void> {
		if (!edit || !adapter) return;
		const draft = textOf(element).trim();
		if (draft === commit_.saved) {
			commit_.settle();
			return;
		}
		// A failed save leaves the draft in the DOM; the reader decides whether
		// to retry.
		await commit_.commit(draft, () => adapter.save(edit, draft));
	}

	function handleBlur(event: FocusEvent): void {
		const status = commit_.status;
		if (status === 'dirty' || status === 'error') void commit(event.currentTarget as HTMLElement);
	}

	function handleKeydown(event: KeyboardEvent): void {
		const element = event.currentTarget as HTMLElement;
		if (event.key === 'Escape') {
			// Svelte's cached text still equals renderText, so a state write
			// alone cannot repaint a node the reader has mutated: restore the
			// DOM directly, then settle.
			element.textContent = commit_.saved;
			commit_.revert();
			element.blur();
			return;
		}
		const commitKey = multiline
			? event.key === 'Enter' && (event.metaKey || event.ctrlKey)
			: event.key === 'Enter';
		if (commitKey) {
			event.preventDefault();
			void commit(element);
		}
	}

	const attrs = $derived<EditableAttrs>(
		active
			? {
					contenteditable: 'plaintext-only',
					role: 'textbox',
					'aria-label': edit?.label,
					'aria-multiline': multiline ? 'true' : undefined,
					'data-vit-editing': commit_.status,
					onbeforeinput: handleBeforeInput,
					oninput: handleInput,
					onblur: handleBlur,
					onkeydown: handleKeydown,
					onpaste: handlePaste
				}
			: {}
	);
</script>

{@render children(renderText, attrs)}
{#if active}
	<span class="status" role="status">{commit_.announcement}</span>
{/if}

<style>
	.status {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
</style>
