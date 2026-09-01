<script lang="ts">
	import { getUiConfig } from '../../config/context.js';

	/**
	 * The hidden `locale` input every form carries. Without it a no-JS
	 * submission is stored under the base locale, because the unprefixed POST
	 * target resolves there before the locale cookie is consulted. Rendering it
	 * from one module makes the invariant enforceable instead of restated at
	 * every form.
	 */
	interface Props {
		/** The form's `locale` field: `form.fields.locale`. */
		field: { as(type: 'hidden', value: string): Record<string, unknown> };
	}

	let { field }: Props = $props();

	const config = getUiConfig();
</script>

<input {...field.as('hidden', config.locale())} />
