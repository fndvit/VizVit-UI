import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { chromeEdit, pageCopyEdit } from '../../../edit/helpers.js';
import SplashHeroProbe from './SplashHeroProbe.svelte';

const title = 'Fundació **Visualització** per a la **Transparència**';
const tagline = 'La visualització pot **transformar** les dades obertes i la **transparència**.';
const props = { title, tagline };
const adapter = () => ({ isEditing: true, save: vi.fn(async () => {}) });

describe('SplashHero', () => {
	it('sets the h1 from the title, the tagline with its strong runs, the wordmark and the hint as décor', () => {
		const { container } = render(SplashHeroProbe, { props });

		expect(container.querySelector('h1')?.textContent).toBe(
			'Fundació Visualització per a la Transparència'
		);
		expect([...container.querySelectorAll('h1 strong')].map((s) => s.textContent)).toEqual([
			'Visualització',
			'Transparència'
		]);
		expect([...container.querySelectorAll('.tagline strong')].map((s) => s.textContent)).toEqual([
			'transformar',
			'transparència'
		]);
		expect(container.querySelector('.tagline')?.textContent).toBe(
			'La visualització pot transformar les dades obertes i la transparència.'
		);
		expect(container.querySelector('.wordmark')?.getAttribute('aria-hidden')).toBe('true');
		expect(container.querySelector('.wordmark svg.brand-mark')).not.toBeNull();
		expect(container.querySelector('.mosaic svg')?.getAttribute('aria-hidden')).toBe('true');
		expect(container.querySelector('.hint')?.textContent).toBe("Desplaça't");
	});

	it('draws the same mosaic twice — the seed decides, so hydration never repaints it', () => {
		const one = render(SplashHeroProbe, { props });
		const two = render(SplashHeroProbe, { props });

		const picture = (root: ParentNode): string =>
			[...root.querySelectorAll('.mosaic svg > g.tile')].map((tile) => tile.outerHTML).join('|');
		expect(picture(one.container)).toBe(picture(two.container));
		expect(one.container.querySelectorAll('.mosaic svg > g.tile').length).toBeGreaterThan(30);
	});

	it('editing: opens the title and the tagline inline; the runs stay until a caret lands, then the raw markers', async () => {
		const { container } = render(SplashHeroProbe, {
			props: {
				...props,
				titleEdit: pageCopyEdit('home', 'hero_title', 'ca', { label: 'Bloc hero_title' }),
				taglineEdit: pageCopyEdit('home', 'hero_subtitle', 'ca', { format: 'multiline' }),
				adapter: adapter(),
				config: { messageEdit: (key) => chromeEdit(key, 'ca', { label: `Text ${key}` }) }
			}
		});

		expect(container.querySelector('h1')?.getAttribute('aria-label')).toBe('Bloc hero_title');
		expect(container.querySelector('h1 strong')).not.toBeNull();
		const paragraph = container.querySelector<HTMLElement>('.tagline')!;
		expect(paragraph.hasAttribute('contenteditable')).toBe(true);
		expect(paragraph.querySelector('strong')).not.toBeNull();
		paragraph.focus();
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(paragraph.querySelector('strong')).toBeNull();
		expect(paragraph.textContent).toBe(tagline);
		paragraph.blur();
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(paragraph.querySelector('strong')).not.toBeNull();
		expect(container.querySelector('.hint')?.getAttribute('aria-label')).toBe(
			'Text hero_scrollHint'
		);
	});

	it('renders byte-identically with and without descriptors when nothing edits', () => {
		const bare = render(SplashHeroProbe, { props });
		const described = render(SplashHeroProbe, {
			props: { ...props, titleEdit: pageCopyEdit('home', 'hero_title', 'ca') }
		});

		expect(described.container.innerHTML).toBe(bare.container.innerHTML);
	});
});

