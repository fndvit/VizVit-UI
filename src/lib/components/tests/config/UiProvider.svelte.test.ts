import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LocaleProbe from './LocaleProbe.svelte';

describe('UiProvider', () => {
	it('feeds the provided locale to consumers', () => {
		const { container } = render(LocaleProbe, { props: { locale: 'en' } });

		expect(container.querySelector('time')?.textContent).toContain('Aug');
	});

	// A snapshot provider silently freezes locale switching and current-page
	// highlighting; this pins that config reads stay live.
	it('re-renders consumers when the provided locale changes', async () => {
		const screen = render(LocaleProbe, { props: { locale: 'ca' } });
		expect(screen.container.querySelector('time')?.textContent).toContain('ag.');

		await screen.rerender({ locale: 'en' });

		await expect.poll(() => screen.container.querySelector('time')?.textContent).toContain('Aug');
	});
});
