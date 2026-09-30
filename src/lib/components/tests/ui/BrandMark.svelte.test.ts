import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import BrandMark from '../../ui/BrandMark.svelte';

describe('BrandMark', () => {
	it('is decorative by default, and an image with a name when titled', () => {
		const bare = render(BrandMark).container.querySelector('svg')!;
		expect(bare.getAttribute('aria-hidden')).toBe('true');
		expect(bare.hasAttribute('role')).toBe(false);
		expect(bare.querySelectorAll('path')).toHaveLength(6);

		const named = render(BrandMark, { props: { title: 'ViT' } }).container.querySelector('svg')!;
		expect(named.getAttribute('role')).toBe('img');
		expect(named.getAttribute('aria-label')).toBe('ViT');
		expect(named.hasAttribute('aria-hidden')).toBe(false);
	});
});
