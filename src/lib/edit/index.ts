export { getEditAdapter, setEditAdapter } from './context.js';
export { collectionEditing } from './collection.svelte.js';
export type { CollectionEditing, RemovableMap } from './collection.svelte.js';
export { default as ActionLabel } from './ActionLabel.svelte';
export { default as Editable } from './Editable.svelte';
export { default as AddSlot } from './chrome/AddSlot.svelte';
export { default as ConfirmDialog } from './chrome/ConfirmDialog.svelte';
export { default as EditFrame } from './chrome/EditFrame.svelte';
export type { EditFrameSpec } from './chrome/EditFrame.svelte';
export { default as EditPanel } from './chrome/EditPanel.svelte';
export { default as EditPopover } from './chrome/EditPopover.svelte';
export { default as LinkEdit } from './chrome/LinkEdit.svelte';
export {
	chromeEdit,
	chromeProperty,
	collectionOf,
	entityEdit,
	entityProperty,
	pageCopyEdit
} from './helpers.js';
export { localize } from './types.js';
export type {
	CollectionRef,
	ContentRef,
	EditableEntity,
	EditAdapter,
	EditDescriptor,
	EntityOp,
	LocalizedText,
	PropertyDescriptor,
	PropertyOption,
	PropertyType,
	PropertyValue
} from './types.js';
// The rule behind chromeEdit's key parameter, next to the helper that enforces it.
export type { NotParameterized, ParameterlessKey } from '../config/types.js';
