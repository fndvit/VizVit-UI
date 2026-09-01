import { getContext, setContext } from 'svelte';
import type { EditAdapter } from './types.js';

const KEY = Symbol.for('@vitfoundation/ui:edit-adapter');

/**
 * Installs the app's persistence adapter for the subtree. An app that never
 * calls this is read-only by construction: without an adapter every edit
 * affordance renders as plain content, byte-identical to a build of the
 * components with no edit mode at all.
 */
export function setEditAdapter(adapter: EditAdapter): EditAdapter {
	return setContext(KEY, adapter);
}

/** The nearest adapter, or undefined in a read-only app. */
export function getEditAdapter(): EditAdapter | undefined {
	return getContext<EditAdapter | undefined>(KEY);
}
