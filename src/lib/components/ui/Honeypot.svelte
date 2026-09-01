<script lang="ts">
	import { HONEYPOT_FIELD } from '../../forms/transport.js';

	/**
	 * Spam trap for the public forms: invisible to humans, tempting to bots.
	 * The server half is HONEYPOT_FIELD in ../../forms/transport.js, which the
	 * host app's form envelope checks before running any handler.
	 *
	 * This takes the form and reads that field itself. Taking the field meant
	 * both callers named it — `f.fields.website` — so the two halves were
	 * joined by a string typed twice rather than by the constant, and nothing
	 * outside the schemas and the envelope imported it. A trap whose markup
	 * name drifts from the schema's is a trap that silently stops catching.
	 */
	interface HoneypotField {
		as(type: 'text'): Record<string, unknown>;
	}

	interface Props {
		/** The remote form; its honeypot field is read by name from the schema. */
		form: Record<typeof HONEYPOT_FIELD, HoneypotField>;
		/** DOM id, unique per page — two honeypot forms can share one. */
		id: string;
	}

	let { form, id }: Props = $props();

	const field = $derived(form[HONEYPOT_FIELD]);
</script>

<div class="hp" aria-hidden="true">
	<label for={id}>Website</label>
	<input {id} tabindex="-1" autocomplete="off" {...field.as('text')} />
</div>

<style>
	.hp {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}
</style>
