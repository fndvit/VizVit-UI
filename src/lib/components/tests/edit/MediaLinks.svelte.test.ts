import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { SiteLink } from '../../../config/types.js';
import { chromeEdit, entityEdit, entityProperty } from '../../../edit/helpers.js';
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

const linkLabel = (link: SiteLink) =>
	link.id === undefined ? undefined : entityEdit('site_links', link.id, 'ca')('label');

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

describe('nav/footer structural editing — one modal per entry', () => {
	it('read-only renders byte-identically with or without the new props', () => {
		const plain = render(MediaLinksProbe, { props: { show: 'nav', links } });
		const wired = render(MediaLinksProbe, {
			props: {
				show: 'nav',
				links,
				editFor: linkLabel,
				propertiesFor: linkMap,
				collection: { entity: 'site_links' as const }
			}
		});
		expect(wired.container.innerHTML).toBe(plain.container.innerHTML);
	});

	it('the modal carries text, adreça and ordre; Desa commits each changed half', async () => {
		const save = vi.fn(async () => {});
		const saveProperty = vi.fn(async () => {});
		const { container } = render(MediaLinksProbe, {
			props: {
				show: 'footer',
				links,
				editFor: linkLabel,
				propertiesFor: linkMap,
				collection: { entity: 'site_links' as const },
				adapter: fullAdapter({ save, saveProperty })
			}
		});
		const swap = [...container.querySelectorAll<HTMLButtonElement>('.link-swap')].find((el) =>
			el.textContent?.includes('Què fem')
		)!;
		swap.click();
		await settle();
		const dialog = [...container.querySelectorAll<HTMLDialogElement>('dialog')].find(
			(candidate) => candidate.open
		)!;
		const inputs = [...dialog.querySelectorAll('input')];
		expect(inputs.map((input) => input.value)).toEqual(['Què fem', '/what-we-do', '0']);
		inputs[1].value = '/que-fem';
		inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
		inputs[2].value = '3';
		inputs[2].dispatchEvent(new Event('input', { bubbles: true }));
		[...dialog.querySelectorAll('button')]
			.find((button) => button.textContent?.trim() === 'Desa')!
			.click();
		await settle();
		expect(save).not.toHaveBeenCalled();
		expect(saveProperty).toHaveBeenCalledWith(linkMap(links[0])!.href, '/que-fem');
		expect(saveProperty).toHaveBeenCalledWith(linkMap(links[0])!.order, '3');
	});

	it("the modal's Elimina confirms, then fires the collection remove", async () => {
		const applyOp = vi.fn(async () => {});
		const { container } = render(MediaLinksProbe, {
			props: {
				show: 'nav',
				links,
				editFor: linkLabel,
				propertiesFor: linkMap,
				collection: { entity: 'site_links' as const },
				adapter: fullAdapter({ applyOp })
			}
		});
		[...container.querySelectorAll<HTMLButtonElement>('.link-swap')]
			.find((el) => el.textContent?.includes('Què fem'))!
			.click();
		await settle();
		const dialog = [...container.querySelectorAll<HTMLDialogElement>('dialog')].find(
			(candidate) => candidate.open
		)!;
		[...dialog.querySelectorAll('button')]
			.find((button) => button.textContent?.trim() === 'Elimina')!
			.click();
		await settle();
		const confirm = [...container.querySelectorAll<HTMLDialogElement>('dialog')]
			.filter((candidate) => candidate.open)
			.at(-1)!;
		[...confirm.querySelectorAll('button')]
			.find((button) => button.textContent?.trim() === 'Elimina')!
			.click();
		await settle();
		expect(applyOp).toHaveBeenCalledWith({
			kind: 'remove',
			collection: { entity: 'site_links' },
			id: 1
		});
	});

	it('an add slot fires the collection create; a legacy link edits its label only', async () => {
		const applyOp = vi.fn(async () => {});
		const { container } = render(MediaLinksProbe, {
			props: {
				show: 'nav',
				links,
				editFor: linkLabel,
				propertiesFor: linkMap,
				collection: { entity: 'site_links' as const },
				adapter: fullAdapter({ applyOp })
			}
		});
		// The identified link swaps; the id-less legacy one has no label
		// descriptor either, so it stays a live anchor.
		expect(container.querySelectorAll('.links .link-swap')).toHaveLength(1);
		expect(container.querySelector('.links a[href="/legacy"]')).not.toBeNull();
		container.querySelector<HTMLButtonElement>('.links button.add')!.click();
		await settle();
		expect(applyOp).toHaveBeenCalledWith({
			kind: 'create',
			collection: { entity: 'site_links' }
		});
	});
});

describe('newsletter links join edit mode', () => {
	it('the signup/login links swap for the link modal while editing', () => {
		const { container } = render(MediaLinksProbe, {
			props: {
				show: 'newsletter',
				adapter: fullAdapter(),
				messageEdit: (key) => chromeEdit(key, 'ca')
			}
		});
		// LinkEdit's swap replaced the plain label swap: one modal edits the
		// link's text AND destination (LinkEdit.svelte.test.ts owns the modal).
		const swaps = [...container.querySelectorAll('.link-swap')].map((el) => el.textContent?.trim());
		expect(swaps.length).toBeGreaterThanOrEqual(2);
		expect(container.querySelector('a[href*="/signup"]')).toBeNull();
	});
});
