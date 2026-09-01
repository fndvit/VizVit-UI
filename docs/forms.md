# Forms and the remote-form seam

The community components (login, signup, account, comments, reactions,
contact) render real, no-JS-capable forms — but the package owns none of the
validation and none of the transport. That is the seam:

- **The host app owns** its remote functions, its zod schemas, and the
  `preflight` pairing between them.
- **The package owns** the markup, the copy, the constants both halves must
  agree on, and structural types describing exactly what the markup consumes.

## Passing a form in

Every form component takes its remote form as a **required prop**, already
preflighted at the call site:

```svelte
<script lang="ts">
	import { LoginForm } from '@vit-foundation/ui';
	import { loginForm, magicLinkForm } from '$lib/remote/auth.remote';
	import { loginInputSchema, magicLinkInputSchema } from '$lib/schemas/auth';

	const login = $derived(loginForm.preflight(loginInputSchema));
	const magic = $derived(magicLinkForm.preflight(magicLinkInputSchema));
</script>

<LoginForm loginForm={login} magicLinkForm={magic} />
```

Keyed instances (one `<form>` per row/chip) travel as factories, so keying
and schema stay host-side:

```svelte
<CommentSection
	{comments}
	weeklySlug={slug}
	{isLoggedIn}
	commentForm={commentForm.preflight(commentInputSchema)}
	replyFormFor={(threadId) => commentForm.for(threadId).preflight(commentInputSchema)}
	reactionForms={{ weeklyReactionForm, commentReactionForm }}
/>
```

The prop types (`LoginFormInstance`, `CommentFormInstance`,
`ReactionBarForms`, …) are structural — SvelteKit's real remote forms satisfy
them, and so does `createRemoteFormMock` from `@vit-foundation/ui/testing`,
which is how the package's own stories and tests run, and how a CMS renders a
visually complete page whose forms do nothing.

## The shared constants (`./forms`)

| Export                                                                                                   | What both halves agree on                                                    |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `HONEYPOT_FIELD`                                                                                         | the honeypot input's name; the host envelope checks it                       |
| `NEWSLETTER_INTENT_PARAM` / `NEWSLETTER_INTENT_VALUE`                                                    | how newsletter intent travels in URLs and hidden fields                      |
| `hasNewsletterIntent(url)` / `withNewsletterIntent(path)` / `isNewsletterIntent(v)`                      | the intent's URL affordances                                                 |
| `EMAIL`, `PASSWORD`, `LOGIN_PASSWORD`, `DISPLAY_NAME`, `COMMENT_BODY`, `CONTACT_NAME`, `CONTACT_MESSAGE` | field bounds — feed them to your schemas; Field spreads them into the markup |
| `FormFailReason`, `FormResultOf`, `RemoteFormInstance`, `RemoteField`, `KeyedRemoteForms`                | the structural types of the seam                                             |

Import these into your schemas rather than restating the values — a honeypot
whose markup name drifts from the value the server checks stops catching
bots, silently.

## Form building blocks

For composing your own forms in the same visual language:

| Component               | Purpose                                                                                                                                                                                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Field`                 | labelled control wrapper: renders the schema's first issue, spreads the id/aria/length attrs into your control via snippet. Props: `id`, `label`, `field` (the remote field), `constraint` (a bound from `./forms`, or `null` for length-less controls), `hideLabel?` |
| `FormFeedback`          | one outcome sentence: `kind: 'success'` (role=status, takes focus) or `'error'` (role=alert)                                                                                                                                                                          |
| `FormErrorFeedback`     | maps a failed result's `reason` to the shared copy; `messages` overrides per reason                                                                                                                                                                                   |
| `FormResultSlot`        | success message or FormErrorFeedback, in one slot                                                                                                                                                                                                                     |
| `Honeypot`              | the spam trap (pass `form={f.fields}` and a page-unique `id`)                                                                                                                                                                                                         |
| `LocaleField`           | hidden `locale` input carrying the config locale through no-JS posts                                                                                                                                                                                                  |
| `NewsletterIntentField` | hidden input carrying newsletter intent through a form post                                                                                                                                                                                                           |
