import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ImageCollage from '../../ui/ImageCollage.svelte';

const urls = ['/a.svg', '/b.svg', '/c.svg', '/d.svg', '/e.svg'];
const images = urls.map((url) => ({ url }));

describe('ImageCollage', () => {
	it('shows at most four images, the first as the large cell', () => {
		const { container } = render(ImageCollage, { props: { images } });

		const cells = [...container.querySelectorAll('.cell')];
		expect(cells).toHaveLength(4);
		expect(cells[0]?.classList.contains('big')).toBe(true);
		expect(cells.map((cell) => cell.querySelector('img')?.getAttribute('src'))).toEqual(
			urls.slice(0, 4)
		);
	});

	it.each([1, 2, 3, 4])('places %i images without a hole', (count) => {
		const { container } = render(ImageCollage, { props: { images: images.slice(0, count) } });

		const areas = [...container.querySelectorAll<HTMLElement>('.cell')].map(
			(cell) => cell.style.gridArea
		);
		expect(areas).toHaveLength(count);
		expect(areas.every((area) => area.length > 0)).toBe(true);
	});

	it('renders nothing for no images, and the alt on the large image only', () => {
		expect(
			render(ImageCollage, { props: { images: [] } }).container.querySelector('.collage')
		).toBeNull();

		const { container } = render(ImageCollage, {
			props: { images: images.slice(0, 2), alt: 'Mapa' }
		});
		expect([...container.querySelectorAll('img')].map((img) => img.getAttribute('alt'))).toEqual([
			'Mapa',
			''
		]);
	});

	it('links a picture where it leads: internal paths through the resolver, https outbound, anything else a plain picture', () => {
		const { container } = render(ImageCollage, {
			props: {
				images: [
					{ url: '/a.svg', href: '/what-we-do/aqli', label: 'AQLI' },
					{ url: '/b.svg', href: 'https://example.org/story' },
					{ url: '/c.svg', href: 'javascript:alert(1)' },
					{ url: '/d.svg', href: null }
				],
				linkLabel: 'Obre el projecte'
			}
		});

		const cells = [...container.querySelectorAll('.cell')];
		const doors = cells.map((cell) => cell.querySelector('a.door'));
		expect(doors[0]?.getAttribute('href')).toBe('/what-we-do/aqli');
		// The mask names the project, in bold; the link's name is the same sentence, plain.
		expect(doors[0]?.getAttribute('aria-label')).toBe('Al projecte AQLI');
		expect(doors[0]?.querySelector('.mask strong')?.textContent).toBe('AQLI');
		expect(doors[1]?.getAttribute('aria-label')).toBe('Obre el projecte');
		expect(doors[1]?.querySelector('.mask')?.textContent).toBe('Obre el projecte');
		expect(doors[1]?.getAttribute('href')).toBe('https://example.org/story');
		expect(doors[1]?.getAttribute('rel')).toBe('external noopener');
		expect(doors[2]).toBeNull();
		expect(doors[3]).toBeNull();
		expect(cells.map((cell) => cell.classList.contains('linked'))).toEqual([
			true,
			true,
			false,
			false
		]);
	});
});
