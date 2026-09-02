import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Icon from '../../ui/Icon.svelte';

describe('Icon', () => {
	it('renders the named path, decoratively', async () => {
		render(Icon, { name: 'plus' });

		const svg = document.querySelector('svg');
		expect(svg?.getAttribute('aria-hidden')).toBe('true');
		// The plus is the editor chrome's add affordance — pin it exists.
		expect(svg?.querySelector('path')?.getAttribute('d')).toBe('M12 5v14M5 12h14');
	});

	it('sizes through the prop, defaulting to 20', async () => {
		render(Icon, { name: 'home' });
		expect(document.querySelector('svg')?.getAttribute('width')).toBe('20');

		document.body.innerHTML = '';

		render(Icon, { name: 'home', size: 32 });
		expect(document.querySelector('svg')?.getAttribute('width')).toBe('32');
	});
});
