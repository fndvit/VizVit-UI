<script lang="ts">
	import FormFeedback from '../../ui/FormFeedback.svelte';

	/**
	 * Test-only host for FormFeedback: supplies the message as the children
	 * snippet, the way every real call site does.
	 */
	interface Props {
		kind: 'success' | 'error';
		message: string;
	}

	let { kind, message }: Props = $props();
</script>

<FormFeedback {kind}>{message}</FormFeedback>
