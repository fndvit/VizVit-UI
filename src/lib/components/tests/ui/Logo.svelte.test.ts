import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Logo from '../../ui/Logo.svelte';

/**
 * Everything inside `root` a screen reader would announce, in DOM order.
 *
 * Written out rather than asserted attribute by attribute because the bug this
 * suite exists for was not a wrong attribute — every attribute was defensible
 * on its own. It was the TOTAL: the mark named itself and the wordmark named it
 * again, so the page said "Brain VIT Brain VIT" and no single assertion on
 * `aria-hidden`, `role` or `<title>` would have caught it.
 */
const announced = (root: Element): string[] => {
	const out: string[] = [];
	const walk = (node: Element) => {
		if (node.getAttribute('aria-hidden') === 'true') return;
		if (node.tagName.toLowerCase() === 'svg') {
			// An svg is announced only when it is given a role that makes it
			// content; its <title> is then the name.
			if (node.getAttribute('role') === 'img') {
				out.push(node.querySelector('title')?.textContent?.trim() ?? '(unnamed image)');
			}
			return;
		}
		if (node.children.length === 0) {
			const text = node.textContent?.trim();
			if (text) out.push(text);
			return;
		}
		for (const child of Array.from(node.children)) walk(child);
	};
	walk(root);
	return out;
};

const logo = () => document.querySelector('.logo') as HTMLElement;

describe('Logo', () => {
	it('announces the name exactly once when the wordmark is shown', async () => {
		render(Logo, { withWordmark: true });

		// The wordmark's own two elements, and nothing from the mark. It used to
		// be ['Brain VIT', 'Brain', 'VIT'] — the mark's <title> and then the
		// visible text saying it again.
		expect(announced(logo())).toEqual(['Brain', 'VIT']);
	});

	it('announces nothing when it stands alone', async () => {
		render(Logo, {});

		// Deliberately silent: the rail names it through `<a aria-label="Home">`
		// and the print sheet through the `<h1>` beside it. A name here would
		// double at those call sites the way it did at the wordmark ones.
		expect(announced(logo())).toEqual([]);
	});

	it('keeps the mark decorative in both branches', async () => {
		render(Logo, {});
		expect(document.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
		expect(document.querySelector('svg')?.getAttribute('role')).toBeNull();
		expect(document.querySelector('svg > title')).toBeNull();

		document.body.innerHTML = '';

		render(Logo, { withWordmark: true });
		expect(document.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
		expect(document.querySelector('svg')?.getAttribute('role')).toBeNull();
		expect(document.querySelector('svg > title')).toBeNull();
	});

	it('sizes through the prop, defaulting to 32', async () => {
		render(Logo, {});
		expect(document.querySelector('svg')?.getAttribute('height')).toBe('32');

		document.body.innerHTML = '';

		render(Logo, { size: 44 });
		expect(document.querySelector('svg')?.getAttribute('height')).toBe('44');
	});

	it('renders the wordmark only when asked', async () => {
		render(Logo, {});
		expect(document.querySelector('.wordmark')).toBeNull();

		document.body.innerHTML = '';

		render(Logo, { withWordmark: true });
		expect(document.querySelector('.wordmark')?.textContent?.trim()).toBe('Brain VIT');
	});
});
