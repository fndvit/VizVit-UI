import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ButtonProbe from './ButtonProbe.svelte';

/**
 * Button owns whether a submit is disabled while its form posts. The rule used
 * to live at the call sites: twelve of them wrote `disabled={x.pending > 0}`,
 * re-deriving that kit's `pending` is a count rather than a boolean, and two
 * wrote nothing at all — both logout, both double-submittable, with nothing
 * saying whether the omission was a decision.
 *
 * The prop is required and explicitly nullable, so a control that genuinely has
 * no pending state now declares it. These pin the arithmetic and the two ways a
 * button can be unavailable, which nothing reached before: the module had no
 * test of its own.
 */
describe('Button', () => {
	it('disables itself while its form is posting', async () => {
		render(ButtonProbe, { pending: 1 });

		await expect.element(page.getByRole('button')).toBeDisabled();
	});

	it('stays available at a count of zero, which is the resting state', async () => {
		// The whole reason the rule is `> 0` and not truthiness: a form that has
		// never been submitted reports 0, and 0 must not read as pending.
		render(ButtonProbe, { pending: 0 });

		await expect.element(page.getByRole('button')).toBeEnabled();
	});

	it('stays available when it has no pending state to read', async () => {
		// `null` is the classic action="?/…" post: no remote form, no count.
		render(ButtonProbe, { pending: null });

		await expect.element(page.getByRole('button')).toBeEnabled();
	});

	it('honours a disabled of its own, which is a different reason', async () => {
		// The Google button before consent: unavailable while nothing is posting.
		render(ButtonProbe, { pending: 0, disabled: true });

		await expect.element(page.getByRole('button')).toBeDisabled();
	});

	it('marks itself busy only while posting', async () => {
		render(ButtonProbe, { pending: 2 });
		await expect.element(page.getByRole('button')).toHaveAttribute('aria-busy', 'true');

		document.body.innerHTML = '';

		render(ButtonProbe, { pending: null, disabled: true });
		// Absent, not "false": a button that is unavailable for its own reason is
		// not doing anything, and aria-busy="false" on every idle control is noise.
		expect(document.querySelector('button')?.hasAttribute('aria-busy')).toBe(false);
	});
});
