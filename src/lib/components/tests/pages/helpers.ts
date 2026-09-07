import type { Component } from 'svelte';
import { vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { UiConfig, UiConfigInput } from '../../../config/types.js';
import type { CopyEditFor, PageId } from '../../../content/pages.js';
import { chromeEdit, pageCopyEdit } from '../../../edit/helpers.js';
import type { EditAdapter } from '../../../edit/types.js';
import PageEditProbe from './PageEditProbe.svelte';

/**
 * What every page test needs: an adapter with all three capabilities on, a
 * copy editor that labels each block by its key (so `aria-label` proves WHICH
 * descriptor reached `Editable`), the chrome-wording seam, and the one
 * selector that names every editing affordance the package can render.
 */
export function fullAdapter(): EditAdapter {
	return {
		isEditing: true,
		save: vi.fn(async () => {}),
		saveProperty: vi.fn(async () => {}),
		applyOp: vi.fn(async () => {})
	};
}

export const copyEditFor =
	<P extends PageId>(page: P): CopyEditFor<P> =>
	(key) =>
		pageCopyEdit(page, key, 'ca', { label: `Bloc ${key}` });

export const messageEdit: NonNullable<UiConfig['messageEdit']> = (key) =>
	chromeEdit(key, 'ca', { label: `Text ${key}` });

/**
 * Every affordance edit mode can add to a page: the contenteditable and its
 * state hook, the frame, the add slot, the link-modal button and the
 * ActionLabel swap. A read-only render must match NONE of them.
 */
export const AFFORDANCES =
	'[contenteditable], [data-vit-editing], .vit-edit-frame, button.add, .link-swap, .action-label';

export function host(container: ParentNode): HTMLElement {
	const found = container.querySelector<HTMLElement>('[data-testid="page-host"]');
	if (!found) throw new Error('page probe rendered no host');
	return found;
}

export const textOf = (root: ParentNode, selector: string): string[] =>
	[...root.querySelectorAll(selector)].map((element) => element.textContent?.trim() ?? '');

export const labelOf = (root: ParentNode, selector: string): string | null =>
	root.querySelector(selector)?.getAttribute('aria-label') ?? null;

/**
 * Mounts one page module through the probe, with the page's OWN props type
 * checked against it — the one place the probe's untyped `page`/`props` pair
 * is bound, so a test that passes a wrong prop fails to compile here rather
 * than rendering nothing.
 */
// `Record<string, any>` is Svelte's own constraint on `Component<Props>`: a
// page's `interface Props` has no index signature, so the `unknown` spelling
// never matches it and inference falls back to the constraint.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mountPage<P extends Record<string, any>>(
	page: Component<P>,
	// NoInfer: P is the PAGE's props type; a test's literal with an `edit` key
	// must be checked against it, not widen it.
	options: { props: NoInfer<P>; adapter?: EditAdapter | null; config?: UiConfigInput }
): ReturnType<typeof render> {
	const Probe = PageEditProbe as unknown as Component<{
		page: Component<P>;
		props: P;
		adapter?: EditAdapter | null;
		config?: UiConfigInput;
	}>;
	// Under `props`: the probe's own `props` key would otherwise read as render's option.
	return render(Probe, { props: { page, ...options } });
}

/** A per-row edit-map spy that answers nothing, typed so `mock.calls` keeps the row. */
export const rowSpy = <Row>() => vi.fn<(row: Row) => undefined>(() => undefined);
