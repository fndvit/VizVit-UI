import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DateText from '../../ui/DateText.svelte';

/**
 * The `datetime` attribute is a silent-failure invariant: a <time> that loses
 * it renders identically, so nothing on screen reveals the loss and only
 * assistive technology and search engines pay. Seven render sites restated it
 * before DateText owned it; this file pins what the owner guarantees.
 *
 * The rendered sentence is Intl's, not ours, so it is never asserted
 * literally — only that the two accepted input shapes agree on it.
 */
function renderTime(value: string): HTMLTimeElement {
	const { container } = render(DateText, { value });
	const time = container.querySelector('time');
	if (!time) throw new Error('DateText rendered no <time> element');
	return time;
}

describe('DateText', () => {
	it('puts the ISO value in datetime and a formatted day in the text', () => {
		const time = renderTime('2026-03-14');

		expect(time.getAttribute('datetime')).toBe('2026-03-14');
		expect(time.textContent?.trim()).toMatch(/2026/);
	});

	it('keeps the whole timestamp in datetime while showing only the day', () => {
		// A comment's createdAt. formatDate cannot parse a timestamp, so the
		// call site sliced it by hand; the module owns both halves now.
		const time = renderTime('2026-03-14T09:41:00.000Z');

		expect(time.getAttribute('datetime')).toBe('2026-03-14T09:41:00.000Z');
		expect(time.textContent?.trim()).toBe(renderTime('2026-03-14').textContent?.trim());
	});

	it('resolves a timestamp to its day in the foundation, not in UTC', () => {
		// 23:30 UTC on the 28th is 01:30 on the 29th in Barcelona. Taking the
		// first ten characters of the UTC value showed readers the 28th, so
		// every comment posted after local midnight was dated a day early.
		// The mid-morning timestamp above cannot expose this; only a value on
		// the far side of the offset can.
		const time = renderTime('2026-08-28T23:30:00.000Z');

		expect(time.getAttribute('datetime')).toBe('2026-08-28T23:30:00.000Z');
		expect(time.textContent?.trim()).toBe(renderTime('2026-08-29').textContent?.trim());
	});

	it('reads a date-only value the same way wherever it renders', () => {
		// publishedOn is a `date` column: a calendar day with no instant, so no
		// timezone may shift it. Pinned because the timestamp branch above is
		// resolved in Europe/Madrid and must not drag this one with it.
		expect(renderTime('2026-01-01').textContent?.trim()).toMatch(/1.*2026/);
		expect(renderTime('2026-12-31').textContent?.trim()).toMatch(/31.*2026/);
	});
});
