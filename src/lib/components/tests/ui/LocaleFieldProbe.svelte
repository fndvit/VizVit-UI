<script lang="ts">
	import UiProvider from '../../../config/UiProvider.svelte';
	import type { Locale } from '../../../config/types.js';
	import LocaleField from '../../ui/LocaleField.svelte';

	/** LocaleField under a provider whose locale the test controls. */
	interface Props {
		locale: Locale;
		field: { as(type: 'hidden', value: string): Record<string, unknown> };
	}

	let { locale, field }: Props = $props();
</script>

<UiProvider config={{ locale: () => locale }}>
	<LocaleField {field} />
</UiProvider>
