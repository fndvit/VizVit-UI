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
import { pageCopyEdit, entityEdit } from '@vit-foundation/ui';

// One page_content block:
pageCopyEdit('home', 'hero_title', 'ca', { label: 'Títol de portada' });

// Several fields of one row — name the row once:
const edit = entityEdit('weeklies', weekly.id, locale);
edit('title', { label: 'Títol' });
edit('excerpt', { format: 'multiline' });
edit('body', { format: 'richtext' });
```

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
