<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * The outcome of a submission, and the one owner of where focus goes when
	 * that outcome replaces the form.
	 *
	 * Every form that succeeds swaps its whole `<form>` out for this, which
	 * destroys the submit button the reader had just activated: focus falls back
	 * to `<body>`, so the next Tab restarts at the top of the document with no
	 * sign the submission worked. And because this element is *inserted* with
	 * its text already in place rather than being present and then updated, a
	 * polite `role="status"` is announced unreliably — the two together can
	 * leave a screen-reader user with no confirmation at all.
	 *
	 * Moving focus here settles both: the message is read on focus, and the
	 * reader continues from the confirmation instead of from nowhere.
	 *
	 * Only on success. An error leaves the form standing — and ContactForm
	 * renders one straight from live preflight issues — so focusing an error
	 * would take the cursor out of the field the reader is still typing in.
	 * `role="alert"` is assertive and is announced on insertion anyway; it is
	 * the polite `role="status"` that needs the focus move to be heard.
	 */
	interface Props {
		/** success renders role="status"; error renders role="alert". */
		kind: 'success' | 'error';
		children: Snippet;
	}

	let { kind, children }: Props = $props();

	const isSuccess = $derived(kind === 'success');

	let node = $state<HTMLParagraphElement | null>(null);

	$effect(() => {
		if (isSuccess) node?.focus();
	});
</script>

<p bind:this={node} class="feedback {kind}" role={isSuccess ? 'status' : 'alert'} tabindex="-1">
	{@render children()}
</p>

<style>
	.feedback {
		font-weight: 600;
		margin: 0;
	}

	/* Focused programmatically, never by tabbing, so the ring would only ever
	   confuse: it is a message, not a control. */
	.feedback:focus {
		outline: none;
	}

	.success {
		color: var(--color-brand);
	}

	.error {
		color: var(--series-8);
	}
</style>
