# Edit mode

Every content component can make its text editable in place. The design has
one rule: **the package never talks to a database.** Editability is data the
host app injects; persistence is a function the host app provides.

## The three pieces

**1. The adapter** — install once, where the editing app decides:

```ts
import { setEditAdapter } from '@vit-foundation/ui';

let editing = $state(false);

setEditAdapter({
	get isEditing() {
		return editing; // reactive getter — gates every affordance live
	},
	save: async (descriptor, value) => {
		// Persist { [descriptor.locale]: value } into the localized column
		// descriptor.ref names. Merge, never replace; reject an empty 'ca'
		// (it is the canonical, database-required locale). Reject on any
		// failure — the editor keeps the draft and shows the error state.
		await myBackend.saveContent(descriptor, value);
	}
});
```

No adapter installed (or `isEditing` false, or no descriptor passed) means
every edit prop is inert and the render is byte-identical to read-only.
That is the foundation website's whole guarantee: it never calls
`setEditAdapter`, so nothing there can ever become editable.

**2. The descriptors** — say what a string is:

```ts
import { pageCopyEdit, entityEdit, chromeEdit } from '@vit-foundation/ui';

// One page_content block:
pageCopyEdit('home', 'hero_title', 'ca', { label: 'Títol de portada' });

// Several fields of one row — name the row once:
const edit = entityEdit('weeklies', weekly.id, locale);
edit('title', { label: 'Títol' });
edit('excerpt', { format: 'multiline' });
edit('body', { format: 'richtext' });

// One interface-wording message (a UiMessages catalog key):
chromeEdit('footer_rights', locale);
```

Labels of INTERACTIVE controls — nav links, submit buttons, pagination,
filter chips, form-field labels, the sort label — edit through `ActionLabel`:
while the adapter is editing, the control is replaced by its label as
editable text (a caret inside a live control would activate it) and comes
back when editing turns off. `Field` swaps only its `<label>` line, so the
input stays rendered and live. `Nav`, `Footer` and `FilterChips` take an
`editFor` prop because the host owns the wording behind their entries (a
route's message key, a theme's localized name); the form buttons, labels,
Pagination, read-more links and timeline category labels resolve their own
keys through `config.messageEdit`. Still not editable in place: `<option>`s,
placeholders and aria strings — those stay with the host's wording editor.

Interface wording is offered by the components themselves: pass
`messageEdit: (key) => chromeEdit(key, locale)` in the `UiProvider` config and
each component wraps its own parameterless, plain-text message sites in
`Editable`. Parameterized messages and strings in interactive or attribute
positions (buttons, `<option>`s, placeholders, aria labels) are deliberately
not offered — editing rendered text would corrupt a template — and stay with
the host's own wording editor. Without `messageEdit` (every app but a CMS)
those strings render as plain text.

`format` decides the editing behaviour: `'text'` (default) commits on Enter
and forbids newlines, `'multiline'` commits on Cmd/Ctrl+Enter, `'richtext'`
opens RichText's source editor. `label` becomes the control's accessible name.

**3. The components** — pass descriptors to the fields you want editable:

```svelte
<WeeklieCard {weekly} edit={{ title: edit('title'), excerpt: edit('excerpt') }} />
<TimelineMilestone {milestone} edit={{ title: …, body: … }} />
<TeamMemberCard {member} edit={{ role: …, bio: … }} />
<JobList {jobs} editFor={(job) => ({ title: …, description: … })} />
<CopyIntro text={copy.intro} edit={pageCopyEdit('home', 'intro', locale)} />
<RichText body={weekly.body} edit={edit('body', { format: 'richtext' })} />
```

For a render site the components don't cover, wrap it with the primitive:

```svelte
<Editable edit={pageCopyEdit('home', 'hero_title', locale)} value={copy.hero_title}>
	{#snippet children(text, attrs)}
		<h1 {...attrs}>{text}</h1>
	{/snippet}
</Editable>
```

`Editable` renders no element of its own — the snippet owns the tag, and the
attrs bag carries `contenteditable`, the textbox role, and the state hooks.

## The editing UX (what the attrs bag implements)

Click into an outlined text and type; the DOM owns the draft. Blur or Enter
commits (Cmd/Ctrl+Enter for multiline); Escape reverts to the last saved
value. While saving the text dims; a failed save keeps the draft on screen
in the error outline so nothing typed is lost. State is announced through a
visually-hidden `role="status"` region (Desant… / Desat / Error en desar).
The outline styles live in `base.css` under `[data-vit-editing]` — import it.

A card title being edited renders as plain text instead of its link: a
contenteditable inside an anchor still navigates on click.

## The save contract, precisely

- One field, one locale per save: merge `{ [locale]: value }` into the stored
  jsonb — the shape is `{ ca: string; en?: string; es?: string }`
  (`LocalizedText`), Catalan canonical and required.
- Resolve ⇒ the editor settles to idle and keeps the committed text.
- Reject ⇒ error state, draft kept, reader decides whether to retry.
- The adapter is also where authorization lives. The package gates nothing —
  render edit descriptors only for users your server will actually allow, and
  re-check on every save server-side.
