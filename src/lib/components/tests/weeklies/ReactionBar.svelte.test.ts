import { page } from 'vitest/browser';
import type { ComponentProps } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { ReactionSummary } from '../../../content/types.js';
import { defaultMessages as m } from '../../../config/messages.js';
import { createRemoteFormMock, type RemoteFormMockOptions } from '../../../testing/remote-form.js';
import ReactionBar from '../../weeklies/ReactionBar.svelte';

type Props = ComponentProps<typeof ReactionBar>;

const tallies: ReactionSummary[] = [
	{ reaction: 'like', count: 4, mine: true },
	{ reaction: 'love', count: 1, mine: false },
	{ reaction: 'clap', count: 0, mine: false }
];

// Nested under `props` because `target` is also a Svelte mount option, and a
// bare object would be read as the mount point rather than as this prop.
const renderBar = (props: Omit<Props, 'forms'>, options: RemoteFormMockOptions = {}) =>
	render(ReactionBar, {
		props: {
			...props,
			forms: {
				weeklyReactionForm: createRemoteFormMock<Props['forms']['weeklyReactionForm']>(options),
				commentReactionForm: createRemoteFormMock<Props['forms']['commentReactionForm']>(options)
			}
		}
	});

describe('ReactionBar', () => {
	it('posts the weekly slug when the target is a weekly', async () => {
		renderBar({
			reactions: tallies,
			target: { kind: 'weekly', slug: 'exemple-weekly' },
			isLoggedIn: true
		});

		// One tiny form per reaction, so toggling works without JavaScript.
		expect(document.querySelectorAll('form')).toHaveLength(3);
		const slugs = document.querySelectorAll<HTMLInputElement>('input[name="weeklySlug"]');
		expect(slugs).toHaveLength(3);
		expect(slugs[0].value).toBe('exemple-weekly');
		expect(document.querySelector('input[name="commentId"]')).toBeNull();
	});

	it('posts the comment id when the target is a comment', async () => {
		renderBar({ reactions: tallies, target: { kind: 'comment', id: 7 }, isLoggedIn: true });

		const ids = document.querySelectorAll<HTMLInputElement>('input[name="commentId"]');
		expect(ids).toHaveLength(3);
		expect(ids[0].value).toBe('7');
		expect(document.querySelector('input[name="weeklySlug"]')).toBeNull();
	});

	it('marks the viewer’s own reaction as pressed', async () => {
		renderBar({
			reactions: tallies,
			target: { kind: 'weekly', slug: 'exemple-weekly' },
			isLoggedIn: true
		});

		const pressed = document.querySelectorAll('button[aria-pressed="true"]');
		expect(pressed).toHaveLength(1);
	});

	it('shows read-only tallies when signed out, hiding empty ones', async () => {
		renderBar({
			reactions: tallies,
			target: { kind: 'weekly', slug: 'exemple-weekly' },
			isLoggedIn: false
		});

		expect(document.querySelector('form')).toBeNull();
		expect(document.querySelectorAll('button')).toHaveLength(0);
		// clap has a zero tally, so only two chips render.
		expect(document.querySelectorAll('.chip')).toHaveLength(2);
		await expect.element(page.getByRole('group')).toBeInTheDocument();
	});

	it('tells the reader when a toggle was refused', async () => {
		// The reaction budget is 30 in ten minutes and every chip spends from it,
		// so an ordinary reader reaches it. This used to do nothing at all: the
		// chip did not move, the tally did not change, and nothing said why — so
		// the obvious response was to press it again and spend more.
		renderBar(
			{ reactions: tallies, target: { kind: 'weekly', slug: 'exemple-weekly' }, isLoggedIn: true },
			{ result: () => ({ ok: false, reason: 'rateLimited' }) }
		);

		await expect.element(page.getByRole('alert')).toHaveTextContent(m.form_error_rateLimited());
	});

	it('says nothing when no toggle has failed', async () => {
		renderBar({
			reactions: tallies,
			target: { kind: 'weekly', slug: 'exemple-weekly' },
			isLoggedIn: true
		});

		expect(document.querySelector('[role="alert"]')).toBeNull();
	});

	it('marks a chip busy while it posts, without disabling it', async () => {
		// aria-busy rather than disabled: a disabled control is unfocusable, so
		// disabling a toggle mid-flight would drop focus off the chip the reader
		// just activated — the regression the focus rules in FormFeedback exist
		// to prevent, arrived at from the other direction.
		renderBar(
			{ reactions: tallies, target: { kind: 'weekly', slug: 'exemple-weekly' }, isLoggedIn: true },
			{ pending: () => 1 }
		);

		const chip = page.getByRole('button').first();
		await expect.element(chip).toHaveAttribute('aria-busy', 'true');
		await expect.element(chip).toBeEnabled();
	});
});
