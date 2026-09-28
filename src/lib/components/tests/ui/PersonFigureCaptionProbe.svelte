<script lang="ts">
	import PersonFigure from '../../ui/figure/PersonFigure.svelte';

	/** Test-only host: a caption of the probe's own, the way `TeamFigure` supplies one. */
	interface Props {
		bio?: string | null;
	}

	let { bio = null }: Props = $props();
</script>

<PersonFigure name="Ada" role="Directora" {bio}>
	{#snippet caption()}
		<em class="vit-figure__role">Probe</em>
	{/snippet}
</PersonFigure>
