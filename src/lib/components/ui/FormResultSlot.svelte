<script lang="ts">
	import FormErrorFeedback from './FormErrorFeedback.svelte';
	import FormFeedback from './FormFeedback.svelte';

	/**
	 * A form's outcome in one slot: the success message announced with
	 * role="status", any failure rendered by FormErrorFeedback with role="alert".
	 * Use it wherever a form stays on screen after submitting; forms that
	 * replace themselves on success (contact, signup, magic link) branch in
	 * their own markup, because what changes there is the whole form, not the
	 * message.
	 *
	 * No per-reason copy passes through here. It used to take a `messages`
	 * record and hand it on unread; all three render sites omitted it, and every
	 * `messages` in the app goes to FormErrorFeedback directly — which is where
	 * a form needing per-reason copy still reaches, and what the two forms that
	 * need it already do.
	 */
	interface Props {
		/** The remote form's result; nothing renders until there is one. */
		result: { ok: boolean; reason?: string } | undefined | null;
		/** Announced on success. */
		successMessage: string;
	}

	let { result, successMessage }: Props = $props();
</script>

{#if result?.ok}
	<FormFeedback kind="success">{successMessage}</FormFeedback>
{:else}
	<FormErrorFeedback {result} />
{/if}
