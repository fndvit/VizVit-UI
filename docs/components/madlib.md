# Madlib

`import { … } from '@vit-foundation/ui/madlib'` — a sentence with blanks:
"Show me [open positions] in [Barcelona] over the last [12 months]". Each
blank is a level of a **sentence tree**; what a level offers depends on what
was chosen above it; the value is the **path** of chosen ids, root to leaf.
Domain-free — it knows ids, labels and connectors, and the host decides what
a path means — and themed with `--vit-madlib-*` custom properties rather than
utility classes.

Like `/scrolly`, this entry point does **not** re-export from the package
root: its helper names (`walkTree`, `completePath`) are too plain to sit in a
flat barrel.

## The tree

```ts
import type { SentenceNode } from '@vit-foundation/ui/madlib';

const tree: SentenceNode = {
	id: 'root',
	label: 'Show me', // the sentence's leading text
	children: [
		{
			id: 'jobs',
			label: 'open positions', // what the option reads as
			connector: 'in', // the text after it, before the next blank
			children: [
				{ id: 'bcn', label: 'Barcelona', connector: 'over the last', children: periods() },
				{ id: 'remote', label: 'remote roles', connector: 'over the last', children: periods() }
			]
		},
		{ id: 'projects', label: 'projects', connector: 'started in the last', children: periods() }
	]
};
```

| Field       | Role                                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| `id`        | unique among its siblings; the path carries these                                                           |
| `label`     | what the option reads as, in the control and in the sentence; on the root, the leading text                 |
| `connector` | text after this node's control, before the next one; on a leaf, it trails the sentence instead of vanishing |
| `children`  | the next level's options; a node without children is a leaf                                                 |

## Madlib

```svelte
<script lang="ts">
	import { Madlib, defaultPath } from '@vit-foundation/ui/madlib';
	let path = $state(defaultPath(tree)); // ['jobs', 'bcn', '12m']
</script>

<Madlib {tree} {path} onchange={(next) => (path = next)} />
```

The component holds no copy of the path. It draws one control per level of
the path it is given, and on every pick hands `onchange` the **next full path**
— levels above the change kept, the changed level set, every deeper level
keeping the id it had if that is still an option there and resetting to the
first child if not. A host that rejects a change simply does not pass it back.

| Prop                | Type                                       | Notes                                                                                                                                    |
| ------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `tree`              | `SentenceNode`                             | the sentence tree                                                                                                                        |
| `path`              | `readonly string[]`                        | the chosen ids, root to leaf; a partial or stale path draws as far as it resolves, so complete it first (`completePath`)                 |
| `onchange`          | `(path: string[]) => void`                 | the next full path, on every pick                                                                                                        |
| `controls?`         | `(depth, level) => 'dropdown' \| 'toggle'` | how each level is rendered; every level is a dropdown when omitted                                                                       |
| `onopen?`           | `() => void`                               | fired when any control is activated, before the change — a host cycling through sentences stops here                                     |
| `bind:contentWidth` | `number`                                   | the widest rendered line, in px, remeasured on every change; for aligning something under the sentence to the text rather than the block |
| `class?`            | `string`                                   | appended to the wrapper                                                                                                                  |

### Toggle levels

A level rendered as a `toggle` lists its options in the text — active one
bold and underlined, the others muted, separated by bars — and takes a line of
its own together with the text that introduces it. That lets a two-way branch
read as a headline over the rest of the sentence:

```svelte
<Madlib
	{tree}
	{path}
	onchange={(next) => (path = next)}
	controls={(depth) => (depth === 0 ? 'toggle' : 'dropdown')}
/>
```

```
Farming in the  present | future
Show me where [all crops] are grown, by [area]
```

Dropdown levels that follow each other share one line (the "body" line); each
toggle level opens a new "lead" line. The two lines have their own size tokens.

## InlineSelect

