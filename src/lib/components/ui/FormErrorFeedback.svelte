<script lang="ts" generics="ExtraReason extends string = never">
	import { getUiConfig } from '../../config/context.js';
	import type { FormFailReason } from '../../content/types.js';
	import FormFeedback from './FormFeedback.svelte';

	interface Props {
		/** The remote form's result; renders nothing unless it's a failure. */
		result: { ok: boolean; reason?: FormFailReason | ExtraReason } | undefined | null;
		/** Per-reason overrides; unlisted reasons use the shared form_error_* copy. */
		messages?: Partial<Record<FormFailReason | ExtraReason, string>>;
	}

	let { result, messages = {} }: Props = $props();

	const config = getUiConfig();

	/**
	 * Exhaustive over the shared reasons, minus 'error' which is the fallback
	 * itself. Adding a member to FormFailReason fails the build here instead of
	 * silently rendering the generic message.
	 */
	const GENERIC = $derived<Record<Exclude<FormFailReason, 'error'>, () => string>>({
		rateLimited: config.messages.form_error_rateLimited,
		unauthenticated: config.messages.form_error_unauthenticated,
		forbidden: config.messages.form_error_forbidden,
		unavailable: config.messages.form_error_unavailable
	});

	/**
	 * Own-property lookups on both records, which is what makes the rule this
	 * module documents — an unlisted reason gets the shared copy — actually
	 * hold. `messages[reason]` returns a truthy *inherited* member for
	 * 'constructor', 'toString' and '__proto__', and `reason in GENERIC` is true
	 * for all three, so each rendered a prototype member where a sentence
	 * belongs: "function Object() { [native code] }" in place of an error.
	 *
	 * Not reachable today — every reason the server produces is a constant from
	 * a closed set — so this is not a guard against an attacker. It is the
	 * difference between the fallback being documented and it being true.
	 */
	function messageFor(reason: FormFailReason | ExtraReason | undefined): string {
		if (reason) {
			const override = Object.hasOwn(messages, reason) ? messages[reason] : undefined;
			if (override) return override;
			if (Object.hasOwn(GENERIC, reason)) {
				return GENERIC[reason as Exclude<FormFailReason, 'error'>]();
			}
		}
		return config.messages.form_error_generic();
	}
</script>

{#if result && !result.ok}
	<FormFeedback kind="error">{messageFor(result.reason)}</FormFeedback>
{/if}
