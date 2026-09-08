import type { Snippet } from 'svelte';
import type { EditDescriptor, EntityOp, PropertyDescriptor, PropertyValue } from './types.js';

/**
 * The props of the five edit-chrome modules, in one component-free file.
 *
 * Each of these modules is TWO components with one interface: a GATE at the
 * name every renderer imports (`edit/Editable.svelte`, `edit/chrome/*`), and
 * the LIVE half under `edit/live/`, which a host installs through
 * `setEditAdapter(adapter, EDIT_CHROME)`. The gate decides whether editing is
 * on; the live half is the editing. A read-only host never imports the live
 * half, so it never ships it — the property the page tests used to assert on
 * the DOM alone ("byte-identical without descriptors") while the site's bundle
 * carried `dist/edit` regardless.
 *
 * The props live here rather than in either component so the two halves are
 * typed against ONE declaration and `EditChrome` (in `./context.ts`) can name
 * the live component's type without importing a `.svelte` file into a `.ts`
 * one.
 */

export interface EditableAttrs {
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

export interface EditableProps {
	/** Identity of the string. Omit it and this is a passthrough. */
	edit?: EditDescriptor;
	value: string;
	children: Snippet<[string, EditableAttrs]>;
}

/** What one framed component tells the frame about itself. */
export interface EditFrameSpec {
	/** Human name of the thing, e.g. "Fita: Neix la fundació". */
	label: string;
	/** Gates the gear — true when the panel snippet has rows to show. */
	hasPanel?: boolean;
	/** Gates the trash: removing this item from its collection. */
	removeOp?: Extract<EntityOp, { kind: 'remove' }>;
}

export interface EditFrameProps {
	spec?: EditFrameSpec;
	/** The panel content — an EditPanel with this component's rows. */
	panel?: Snippet;
	children: Snippet;
}

export interface EditPanelProps {
	rows: { descriptor: PropertyDescriptor; value: PropertyValue }[];
}

export interface AddSlotProps {
	op: Extract<EntityOp, { kind: 'create' }>;
	/** The entity noun for the label, e.g. "una fita". */
	label?: string;
}

export interface LinkEditProps {
	/** Inline-label half; undefined leaves the control alone. */
	text: { edit: EditDescriptor | undefined; value: string };
	/** Destination half; undefined hides the Adreça field. */
	href: { descriptor: PropertyDescriptor | undefined; value: string };
	/**
	 * Extra property rows under Adreça — a menu link's Ordre. Labelled from
	 * their descriptors, committed on Desa only when changed, and rendered
	 * BY TYPE: this used to be a bare text input whatever the descriptor
	 * said, which made it a second renderer that would silently miss any
	 * property type the package grew. An `image` row has no place in a link
	 * modal and is the one type refused here.
	 */
	extras?: { descriptor: PropertyDescriptor; value: string | null }[];
	/** With `adapter.applyOp`, the modal gains a confirmed Elimina action. */
	removeOp?: EntityOp;
	/** Accessible name for the modal, e.g. the link's current text. */
	label?: string;
	control: Snippet;
}
