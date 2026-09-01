<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import { formatDate } from '../../utils/dates.js';

	/**
	 * A published, posted or occurred date: the machine-readable value and the
	 * human string, from one module.
	 *
	 * `formatDate` owned the string, but the element around it owned nothing —
	 * seven render sites restated the `datetime` attribute, the locale
	 * read and the muted styling, and five read the locale for that one
	 * line and nothing else. A `<time>` that loses its `datetime` renders
	 * identically, so the defect is invisible on screen and costs only
	 * assistive technology and search engines: the same silent-failure shape
	 * LocaleField owns for forms.
	 *
	 * Timestamps are accepted as well as dates. The attribute carries the whole
	 * ISO value while the text shows the day, which is what a comment's
	 * `createdAt` needs and what its call site used to slice by hand.
	 *
	 * Resolving a timestamp to a day belongs to `formatDate`, not here: slicing
	 * the first ten characters takes the *UTC* day and then renders it as if it
	 * were a local one, so a comment posted just after midnight in Barcelona
	 * showed the previous date.
	 */
	interface Props {
		/** An ISO date (`2026-08-28`) or timestamp; both render as a day. */
		value: string;
	}

	let { value }: Props = $props();

	const config = getUiConfig();
</script>

<time datetime={value}>{formatDate(value, config.locale())}</time>

<style>
	time {
		font-size: var(--text-sm);
		color: var(--color-ink-muted);
	}
</style>
