import type { TimelineAreaData } from '../../content/types.js';
import { transparencyHref } from '../../utils/milestone-list-contract.js';

/**
 * Where an area's «To our … timeline» link goes — the one rule, where it
 * was spelled by the home page from the category alone, with the category
 * required everywhere for it. An area's own `href` wins; else its category's
 * filtered history on the full timeline (`base` is that page's path, the
 * host's editable «see all» destination); else the area has no link.
 */
export function areaDestination(
	area: Pick<TimelineAreaData, 'href' | 'category'>,
	base: string
): string | null {
	if (area.href) return area.href;
	if (area.category) return transparencyHref({ category: area.category }, base);
	return null;
}
