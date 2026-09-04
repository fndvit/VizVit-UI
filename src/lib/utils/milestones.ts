import type { UiMessages } from '../config/types.js';
import type { MilestoneCategory } from '../content/types.js';

/**
 * Category → series token, fixed slot order (dataviz rule: slot 1 is brand
 * teal, slots are never reordered). Labels always accompany the color dot,
 * so color is never the only encoding. The --series-* tokens ship in
 * tokens.css.
 *
 * Keyed, not positional, so a member added to `MILESTONE_CATEGORIES` fails to
 * compile here rather than silently taking slot 6 — and so the display order
 * is `MILESTONE_CATEGORIES`' to decide, not a side effect of this literal's
 * key order, which is what the panel select used to read.
 */
export const MILESTONE_CATEGORY_COLOR: Record<MilestoneCategory, string> = {
	foundation: 'var(--series-1)',
	lab: 'var(--series-2)',
	education: 'var(--series-3)',
	collaboration: 'var(--series-4)',
	press: 'var(--series-5)'
};

/**
 * The transparency page's client-side filter: the timeline is small enough
 * to filter in the browser (a choice its load function records), and this is
 * the predicate — named and tested here rather than closing over a page's
 * `data` inside a `$derived`. Category is exact; the query is a trimmed,
 * case-insensitive substring of title + body.
 */
export function matchesMilestoneFilter(
	milestone: { title: string; body: string | null; category: MilestoneCategory },
	filter: { q: string; category: MilestoneCategory | null }
): boolean {
	if (filter.category && milestone.category !== filter.category) return false;
	if (!filter.q) return true;

	const needle = filter.q.trim().toLowerCase();
	if (!needle) return true;
	return `${milestone.title} ${milestone.body ?? ''}`.toLowerCase().includes(needle);
}

/** The category's label in the host app's copy. */
export function milestoneCategoryLabel(category: MilestoneCategory, messages: UiMessages): string {
	switch (category) {
		case 'education':
			return messages.category_education();
		case 'lab':
			return messages.category_lab();
		case 'foundation':
			return messages.category_foundation();
		case 'collaboration':
			return messages.category_collaboration();
		case 'press':
			return messages.category_press();
	}
}
