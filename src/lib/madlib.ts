/**
 * The madlib: a sentence with blanks, where each blank is a level of a tree
 * and the value is the path of chosen ids. `<Madlib>` renders one; the tree
 * helpers are the arithmetic it is a projection of, exported so a host can
 * complete a deep link, enumerate every sentence, or drive a second control
 * off the same tree. `<InlineSelect>` is the blank on its own, for a lone
 * choice inside a heading.
 *
 * Domain-free: it knows ids, labels and connectors, and nothing about what a
 * path means. Themed with `--vit-madlib-*` custom properties rather than
 * utility classes, and not re-exported from the package root.
 */
export { default as Madlib } from './components/madlib/Madlib.svelte';
export type { MadlibControl, MadlibControls } from './components/madlib/Madlib.svelte';
export { default as InlineSelect } from './components/madlib/InlineSelect.svelte';
export type { InlineOption } from './components/madlib/InlineSelect.svelte';
export {
	completePath,
	defaultPath,
	leafPaths,
	replaceAt,
	walkTree,
	type SentenceLevel,
	type SentenceNode
} from './components/madlib/sentenceTree.js';
