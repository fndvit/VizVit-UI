import { flushSync } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SearchInput from '../../ui/SearchInput.svelte';
import SearchInputProbe from './SearchInputProbe.svelte';

/**
 * The debounce is the whole point of this module, and it is also the thing that
 * can outlive it: a timer scheduled on the last keystroke fires whether or not
 * the input is still on the page.
 */
function renderWith(onsearch: (query: string) => void) {
	const screen = render(SearchInput, {
		placeholder: 'Cerca weeklies',
		label: 'Cerca',
		onsearch,
		debounceMs: 300
	});
	return { screen, input: inputIn(screen.container) };
}

/** Renders through the probe, which owns `value` as live state. */
function renderProbe(onsearch: (query: string) => void, value = '') {
	let setValue!: (next: string) => void;
	const screen = render(SearchInputProbe, {
		onsearch,
		value,
		debounceMs: 300,
		control: (set) => {
			setValue = set;
		}
	});
	return {
		screen,
		input: inputIn(screen.container),
		setValue(next: string) {
			setValue(next);
			flushSync();
		}
	};
}

function inputIn(container: HTMLElement): HTMLInputElement {
	const input = container.querySelector('input');
	if (!input) throw new Error('SearchInput rendered no input');
	return input;
}

function type(input: HTMLInputElement, value: string): void {
	input.value = value;
	input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('SearchInput', () => {
	it('reports the trimmed query once the typing settles', () => {
		vi.useFakeTimers();
		try {
			const onsearch = vi.fn();
			const { input } = renderWith(onsearch);

			type(input, '  salut  ');
			expect(onsearch).not.toHaveBeenCalled();

			vi.advanceTimersByTime(300);
			expect(onsearch).toHaveBeenCalledExactlyOnceWith('salut');
		} finally {
			vi.useRealTimers();
		}
	});

	it('adopts a value the caller did not get from this input', () => {
		// A navigation that dropped the filters: the box must stop showing the
		// previous page's search text while the results come back unfiltered.
		const { input, setValue } = renderProbe(vi.fn(), 'salut');
		expect(input.value).toBe('salut');

		setValue('');

		expect(input.value).toBe('');
	});

	it('ignores the echo of its own query so it never overwrites live typing', () => {
		vi.useFakeTimers();
		try {
			const onsearch = vi.fn();
			const { input, setValue } = renderProbe(onsearch);

			type(input, 'sal');
			vi.advanceTimersByTime(300);
			expect(onsearch).toHaveBeenCalledExactlyOnceWith('sal');

			// The caller writes the reported query back while the reader keeps
			// typing. Adopting it here would truncate the box to "sal".
			type(input, 'salut');
			setValue('sal');

			expect(input.value).toBe('salut');
		} finally {
			vi.useRealTimers();
		}
	});

	it('cancels a pending search when it is destroyed', () => {
		vi.useFakeTimers();
		try {
			const onsearch = vi.fn();
			const { screen, input } = renderWith(onsearch);

			// Typing and then following a result card within the debounce window.
			type(input, 'salut');
			screen.unmount();
			vi.advanceTimersByTime(1000);

			// Firing here would call back into the weeklies index from a page the
			// reader has already left, rewriting that page's URL with the query.
			expect(onsearch).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});
});
