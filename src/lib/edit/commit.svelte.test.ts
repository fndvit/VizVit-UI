import { describe, expect, it, vi } from 'vitest';
import { commitState } from './commit.svelte.js';
import { defaultEditMessages } from '../config/edit-messages.js';

/**
 * The commit lifecycle at its own interface. It ran twice — inside
 * `Editable` and inside `PropertyRow` — and only the first was covered, so
 * commit-or-rollback semantics had two homes and one test surface. These are
 * the cases that used to be reachable only by driving a component.
 */
const messages = defaultEditMessages;

describe('commitState', () => {
	it('starts at rest, holding the value it was given', () => {
		const commit = commitState('one', messages);
		expect(commit.status).toBe('idle');
		expect(commit.saved).toBe('one');
		expect(commit.announcement).toBe('');
	});

	it('announces each phase of a save and advances the saved value', async () => {
		const commit = commitState('one', messages);
		commit.markDirty();
		expect(commit.status).toBe('dirty');

		const write = vi.fn(async () => {});
		expect(await commit.commit('two', write)).toBe(true);
		expect(write).toHaveBeenCalledOnce();
		expect(commit.status).toBe('idle');
		expect(commit.saved).toBe('two');
		expect(commit.announcement).toBe(messages.edit_saved());
	});

	it('stays in error after a refused write, keeping the last saved value', async () => {
		const commit = commitState('one', messages);
		expect(await commit.commit('two', () => Promise.reject(new Error('nope')))).toBe(false);
		expect(commit.status).toBe('error');
		expect(commit.saved).toBe('one');
		expect(commit.announcement).toBe(messages.edit_saveError());
	});

	it('refuses before a write with its own reason', () => {
		const commit = commitState('one', messages);
		commit.refuse(messages.edit_emptyRequired());
		expect(commit.status).toBe('error');
		expect(commit.announcement).toBe(messages.edit_emptyRequired());
	});

	it('does not mark dirty over an in-flight save', async () => {
		const commit = commitState('one', messages);
		let release = () => {};
		const pending = commit.commit('two', () => new Promise<void>((r) => (release = r)));
		expect(commit.status).toBe('saving');
		commit.markDirty();
		expect(commit.status).toBe('saving');
		release();
		await pending;
		expect(commit.status).toBe('idle');
	});

	it('reverts silently: at rest, and the announcement withdrawn', async () => {
		const commit = commitState('one', messages);
		await commit.commit('two', () => Promise.reject(new Error('nope')));
		commit.revert();
		expect(commit.status).toBe('idle');
		expect(commit.announcement).toBe('');
	});

	describe('following the prop', () => {
		it('adopts a value the app reloaded underneath it', () => {
			const commit = commitState('one', messages);
			expect(commit.follow('reloaded')).toBe('reloaded');
			expect(commit.saved).toBe('reloaded');
		});

		it('leaves an unchanged prop alone', () => {
			const commit = commitState('one', messages);
			expect(commit.follow('one')).toBe(null);
		});

		/** The rule the whole helper exists to state once. */
		it('never repaints a draft being held', () => {
			const commit = commitState('one', messages);
			commit.markDirty();
			expect(commit.follow('reloaded')).toBe(null);
			expect(commit.saved).toBe('one');
		});

		/**
		 * The regression this refactor introduced and the component suite
		 * caught: a save must not make the UNCHANGED prop look like a reload,
		 * or the next effect run restores the pre-save value over the
		 * committed one.
		 */
		it('does not treat an unchanged prop as a reload after a save', async () => {
			const commit = commitState('one', messages);
			await commit.commit('two', async () => {});
			expect(commit.follow('one')).toBe(null);
			expect(commit.saved).toBe('two');
		});
	});
});