/** Once every finite animation in the splash — the entrance — has played. */
const settled = (splash: HTMLElement): Promise<unknown> =>
	Promise.all(
		splash
			.getAnimations({ subtree: true })
			.filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
			.map((animation) => animation.finished)
	);

describe('SplashHero, the text and the tiles', () => {
	it('draws no tile under the label, the mark or the tagline once it has measured them', async () => {
		const { container } = render(SplashHeroProbe, { props });
		const splash = container.querySelector<HTMLElement>('.splash')!;
		// The measurement runs after mount; wait for the redraw, then for the
		// tiles to have travelled to their places.
		await new Promise((resolve) => setTimeout(resolve, 50));
		await settled(splash);

		const boxes = [...splash.querySelectorAll('h1, .wordmark, .tagline')].map((box) =>
			box.getBoundingClientRect()
		);
		const overlaps = [...splash.querySelectorAll('svg > g.tile > .shape')].filter((shape) => {
			const r = shape.getBoundingClientRect();
			return boxes.some(
				(b) => r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top
			);
		});
		expect(overlaps).toEqual([]);
	});

	it('measures the resting boxes even when it measures mid-parallax', async () => {
		const { container } = render(SplashHeroProbe, { props });
		const splash = container.querySelector<HTMLElement>('.splash')!;
		await new Promise((resolve) => setTimeout(resolve, 50));

		// The page is scrolled: the mosaic has moved up and shrunk under the
		// text. A resize now makes the splash measure in that state.
		splash.style.setProperty('--vit-splash-progress', '1');
		container.style.width = '900px';
		await new Promise((resolve) => setTimeout(resolve, 100));
		container.style.width = '';
		await new Promise((resolve) => setTimeout(resolve, 100));
		// Back at the top.
		splash.style.setProperty('--vit-splash-progress', '0');
		await new Promise((resolve) => setTimeout(resolve, 50));
		await settled(splash);

		const boxes = [...splash.querySelectorAll('h1, .wordmark, .tagline')].map((box) =>
			box.getBoundingClientRect()
		);
		const overlaps = [...splash.querySelectorAll('svg > g.tile > .shape')].filter((shape) => {
			const r = shape.getBoundingClientRect();
			return boxes.some(
				(b) => r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top
			);
		});
		expect(overlaps).toEqual([]);
	});

	it('arrives: the tiles travel to their places and the words rise after them', async () => {
		const { container } = render(SplashHeroProbe, { props });
		const splash = container.querySelector<HTMLElement>('.splash')!;

		const tile = splash.querySelector('g.tile.arrive > .shape');
		expect(tile).not.toBeNull();
		const names = (selector: string) =>
			getComputedStyle(splash.querySelector(selector)!).animationName;
		expect(names('g.tile.arrive > .shape')).not.toBe('none');
		expect(names('h1')).toBe(names('.tagline'));
		expect(names('.wordmark path')).not.toBe('none');
		expect(names('.scroll')).not.toBe('none');
		// A stroke is unseen until its turn, and keeps its own level after.
		const strokes = [...splash.querySelectorAll<SVGPathElement>('.wordmark path')];
		expect(strokes.map((stroke) => getComputedStyle(stroke).opacity)).toEqual(
			strokes.map(() => '0')
		);
		expect(strokes.map((stroke) => getComputedStyle(stroke).fillOpacity)).toEqual([
			'0.7',
			'0.45',
			'0.9',
			'0.45',
			'0.9',
			'0.9'
		]);
		expect(
			parseFloat(getComputedStyle(splash.querySelector('.scroll')!).animationDelay)
		).toBeGreaterThan(parseFloat(getComputedStyle(splash.querySelector('h1')!).animationDelay));
		await settled(splash);
		expect(getComputedStyle(splash.querySelector('.tagline')!).opacity).toBe('1');
		expect(strokes.map((stroke) => getComputedStyle(stroke).opacity)).toEqual(
			strokes.map(() => '1')
		);
	});
});
