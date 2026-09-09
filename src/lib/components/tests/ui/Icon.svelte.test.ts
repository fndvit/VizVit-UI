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

	/**
	 * The rail of an admin app names its icon by `IconName`, so a glyph that is
	 * not in the set is a compile error there rather than a missing picture.
	 * The calendar module went out wearing `clock` while this one did not exist.
	 */
	it('draws the calendar the rails ask for', async () => {
		render(Icon, { name: 'calendar' });

		const d = document.querySelector('svg path')?.getAttribute('d');
		expect(d).toContain('M5 6h14');
		// Its two hanging tabs, which is what makes it read as a month sheet.
		expect(d).toContain('M8.5 3.5V6');
	});

	it('sizes through the prop, defaulting to 20', async () => {
		render(Icon, { name: 'home' });
		expect(document.querySelector('svg')?.getAttribute('width')).toBe('20');

		document.body.innerHTML = '';

		render(Icon, { name: 'home', size: 32 });
		expect(document.querySelector('svg')?.getAttribute('width')).toBe('32');
	});
});
