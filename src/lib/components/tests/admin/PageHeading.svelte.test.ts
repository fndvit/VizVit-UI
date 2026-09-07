import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PageHeading from '../../admin/PageHeading.svelte';

/**
 * The `level` prop decides a heading's RANK, which is a document-outline fact
 * rather than a styling one — so it is worth an assertion even though the size
 * difference is visible.
 *
 * It had none, and the branch is live: Brain uses `level={2}` at exactly one
 * place (the Workers section under its own Time Control `h1`) and the default
 * everywhere else. That single caller is also what makes this suite matter —
 * a regression to a fixed `h1` would leave one page with two.
 */
describe('PageHeading', () => {
	it('is an h1 by default', async () => {
		render(PageHeading, { rest: 'Users' });

		expect(document.querySelector('h1')?.textContent?.trim()).toBe('Users');
		expect(document.querySelector('h2')).toBeNull();
	});

	it('is an h2 at level 2, and not also an h1', async () => {
		render(PageHeading, { accent: 'Workers', rest: 'Time Control' });

		document.body.innerHTML = '';

		render(PageHeading, { accent: 'Workers', rest: 'Time Control', level: 2 });

		expect(document.querySelector('h2')).not.toBeNull();
		expect(document.querySelector('h1')).toBeNull();
	});

	it('renders the accent as emphasis inside the heading, not beside it', async () => {
		render(PageHeading, { accent: 'My', rest: 'Time Control' });

		const heading = document.querySelector('h1');
		// One heading, one accessible name — the accent is part of the text, so
		// "My Time Control" is announced as a single heading.
		expect(heading?.querySelector('em')?.textContent?.trim()).toBe('My');
		expect(heading?.textContent?.replace(/\s+/g, ' ').trim()).toBe('My Time Control');
	});

	/**
	 * The accent is optional on purpose: forcing one made call sites hand-roll
	 * their own `h1`, which is how a heading rule leaves a module.
	 */
	it('is a heading without an accent', async () => {
		render(PageHeading, { rest: 'Configurations' });

		expect(document.querySelector('h1 em')).toBeNull();
		expect(document.querySelector('h1')?.textContent?.trim()).toBe('Configurations');
	});
});
