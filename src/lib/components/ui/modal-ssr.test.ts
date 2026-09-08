import { render } from 'svelte/server';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import Modal from './Modal.svelte';

/**
 * The server never emits a <dialog>. See Modal's docblock for the defect this
 * pins: a dialog rendered in flow inside phrasing content splits its parent at
 * parse time, and every mirror page in brain's edit mode paid for it through
 * LinkEdit inside NewsletterSignup's <p>. A node test rather than a browser
 * one on purpose — the browser never sees the string the parser saw.
 */
describe('Modal on the server', () => {
	const children = createRawSnippet(() => ({ render: () => '<p>inside</p>' }));

	it.each([true, false])('renders no dialog element (open: %s)', (open) => {
		const { body } = render(Modal, {
			props: { open, title: 'Títol', onclose: () => {}, children }
		});
		expect(body).not.toContain('<dialog');
		expect(body).not.toContain('inside');
	});

	it('is safe as the child of a paragraph, which is where LinkEdit puts it', () => {
		const { body } = render(Modal, {
			props: { open: false, title: 'Títol', onclose: () => {}, children }
		});
		// Nothing rendered means nothing for a <p> ancestor to be split by.
		expect(body.replace(/<!--.*?-->/g, '').trim()).toBe('');
	});
});
