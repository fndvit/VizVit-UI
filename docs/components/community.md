# Community & flows

`import { … } from '@vit-foundation/ui/community'` — the components with a
server flow behind them: auth, account, newsletter, comments, reactions,
contact. **Every one takes its remote form(s) as required props**, preflighted
by the host — read [the forms guide](../forms.md) first; the instance types
named below export from this entry point.

## AuthPageShell

The /login–/signup chrome: heading, intro, the tab pair (real links that
carry the newsletter intent across the switch, current tab derived from the
canonical pathname), and the legal note. Props: `title`, `heading`, `intro`,
`url?`, `children`.

## LoginForm

Password form + magic-link form (with honeypot), separated by the divider.

| Prop                    | Type                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| `loginForm`             | `LoginFormInstance` (preflighted)                                                                              |
| `magicLinkForm`         | `MagicLinkFormInstance` (preflighted)                                                                          |
| `redirectErrorMessage?` | `string \| null` — the finished sentence for a bounced auth landing; the host owns the closed set and its copy |
| `newsletterIntent?`     | `boolean` — carries ?newsletter=1 through the login post                                                       |

## SignupForm

Name/email/password, the single consent block (terms + newsletter checkboxes,
with `onTermsChange`/`onNewsletterChange` callbacks so the page can mirror
consent into the Google flow), locale field, honeypot. Success replaces the
form. Props: `signupForm: SignupFormInstance` (preflighted),
`newsletterIntent?`, `onTermsChange?`, `onNewsletterChange?`.

## GoogleAuthForm

The one Google button for both journeys (first sign-in creates the account).
Props: `googleLoginForm: GoogleLoginFormInstance`, `newsletterIntent?`,
`requireConsent?` (signup page mirrors its terms checkbox here).

## AccountPanel

The account page's four sections: display name (preflighted form), newsletter
toggle, data export link, logout, and the danger-zone deletion. Props:
`displayName`, `email`, `isSubscribed`, `canDelete`, `updateNameForm`,
`newsletterToggleForm`, `deleteAccountForm`, `logoutForm`.

## NewsletterSignup

The site-wide newsletter band. Logged out it routes to the auth pages
carrying the intent; subscribed it links to /account; otherwise it renders
the one-click subscribe form. Props: `account?: { displayName,
newsletterSubscribed } | null`, `newsletterToggleForm`.

## CommentSection

Threaded comments with per-comment reactions and reply disclosures (native
`<details>`, no JS needed). Props: `comments: CommentThreadData[]`,
`weeklySlug`, `isLoggedIn`, `commentForm` (preflighted main box),
`replyFormFor(threadId)` (keyed factory), `reactionForms: ReactionBarForms`.

## ReactionBar

One tiny form per reaction chip (toggling works without JS); the viewer's own
reactions render pressed; one shared alert for the bar's first failure.
Props: `reactions: ReactionSummary[]`, `target: ReactionTarget`,
`isLoggedIn`, `forms: ReactionBarForms`.

## ContactForm

Category select (from `CONTACT_CATEGORIES`, labels from `UiMessages`), name,
email, message, locale field, honeypot; success replaces the form.
Props: `form: ContactFormInstance` (preflighted).
