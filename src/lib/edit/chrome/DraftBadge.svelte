<script lang="ts">
	import { getUiConfig } from '../../config/context.js';

	/**
	 * The «Esborrany» chip a card wears while its row is unpublished. The flag
	 * arrives on the DATA (`draft?: boolean`), set only by a CMS host — the
	 * public site never marks anything draft, so its cards render without this
	 * component ever mounting. Wording comes from editMessages for the same
	 * reason: it is editor-facing, never catalog copy.
	 */
	const config = getUiConfig();
</script>

<span class="draft">{config.editMessages.edit_draftBadge()}</span>

<style>
	.draft {
		display: inline-block;
		align-self: start;
		border: 1px solid var(--color-ink-muted);
		border-radius: 999px;
		padding: 0.1em 0.7em;
		font-size: var(--text-sm);
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-ink-muted);
		background: var(--color-surface);
	}
</style>
