import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { SiteLink } from '../../../config/types.js';
import { chromeEdit, entityProperty } from '../../../edit/helpers.js';
import type { EditAdapter } from '../../../edit/types.js';
import CardMedia from '../../ui/CardMedia.svelte';
import WeeklieCard from '../../weeklies/WeeklieCard.svelte';
import MediaLinksProbe from './MediaLinksProbe.svelte';

/**
 * This branch's surface: CardMedia degrades to a placeholder instead of the
 * browser's broken-image box, the draft flag renders its badge (and only
 * then), and the nav/footer links carry the same frame/panel/collection
 * mechanics every other list already has. Panel mechanics themselves are
 * EditChrome.svelte.test.ts's.
 */

const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

describe('CardMedia fallback', () => {
	it('renders the image on the happy path, with no placeholder', () => {
		const { container } = render(CardMedia, {
			props: { src: '/x.svg', alt: '', ratio: '1 / 1' }
		});
		expect(container.querySelector('img')).not.toBeNull();
		expect(container.querySelector('.placeholder')).toBeNull();
	});

	it('renders the placeholder directly when src is null, keeping the footprint', () => {
		const { container } = render(CardMedia, {
			props: { src: null, alt: '', width: '1200', height: '675' }
		});
		expect(container.querySelector('img')).toBeNull();
		const placeholder = container.querySelector<HTMLElement>('.placeholder')!;
		expect(placeholder.style.aspectRatio).toBe('1200 / 675');
		expect(placeholder.getAttribute('aria-hidden')).toBe('true');
	});

	it('keeps the accessible name when the image was named', () => {
		const { container } = render(CardMedia, {
			props: { src: null, alt: 'Retrat', ratio: '4 / 5' }
		});
		const placeholder = container.querySelector<HTMLElement>('.placeholder')!;
		expect(placeholder.getAttribute('role')).toBe('img');
		expect(placeholder.getAttribute('aria-label')).toBe('Retrat');
	});

	it('a load error swaps to the placeholder', async () => {
		const { container } = render(CardMedia, {
			props: { src: '/does-not-exist.png', alt: '', ratio: '1 / 1' }
		});
		container.querySelector('img')!.dispatchEvent(new Event('error'));
		await settle();
		expect(container.querySelector('img')).toBeNull();
		expect(container.querySelector('.placeholder')).not.toBeNull();
	});
});

describe('draft badge', () => {
	const weekly = {
		id: 1,
		number: 1,
		slug: 's-1',
		publishedOn: '2026-01-05',
		title: 'Títol',
		excerpt: 'Extracte',
		imageUrl: '/x.svg'
	};

	it('absent draft renders byte-identically to before the flag existed', () => {
		const plain = render(WeeklieCard, { props: { weekly } });
		const explicit = render(WeeklieCard, { props: { weekly: { ...weekly, draft: false } } });
		expect(explicit.container.innerHTML).toBe(plain.container.innerHTML);
		expect(plain.container.querySelector('.draft')).toBeNull();
	});

	it('draft: true wears the chip', () => {
		const { container } = render(WeeklieCard, {
			props: { weekly: { ...weekly, draft: true } }
		});
		expect(container.querySelector('.draft')?.textContent).toBe('Esborrany');
	});
});

const links: SiteLink[] = [
	{ id: 1, href: '/what-we-do', label: 'Què fem', order: 0 },
	{ href: '/legacy', label: 'Sense id' }
];

function fullAdapter(overrides: Partial<EditAdapter> = {}): EditAdapter {
	return {
		isEditing: true,
		save: vi.fn(async () => {}),
		saveProperty: vi.fn(async () => {}),
		applyOp: vi.fn(async () => {}),
		...overrides
	};
}

const linkMap = (link: SiteLink) =>
	link.id === undefined
		? undefined
		: {
				href: entityProperty('site_links', link.id)('href', {
					type: 'url' as const,
					label: 'Enllaç'
				}),
				order: entityProperty('site_links', link.id)('sortOrder', {
					type: 'text' as const,
					label: 'Ordre'
				})
			};

describe('nav/footer structural editing', () => {
	it('read-only renders byte-identically with or without the new props', () => {
		const plain = render(MediaLinksProbe, { props: { show: 'nav', links } });
		const wired = render(MediaLinksProbe, {
			props: {
				show: 'nav',
				links,
				propertiesFor: linkMap,
				collection: { entity: 'site_links' as const }
			}
		});
		expect(wired.container.innerHTML).toBe(plain.container.innerHTML);
	});

	it('the href row carries the link href and commits through saveProperty', async () => {
		const saveProperty = vi.fn(async () => {});
		const { container } = render(MediaLinksProbe, {
			props: {
				show: 'footer',
				links,
				propertiesFor: linkMap,
				collection: { entity: 'site_links' as const },
				adapter: fullAdapter({ saveProperty })
			}
		});
		container.querySelector<HTMLButtonElement>('.toolbar button')!.click();
		await settle();
		const input = container.querySelector<HTMLInputElement>('[role="dialog"] input[type="url"]')!;
		expect(input.value).toBe('/what-we-do');
		input.value = '/que-fem';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await settle();
		expect(saveProperty).toHaveBeenCalledWith(linkMap(links[0])!.href, '/que-fem');
	});

	it('an add slot fires the collection create; a link without id gets no frame', async () => {
		const applyOp = vi.fn(async () => {});
		const { container } = render(MediaLinksProbe, {
			props: {
				show: 'nav',
				links,
				propertiesFor: linkMap,
				collection: { entity: 'site_links' as const },
				adapter: fullAdapter({ applyOp })
			}
		});
		// One frame for the identified link, none for the legacy one.
		expect(container.querySelectorAll('.links .vit-edit-frame')).toHaveLength(1);
		container.querySelector<HTMLButtonElement>('.links button.add')!.click();
		await settle();
		expect(applyOp).toHaveBeenCalledWith({
			kind: 'create',
			collection: { entity: 'site_links' }
		});
	});
});

describe('newsletter links join edit mode', () => {
	it('the signup/login links swap for editable labels while editing', () => {
		const { container } = render(MediaLinksProbe, {
			props: {
				show: 'newsletter',
				adapter: fullAdapter(),
				messageEdit: (key) => chromeEdit(key, 'ca')
			}
		});
		const editables = [...container.querySelectorAll('.action-label')].map((el) =>
			el.textContent?.trim()
		);
		expect(editables.length).toBeGreaterThanOrEqual(2);
		expect(container.querySelector('a[href*="/signup"]')).toBeNull();
	});
});
