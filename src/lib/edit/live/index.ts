import type { EditChrome } from '../context.js';
import AddSlot from './AddSlot.svelte';
import Editable from './Editable.svelte';
import EditFrame from './EditFrame.svelte';
import EditPanel from './EditPanel.svelte';
import LinkEdit from './LinkEdit.svelte';

/**
 * The package's edit chrome, as the table a host hands `setEditAdapter`.
 *
 * This is the ONE module outside `edit/live/` allowed to import the live
 * components (see `live-isolation.test.ts`). A host that edits imports it —
 * brain, at its mirror layout — and a host that only renders never names it,
 * which is what keeps the live half out of that host's bundle.
 */
export const EDIT_CHROME: EditChrome = { Editable, EditFrame, EditPanel, AddSlot, LinkEdit };