The blank on its own — a select that reads as a word in running text, with a
listbox below it. `<Madlib>` renders one per dropdown level; use it directly
for a lone choice in a heading ("Practices in [Spain]").

```svelte
<h2>
	Practices in
	<InlineSelect value={country} {options} onchange={(v) => (country = v)} label="Country" />
</h2>
```

| Prop        | Type                            | Notes                                                        |
| ----------- | ------------------------------- | ------------------------------------------------------------ |
| `value`     | `string`                        | the chosen option                                            |
| `options`   | `{ value, label, disabled? }[]` | in order                                                     |
| `onchange?` | `(value: string) => void`       | on pick                                                      |
| `onopen?`   | `() => void`                    | before the listbox opens                                     |
| `label?`    | `string`                        | accessible name, when the surrounding text does not give one |
| `class?`    | `string`                        | appended to the wrapper                                      |

The trigger is only as wide as the chosen label, so the sentence reflows as
the value changes; the listbox is as wide as its widest option. Escape closes
it, ArrowDown opens it, a click anywhere else closes it.

## The helpers

All pure, all on the same tree, all exported so a host can do what the
component does without it:

| Helper                             | Returns                                                                                                                      |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `walkTree(tree, path)`             | one `{ node, siblings }` per resolved level — stops at the first id that is not a child of the level above                   |
| `completePath(tree, partial)`      | a full path: the prefix kept as far as it resolves, first-child defaults from there. The way to validate a deep link         |
| `defaultPath(tree)`                | `completePath(tree, [])`                                                                                                     |
| `replaceAt(tree, path, depth, id)` | a full path with one level changed — deeper ids kept where still valid, reset where not. What `<Madlib>` calls on every pick |
| `leafPaths(tree)`                  | every root-to-leaf path, depth first — to cycle through all sentences, or to check each one resolves to something            |

## Theming

The controls inherit the font, size and weight of the text around them, so
most tokens default to "whatever the sentence is"; the menu and the accents
are the ones a theme sets. All declared in `tokens.css`:

| Token                           | Default                                             | Role                                             |
| ------------------------------- | --------------------------------------------------- | ------------------------------------------------ |
| `--vit-madlib-font`             | `inherit`                                           | font family of the sentence                      |
| `--vit-madlib-color`            | `inherit`                                           | colour of the sentence                           |
| `--vit-madlib-weight`           | `inherit`                                           | weight of the running text                       |
| `--vit-madlib-control-weight`   | `700`                                               | weight of a chosen option                        |
| `--vit-madlib-lead-size`        | `1em`                                               | font size of a toggle's line                     |
| `--vit-madlib-lead-line-height` | `1.4`                                               | line height of a toggle's line                   |
| `--vit-madlib-size`             | `1em`                                               | font size of the dropdown lines                  |
| `--vit-madlib-line-height`      | `1.4`                                               | line height of the dropdown lines                |
| `--vit-madlib-muted-color`      | `color-mix(in srgb, currentColor 35%, transparent)` | unchosen toggle options, bars, menu options      |
| `--vit-madlib-accent`           | `currentColor`                                      | the active toggle option's underline             |
| `--vit-madlib-select-accent`    | `var(--vit-madlib-accent)`                          | a dropdown's underline while open or hovered     |
| `--vit-madlib-menu-bg`          | `var(--color-surface)`                              | the listbox surface                              |
| `--vit-madlib-menu-hover`       | `color-mix(in srgb, currentColor 10%, transparent)` | the option under the pointer, and the chosen one |
| `--vit-madlib-menu-shadow`      | `none`                                              | the listbox shadow                               |
| `--vit-madlib-menu-max-height`  | `15rem`                                             | the listbox scroll height                        |
| `--vit-madlib-menu-z`           | `40`                                                | the listbox stacking order                       |

A responsive size ramp belongs in the host, not the package: set
`--vit-madlib-lead-size` and `--vit-madlib-size` under your own media queries.
