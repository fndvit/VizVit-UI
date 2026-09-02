<script lang="ts">
	import Modal from '../../ui/Modal.svelte';

	/** Test-only host: state lives here so the dialog open/close reacts. */
	interface Props {
		open?: boolean;
	}

	let { open = $bindable(true) }: Props = $props();
</script>

<Modal {open} title="Un títol" onclose={() => (open = false)}>
	<p data-testid="modal-body">Contingut</p>
</Modal>
