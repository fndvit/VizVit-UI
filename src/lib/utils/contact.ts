import type { UiMessages } from '../config/types.js';
import type { ContactCategory } from '../content/types.js';

/** The contact category's label in the host app's copy. */
export function contactCategoryLabel(category: ContactCategory, messages: UiMessages): string {
	switch (category) {
		case 'collaborate':
			return messages.contact_category_collaborate();
		case 'event':
			return messages.contact_category_event();
		case 'press':
			return messages.contact_category_press();
		case 'brand':
			return messages.contact_category_brand();
		case 'other':
			return messages.contact_category_other();
	}
}
