/**
 * The structural slice of SvelteKit's RemoteForm surface the form components
 * render with. Stated here rather than imported from @sveltejs/kit so the
 * package's only peer stays svelte: any object with this shape works — kit's
 * real remote forms, and the mock in ../testing/remote-form.js.
 *
 * The components take their form as a REQUIRED prop, already preflighted:
 * validation schemas belong to the host app's server contract, so the call
 * site runs `myForm.preflight(mySchema)` and hands the result in. Method
 * syntax throughout — TypeScript checks method parameters bivariantly, which
 * is what lets kit's narrower literal-typed signatures satisfy these.
 */

import type { FormFailReason } from '../content/types.js';

export interface FormFieldIssue {
	message: string;
}

/** One named field of a remote form, as the markup consumes it. */
export interface RemoteField {
	/** Spreadable input attributes for the given control type. */
	as(type: string, value?: string | boolean): Record<string, unknown>;
	issues(): FormFieldIssue[] | undefined;
}

/**
 * The spreadable half: `<form {...form}>` — kit enumerates exactly the form
 * attributes plus its submit handler on the instance.
 */
export interface RemoteFormAttributes {
	method: 'POST';
	action: string;
}

/** A form instance with the given named fields. */
export type RemoteFormInstance<
	Fields extends Record<string, RemoteField>,
	Result = FormResultLike
> = RemoteFormAttributes & {
	fields: Fields;
	pending: number;
	result: Result | undefined;
};

/** The discriminated result the components branch on. */
export interface FormResultLike {
	ok: boolean;
	reason?: string;
}

/** A failure carrying one of the shared envelope reasons, plus form-specific extras. */
export type FormFail<Extra extends string = never> = {
	ok: false;
	reason: FormFailReason | Extra;
};

/** The result shape of the foundation's form envelopes, structurally. */
export type FormResultOf<Ok = object, Extra extends string = never> =
	({ ok: true } & Ok) | FormFail<Extra>;

/** A keyed-form factory: `.for(id)` yields one instance per key. */
export interface KeyedRemoteForms<Instance> {
	for(key: string): Instance;
}
