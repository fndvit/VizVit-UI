import type { UiMessages } from '../config/types.js';
import type { MilestoneCategory } from '../content/types.js';

/**
 * Category → series token, fixed slot order (dataviz rule: slot 1 is brand
 * teal, slots are never reordered). Labels always accompany the color dot,
 * so color is never the only encoding. The --series-* tokens ship in
 * tokens.css.
 */
export const MILESTONE_CATEGORY_COLOR: Record<MilestoneCategory, string> = {
	foundation: 'var(--series-1)',
	lab: 'var(--series-2)',
	education: 'var(--series-3)',
	collaboration: 'var(--series-4)',
	press: 'var(--series-5)'
};

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
