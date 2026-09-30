import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ArrowLink from '../../ui/ArrowLink.svelte';

describe('ArrowLink', () => {
	it('is one link: the sentence with its bold run, and a drawn arrow the reader never hears', () => {
		const { container } = render(ArrowLink, {
			props: { href: '/weeklies', text: 'A les **weeklies**' }
		});

		const link = container.querySelector('a')!;
		expect(link.getAttribute('href')).toBe('/weeklies');
		expect(link.textContent?.replace(/\s+/g, ' ').trim()).toBe('A les weeklies');
		expect(link.querySelector('strong')?.textContent).toBe('weeklies');
		const arrow = link.querySelector('.arrow')!;
		expect(arrow.getAttribute('aria-hidden')).toBe('true');
		expect(arrow.textContent).toBe('');
		expect(container.querySelectorAll('a')).toHaveLength(1);
	});

	it('opens an external destination as an external link, and renders no destination for anything else', () => {
		const external = render(ArrowLink, {
			props: { href: 'https://example.org/eina', text: 'A l’**eina**' }
		});
		const a = external.container.querySelector('a')!;
		expect(a.getAttribute('href')).toBe('https://example.org/eina');
		expect(a.getAttribute('rel')).toBe('external noopener');

		const hostile = render(ArrowLink, { props: { href: 'javascript:alert(1)', text: 'x' } });
		expect(hostile.container.querySelector('a')?.getAttribute('href') ?? null).toBeNull();
	});
});
