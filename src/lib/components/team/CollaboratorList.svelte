<script lang="ts">
	import type { CollaboratorData } from '../../content/types.js';

	interface Props {
		collaborators: CollaboratorData[];
	}

	let { collaborators }: Props = $props();
</script>

<ul>
	{#each collaborators as collaborator (collaborator.personName + collaborator.affiliation)}
		<li>
			<strong>{collaborator.personName}</strong>
			·
			{#if collaborator.url}
				<a href={collaborator.url} rel="external noopener">{collaborator.affiliation}</a>
			{:else}
				{collaborator.affiliation}
			{/if}
		</li>
	{/each}
</ul>

<style>
	ul {
		margin: 0;
		padding-left: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	a {
		color: var(--color-brand);
	}
</style>
