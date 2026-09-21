/**
 * What CrossfadeVideo owns on behalf of every scrolly video: the pair of
 * breakpoint elements with their three encodes each, the managed playback
 * (`active`), and the replay affordance that appears once a clip has ended.
 *
 * Runs in a real browser (the `client` project), but `play`/`pause` are still
 * stubbed: the assertions are about which calls the component makes, not about
 * decoding, and headless chromium will not fetch these sources anyway.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { fireEvent } from '@testing-library/dom';
import CrossfadeVideo from './CrossfadeVideo.svelte';

const play = vi.fn(() => Promise.resolve());
const pause = vi.fn();

beforeEach(() => {
	play.mockClear();
	pause.mockClear();
	HTMLMediaElement.prototype.play = play as unknown as HTMLMediaElement['play'];
	HTMLMediaElement.prototype.pause = pause as unknown as HTMLMediaElement['pause'];
});

afterEach(() => {
	vi.restoreAllMocks();
});

/** The two `<video>` elements, in render order: desktop first, then mobile. */
function videos(container: HTMLElement): HTMLVideoElement[] {
	return [...container.querySelectorAll('video')];
}

describe('CrossfadeVideo sources', () => {
	it('renders a desktop and a mobile element, three sources each, from srcBase', () => {
		const { container } = render(CrossfadeVideo, { props: { srcBase: '/clips/tillage' } });
		const [desktop, mobile] = videos(container);

		expect(videos(container)).toHaveLength(2);
		expect([...desktop.querySelectorAll('source')].map((s) => s.getAttribute('src'))).toEqual([
			'/clips/tillage/desktop.webm',
			'/clips/tillage/desktop-safe.mp4',
			'/clips/tillage/desktop.mp4'
		]);
		expect([...mobile.querySelectorAll('source')].map((s) => s.getAttribute('src'))).toEqual([
			'/clips/tillage/mobile.webm',
			'/clips/tillage/mobile-safe.mp4',
			'/clips/tillage/mobile.mp4'
		]);
		// webm first, then the two mp4 fallbacks
		expect([...desktop.querySelectorAll('source')].map((s) => s.getAttribute('type'))).toEqual([
			'video/webm',
			'video/mp4',
			'video/mp4'
		]);
	});

	it('carries the breakpoint on each element and shares the class prop', () => {
		const { container } = render(CrossfadeVideo, {
			props: { srcBase: '/clips/tillage', class: 'h-auto w-full object-cover' }
		});
		const [desktop, mobile] = videos(container);

		expect(desktop.className).toContain('h-auto w-full object-cover');
		expect(desktop.className).toContain('hidden lg:block');
		expect(mobile.className).toContain('block lg:hidden');
	});

	it('takes explicit per-breakpoint sources over srcBase', () => {
		const track = { webm: '/a.webm', mp4Safe: '/a-safe.mp4', mp4: '/a.mp4' };
		const { container } = render(CrossfadeVideo, {
			props: { srcBase: '/ignored', sources: { desktop: track, mobile: track } }
		});

		for (const video of videos(container)) {
			expect([...video.querySelectorAll('source')].map((s) => s.getAttribute('src'))).toEqual([
				'/a.webm',
				'/a-safe.mp4',
				'/a.mp4'
			]);
		}
	});
});

describe('CrossfadeVideo playback', () => {
	it('plays both elements when it is the active one', () => {
		render(CrossfadeVideo, { props: { srcBase: '/clips/tillage', active: true } });
		expect(play).toHaveBeenCalledTimes(2);
	});

	it('does not autoplay when it is not the active one', () => {
		const { container } = render(CrossfadeVideo, {
			props: { srcBase: '/clips/tillage', active: false }
		});
		expect(play).not.toHaveBeenCalled();
		expect(pause).toHaveBeenCalledTimes(2);
		for (const video of videos(container)) expect(video.hasAttribute('autoplay')).toBe(false);
	});

	it('leaves playback to the browser in autoplay mode', () => {
		const { container } = render(CrossfadeVideo, {
			props: { srcBase: '/clips/tillage', autoplay: true, loop: true, active: false }
		});
		expect(play).not.toHaveBeenCalled();
		expect(pause).not.toHaveBeenCalled();
		for (const video of videos(container)) {
			expect(video.hasAttribute('autoplay')).toBe(true);
			expect(video.hasAttribute('loop')).toBe(true);
		}
	});
});

describe('CrossfadeVideo replay affordance', () => {
	it('appears once the clip ends, and replays both elements when clicked', async () => {
		const onended = vi.fn();
		const { container } = render(CrossfadeVideo, {
			props: { srcBase: '/clips/tillage', active: true, onended }
		});
		expect(container.querySelector('button')).toBeNull();

		await fireEvent(videos(container)[0], new Event('ended'));

		const button = container.querySelector('button');
		expect(button).not.toBeNull();
		expect(button?.getAttribute('aria-label')).toBe('Replay video');
		expect(onended).toHaveBeenCalledTimes(1);

		play.mockClear();
		await fireEvent.click(button!);
		expect(play).toHaveBeenCalledTimes(2);
		expect(container.querySelector('button')).toBeNull();
	});

	it('fires onended once, whichever element reports it first', async () => {
		const onended = vi.fn();
		const { container } = render(CrossfadeVideo, {
			props: { srcBase: '/clips/tillage', active: true, onended }
		});

		await fireEvent(videos(container)[0], new Event('ended'));
		await fireEvent(videos(container)[1], new Event('ended'));

		expect(onended).toHaveBeenCalledTimes(1);
	});

	it('stays silent at the end when replay is turned off', async () => {
		const { container } = render(CrossfadeVideo, {
			props: { srcBase: '/clips/tillage', active: true, replayable: false }
		});

		await fireEvent(videos(container)[0], new Event('ended'));

		expect(container.querySelector('button')).toBeNull();
	});
});
