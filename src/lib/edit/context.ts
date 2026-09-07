import type { Component } from 'svelte';
import { getContext, setContext } from 'svelte';
import type {
	AddSlotProps,
	EditableProps,
	EditFrameProps,
	EditPanelProps,
	LinkEditProps
} from './chrome-props.js';
import type { EditAdapter } from './types.js';

const KEY = Symbol.for('@vit-foundation/ui:edit-adapter');

/**
 * The LIVE half of the edit chrome: the five components that turn a gate into
 * an editing surface. `EDIT_CHROME` in `./live/index.js` is the package's
 * table; a host installs it beside its adapter.
 *
 * Why the host passes it rather than the gates importing it. Every renderer
 * imports the gates — `Editable`, `EditFrame`, `EditPanel`, `AddSlot`,
 * `LinkEdit` — because a renderer that MIGHT be edited has to say where.
 * When the gates imported the live components too, a page module's static
 * import graph reached the contenteditable machinery, the property panel, the
 * link modal and the Modal primitive, and the public site shipped all of it
 * (`dist/edit`, 176 KB) to render nothing with it. Through this seam the
 * import is the host's: brain names the table once at its composition root,
 * the site never names it, and a bundler following the site's imports never
 * sees `edit/live/`. `live-isolation.test.ts` pins that no renderer reaches it.
 */
export interface EditChrome {
	Editable: Component<EditableProps>;
	EditFrame: Component<EditFrameProps>;
	EditPanel: Component<EditPanelProps>;
	AddSlot: Component<AddSlotProps>;
	LinkEdit: Component<LinkEditProps>;
}

interface Installed {
	adapter: EditAdapter;
	chrome: EditChrome;
}

/**
 * Installs the app's persistence adapter, and the chrome it drives, for the
 * subtree. An app that never calls this is read-only by construction: without
 * an adapter every edit affordance renders as plain content, byte-identical
 * to a build of the components with no edit mode at all — and, since 0.26,
 * without the edit mode's code in its bundle either.
 *
 * Both arguments are required. An adapter with no chrome would be an editing
 * host whose gates open onto nothing, and the failure would be a page that
 * silently does not edit; a chrome with no adapter has nothing to save
 * through. One call, two halves, so neither can be installed alone.
 */
export function setEditAdapter(adapter: EditAdapter, chrome: EditChrome): EditAdapter {
	setContext<Installed>(KEY, { adapter, chrome });
	return adapter;
}

/** The nearest adapter, or undefined in a read-only app. */
export function getEditAdapter(): EditAdapter | undefined {
	return getContext<Installed | undefined>(KEY)?.adapter;
}

/** The chrome installed beside the nearest adapter, or undefined in a read-only app. */
export function getEditChrome(): EditChrome | undefined {
	return getContext<Installed | undefined>(KEY)?.chrome;
}
