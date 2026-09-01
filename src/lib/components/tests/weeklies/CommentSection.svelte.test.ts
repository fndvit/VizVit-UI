import { page } from 'vitest/browser';
import type { ComponentProps } from 'svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { CommentThreadData as CommentThread } from '../../../content/types.js';
import type { FormResultOf } from '../../../forms/types.js';
import { createRemoteFormMock, type RemoteFormProbe } from '../../../testing/remote-form.js';
import CommentSection from '../../weeklies/CommentSection.svelte';

// The form arrives as a prop, so these tests substitute a stand-in through the
// component's own interface and cover its render states.
type Props = ComponentProps<typeof CommentSection>;

let result: FormResultOf | undefined;
let issues: Record<string, Array<{ message: string }> | undefined>;

/** The stand-in the last render was given, so a test can ask what it received. */
let formMock: RemoteFormProbe;

/** Which thread ids the section asked reply forms for. */
let replyRequests: string[];

const renderSection = (props: Omit<Props, 'commentForm' | 'replyFormFor' | 'reactionForms'>) => {
	const commentForm = createRemoteFormMock<Props['commentForm']>({
		result: () => result,
		issues: () => issues
	});
	formMock = commentForm as unknown as RemoteFormProbe;
	return render(CommentSection, {
		...props,
		commentForm,
		// The host page builds each reply form with .for(id).preflight(schema);
		// the mock's keyed instances stand in for that here.
		replyFormFor: (threadId) => {
			replyRequests.push(threadId);
			return formMock.for(threadId) as unknown as Props['commentForm'];
		},
		reactionForms: {
			weeklyReactionForm: createRemoteFormMock<Props['reactionForms']['weeklyReactionForm']>(),
			commentReactionForm: createRemoteFormMock<Props['reactionForms']['commentReactionForm']>()
		}
	});
};

const noReactions = [
	{ reaction: 'like' as const, count: 0, mine: false },
	{ reaction: 'love' as const, count: 0, mine: false },
	{ reaction: 'clap' as const, count: 0, mine: false }
];

const sampleComments: CommentThread[] = [
	{
		id: 1,
		body: 'Molt bo!',
		displayName: 'Núria',
		createdAt: '2026-08-10T09:30:00.000Z',
		reactions: [
			{ reaction: 'like', count: 4, mine: true },
			{ reaction: 'love', count: 1, mine: false },
			{ reaction: 'clap', count: 0, mine: false }
		],
		replies: [
			{
				id: 3,
				body: 'Hi estic d’acord',
				displayName: 'Pau',
				createdAt: '2026-08-11T08:00:00.000Z',
				reactions: noReactions
			}
		]
	}
];

beforeEach(() => {
	result = undefined;
	issues = {};
	replyRequests = [];
});

describe('CommentSection', () => {
	it('lists threads with replies, reactions and the form when logged in', async () => {
		renderSection({ comments: sampleComments, weeklySlug: 'x', isLoggedIn: true });

		expect(document.body.textContent).toContain('Núria');
		expect(document.body.textContent).toContain('Pau');
		expect(document.body.textContent).toContain('Hi estic d’acord');

		// Main comment form with its hidden slug.
		expect(document.getElementById('comment-body')).toBeTruthy();

		// Reply disclosure with the parent id wired in.
		const summary = document.querySelector('details.reply summary');
		expect(summary?.textContent).toMatch(/respon|reply|responder/i);
		expect(document.querySelector<HTMLInputElement>('input[name="parentId"]')?.value).toBe('1');

		// Reaction buttons: the viewer's own reaction is pressed.
		const pressed = document.querySelector('button[aria-pressed="true"]');
		expect(pressed?.textContent).toContain('4');
	});

	it('shows login and signup links plus read-only tallies when logged out', async () => {
		renderSection({ comments: sampleComments, weeklySlug: 'x', isLoggedIn: false });

		expect(document.getElementById('comment-body')).toBeNull();
		expect(document.querySelector('details.reply')).toBeNull();
		// Non-zero tallies render as static chips, not buttons.
		expect(document.querySelector('button[aria-pressed]')).toBeNull();
		expect(document.body.textContent).toContain('4');
		await expect.element(page.getByRole('link', { name: /inicia|sign in/i })).toBeInTheDocument();
	});

	it('shows the empty state without comments', async () => {
		renderSection({ comments: [], weeklySlug: 'x', isLoggedIn: true });

		await expect
			.element(page.getByText(/encara no hi ha|no comments yet|aún no hay/i))
			.toBeInTheDocument();
	});

	it('shows the rate-limit message on a rejected submission', async () => {
		result = { ok: false, reason: 'rateLimited' };
		renderSection({ comments: sampleComments, weeklySlug: 'x', isLoggedIn: true });

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent(/massa intents|too many attempts|demasiados intentos/i);
	});

	it('shows the login prompt on an unauthenticated submission', async () => {
		result = { ok: false, reason: 'unauthenticated' };
		renderSection({ comments: sampleComments, weeklySlug: 'x', isLoggedIn: true });

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent(/iniciar la sessió|sign in|iniciar sesión/i);
	});

	it('asks the host for one keyed reply form per thread', async () => {
		// One RemoteForm instance can only attach to one <form>; the section
		// must request each reply box's instance by its thread id, so the host
		// can build it with .for(id).preflight(schema).
		renderSection({ comments: sampleComments, weeklySlug: 'x', isLoggedIn: true });

		expect(replyRequests).toEqual(sampleComments.map((thread) => String(thread.id)));
	});
});
