<script lang="ts">
	import UiProvider from '../../../config/UiProvider.svelte';
	import type { Locale } from '../../../config/types.js';
	import DateText from '../../ui/DateText.svelte';

	/**
	 * DateText under a provider whose locale is a live prop — the reactivity
	 * contract: config reads are function calls, so a locale change reaches
	 * every consumer without a remount.
	 */
	interface Props {
		locale: Locale;
	}

	let { locale }: Props = $props();
</script>

<UiProvider config={{ locale: () => locale }}>
	<DateText value="2026-08-10" />
</UiProvider>
