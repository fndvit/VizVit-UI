<!--
	@component ScrollyStepsHarness

	Minimal host for `<ScrollySteps>`, so a test can assert what the component
	renders without a page's worth of content. Test-only; it is not exported
	from the `./scrolly` barrel.

	@prop {string[]} steps - One label per step section.
	@prop {boolean} [withBuffers=false] - Also render `before`/`after` sections.
-->
<script lang="ts">
	import ScrollySteps from './ScrollySteps.svelte';

	let { steps, withBuffers = false }: { steps: string[]; withBuffers?: boolean } = $props();
</script>

<ScrollySteps {steps} sectionClass={(_item, i) => `step-${i}`}>
	{#snippet background()}
		<div data-testid="background">bg</div>
	{/snippet}

	{#snippet step({ item, opacity, translateY })}
		<div data-testid="card" style="opacity: {opacity}; transform: translateY({translateY}px);">
			{item}
		</div>
	{/snippet}

	{#snippet before()}
		{#if withBuffers}<section class="lead-in"></section>{/if}
	{/snippet}

	{#snippet after()}
		{#if withBuffers}<section class="hold"></section>{/if}
	{/snippet}
</ScrollySteps>
