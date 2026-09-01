<script lang="ts">
	import { getUiConfig } from '../../config/context.js';
	import GhostButton from './GhostButton.svelte';

	/**
	 * The page URL and the clipboard are parameters, not module-scope reads.
	 * The remote forms already substitute this way (`form?: typeof defaultForm`);
	 * routing state never did, which is why the copy branches below — the reset
	 * timeout and the rejected write — had no test.
	 */
	interface Props {
		/** Title used in the share text. */
		title: string;
		/** The URL being shared. Only tests and stories pass one. */
		url?: string;
		/** Only tests and stories pass one. */
		writeClipboard?: (text: string) => Promise<void>;
		/** How long the "copied" confirmation stays up. */
		copiedResetMs?: number;
	}

	let {
		title,
		url = undefined,
		writeClipboard = (text) => navigator.clipboard.writeText(text),
		copiedResetMs = 2000
	}: Props = $props();

	const config = getUiConfig();
	const msg = $derived(config.messages);

	let isCopied = $state(false);

	const shareUrl = $derived(url ?? config.url()?.href ?? '');
	const encodedUrl = $derived(encodeURIComponent(shareUrl));
	const encodedTitle = $derived(encodeURIComponent(title));

	async function copyLink(): Promise<void> {
		try {
			await writeClipboard(shareUrl);
			isCopied = true;
			setTimeout(() => (isCopied = false), copiedResetMs);
		} catch {
			isCopied = false;
		}
	}
</script>

<div class="share">
	<span class="label">{msg.share_label()}</span>
	<a
		href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
		rel="external noopener"
		target="_blank"
	>
		X
	</a>
	<a
		href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
		rel="external noopener"
		target="_blank"
	>
		LinkedIn
	</a>
	<GhostButton class="copy" onclick={copyLink}>
		{isCopied ? msg.share_copied() : msg.share_copyLink()}
	</GhostButton>
	<span class="visually-hidden" role="status">{isCopied ? msg.share_copied() : ''}</span>
</div>

<style>
	.share {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding-block: var(--space-3);
		border-top: 1px solid var(--color-hairline);
	}

	.label {
		font-weight: 700;
	}

	a {
		color: var(--color-ink-secondary);
	}

	.share :global(button.copy) {
		color: var(--color-ink-secondary);
	}

	.share :global(button.copy:hover) {
		color: var(--color-brand);
	}
</style>
