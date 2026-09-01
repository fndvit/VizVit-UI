import type { FieldConstraint } from '../content/types.js';

/**
 * The bounds of the foundation's form fields — one declaration each, feeding
 * both halves: the host app's schemas build their validations from these, and
 * the form components spread them into the markup's length attributes through
 * Field. A bound written in only one of the two places is enforced on the
 * server and unstated in the browser, or vice versa.
 */
export const DISPLAY_NAME = { min: 1, max: 100 } as const satisfies FieldConstraint;
export const EMAIL = { max: 320 } as const satisfies FieldConstraint;
export const PASSWORD = { min: 8, max: 200 } as const satisfies FieldConstraint;

/**
 * The login password's own constraint: the site's maximum, and no minimum.
 * A `minlength` borrowed from PASSWORD would refuse a valid older password
 * in the browser before the server ever saw it.
 */
export const LOGIN_PASSWORD = { max: PASSWORD.max } as const satisfies FieldConstraint;

export const COMMENT_BODY = { max: 2000 } as const satisfies FieldConstraint;
export const CONTACT_NAME = { max: 200 } as const satisfies FieldConstraint;
export const CONTACT_MESSAGE = { max: 5000 } as const satisfies FieldConstraint;
