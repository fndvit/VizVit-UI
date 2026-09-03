import type { EditMessages } from '../config/edit-messages.js';
import type { PropertyDescriptor, PropertyValue } from './types.js';

/**
 * The commit lifecycle of ONE editable value — the state machine
 * `Editable` and `PropertyRow` both ran, in one place.
 *
 * They implemented it twice: the same four states, the same "follow the prop
 * only while idle" effect with the same `lastPropValue` trick, and the same
 * three announcements read from the same three message keys. The inline
 * editor's suite covered one of them, so a bug in commit-or-rollback
 * semantics had two homes and one test surface. `LinkEdit` is deliberately
 * NOT a caller: a modal that batch-commits several halves and reports a
 * partial failure is a different shape, not a simpler version of this one.
 *
 * Where the draft LIVES stays the caller's business — the DOM owns it for a
 * `contenteditable`, a `$state` string owns it for a panel control — which is
 * why this holds `saved` and the status but never the draft.
 */
export type CommitStatus = 'idle' | 'dirty' | 'saving' | 'error';

export interface CommitState<T> {
	/** What the affordance paints (`data-vit-editing`). */
	readonly status: CommitStatus;
	/** The visually hidden `role="status"` line. */
	readonly announcement: string;
	/** The last persisted value: what a revert restores and a commit diffs against. */
	readonly saved: T;
	/** Typing began. Never overrides an in-flight save. */
	markDirty(): void;
	/** Back to rest without a write — an unchanged draft. */
	settle(): void;
	/** Escape: back to rest AND silent, the announcement withdrawn with the draft. */
	revert(): void;
	/** Refuse before any write, with its own reason (an emptied required field). */
	refuse(announcement: string): void;
	/**
	 * Runs one write. Announces each phase, advances `saved` on success, and
	 * leaves the state at `'error'` on rejection so the caller's draft can stay
	 * on screen. Answers whether it landed.
	 */
	commit(next: T, write: () => Promise<void>): Promise<boolean>;
	/**
	 * Adopt a value the app reloaded underneath us — and only while idle.
	 * Diffing against `saved` instead would fire after every save, where
	 * `saved` has legitimately advanced past the prop, and repaint the
	 * committed draft with stale copy. Never over a draft being held.
	 *
	 * Answers the value the caller should render, or `null` for "leave it".
	 */
	follow(next: T): T | null;
}

export function commitState<T>(initial: T, messages: EditMessages): CommitState<T> {
	let status = $state<CommitStatus>('idle');
	let announcement = $state('');
	let saved = $state(initial);
	let lastProp = $state(initial);

	return {
		get status() {
			return status;
		},
		get announcement() {
			return announcement;
		},
		get saved() {
			return saved;
		},
		markDirty() {
			if (status !== 'saving') status = 'dirty';
		},
		settle() {
			status = 'idle';
		},
		revert() {
			status = 'idle';
			announcement = '';
		},
		refuse(next: string) {
			status = 'error';
			announcement = next;
		},
		async commit(next, write) {
			status = 'saving';
			announcement = messages.edit_saving();
			try {
				await write();
				saved = next;
				// `lastProp` is NOT advanced here: it tracks the last PROP value
				// seen, and a save does not change the prop. Advancing it made an
				// unchanged prop look like a reload on the next effect run, which
				// then restored the pre-save value over the committed one.
				status = 'idle';
				announcement = messages.edit_saved();
				return true;
			} catch {
				status = 'error';
				announcement = messages.edit_saveError();
				return false;
			}
		},
		follow(next) {
			if (next === lastProp) return null;
			lastProp = next;
			if (status !== 'idle') return null;
			saved = next;
			return next;
		}
	};
}

/**
 * A control's string draft as the value the ADAPTER takes. Every control's
 * state is text — a flag's boolean rides as `'true'`/`'false'` in its
 * `<select>` — and this is the one place it becomes a boolean again, so the
 * panel row and the link modal cannot disagree about the boundary.
 */
export function propertyValue(descriptor: PropertyDescriptor, draft: string): PropertyValue {
	return descriptor.type === 'flag' ? draft === 'true' : draft;
}
