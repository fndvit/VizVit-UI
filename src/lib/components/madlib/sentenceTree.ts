/**
 * The sentence tree: the data behind a madlib, and the path arithmetic on it.
 *
 * A madlib is a sentence with blanks — "Show me [open positions] in
 * [Barcelona] over the last [12 months]" — where each blank is one level of a
 * tree and the options offered at a level are the children of what was picked
 * at the level above. A selection is therefore a **path**: one node id per
 * level, root to leaf. Everything the component does is arithmetic on that
 * path, so it lives here, pure and tested, and `<Madlib>` only projects it.
 *
 * The tree is plain data. `label` is what a node reads as when it is the
 * chosen option; `connector` is the text that follows it before the next
 * blank; the root's `label` is the sentence's leading text. Nothing here
 * knows what a path *means* — that is the host's mapping, on the way out.
 */

/**
 * One node of a sentence tree.
 *
 * @property id - Unique among its siblings; the path carries these
 * @property label - What the option reads as, in the control and in the sentence
 * @property connector - Text after this node's control, before the next one. On a
 * leaf it trails the sentence instead, since there is no next control
 * @property children - The next level's options. A node without children is a leaf
 */
export interface SentenceNode {
	id: string;
	label: string;
	connector?: string;
	children?: SentenceNode[];
}

/** One resolved level of a path: the node chosen there, and every option it was chosen from. */
export interface SentenceLevel {
	node: SentenceNode;
	siblings: SentenceNode[];
}

/** The child of `node` with this id, or undefined — a leaf has none. */
function childOf(node: SentenceNode, id: string): SentenceNode | undefined {
	return node.children?.find((child) => child.id === id);
}

/** Whether `node` still has a level below it. */
function hasChildren(node: SentenceNode): node is SentenceNode & { children: SentenceNode[] } {
	return node.children !== undefined && node.children.length > 0;
}

/**
 * Resolves a path against the tree, one level per id, stopping at the first
 * id that is not a child of the level above (or at a leaf). The result is what
 * a control per level needs: the chosen node and its siblings.
 *
 * @param tree - The root node
 * @param path - Node ids, root to leaf
 * @returns One entry per resolved level, possibly fewer than `path.length`
 *
 * @example
 * walkTree(tree, ['jobs', 'bcn'])
 * // → [{ node: jobs, siblings: [jobs, projects] }, { node: bcn, siblings: [bcn, remote] }]
 */
export function walkTree(tree: SentenceNode, path: readonly string[]): SentenceLevel[] {
	const levels: SentenceLevel[] = [];
	let current = tree;
	for (const id of path) {
		if (!current.children) break;
		const match = childOf(current, id);
		if (!match) break;
		levels.push({ node: match, siblings: current.children });
		current = match;
	}
	return levels;
}

/**
 * Completes a partial path down to a leaf by taking the first child at every
 * remaining level. The prefix is kept as far as it resolves; from the first
 * id that does not, the defaults take over. `completePath(tree, [])` is the
 * tree's default sentence.
 *
 * @param tree - The root node
 * @param partial - Leading node ids, possibly empty, possibly partly invalid
 * @returns A full root-to-leaf path
 */
export function completePath(tree: SentenceNode, partial: readonly string[]): string[] {
	const path: string[] = [];
	let current = tree;
	for (const id of partial) {
		const match = childOf(current, id);
		if (!match) break;
		path.push(id);
		current = match;
	}
	while (hasChildren(current)) {
		const first = current.children[0];
		path.push(first.id);
		current = first;
	}
	return path;
}

/**
 * The tree's default sentence: first child at every level.
 *
 * @param tree - The root node
 * @returns A full root-to-leaf path, empty for a tree with no children
 */
export function defaultPath(tree: SentenceNode): string[] {
	return completePath(tree, []);
}

/**
 * Changes one level of a path and re-completes everything below it.
 *
 * Levels above `depth` are kept. Below it, each level prefers the id the
 * previous path had at that same depth when it is still a valid option there
 * — so switching "maize" to "wheat" keeps "by area" — and falls back to the
 * first child when it is not, which is what happens across a branch change or
 * when the levels shift.
 *
 * @param tree - The root node
 * @param path - The current path
 * @param depth - Index of the level being changed
 * @param id - The new node id at that level
 * @returns A full root-to-leaf path
 */
export function replaceAt(
	tree: SentenceNode,
	path: readonly string[],
	depth: number,
	id: string
): string[] {
	const next = [...path.slice(0, depth), id];
	let current = tree;
	for (const step of next) {
		const match = childOf(current, step);
		if (!match) break;
		current = match;
	}
	while (hasChildren(current)) {
		const previous = path[next.length];
		const kept = previous === undefined ? undefined : childOf(current, previous);
		const chosen = kept ?? current.children[0];
		next.push(chosen.id);
		current = chosen;
	}
	return next;
}

/**
 * Every root-to-leaf path, depth first, in the order the tree declares them.
 * A host uses it to cycle through all sentences, or to check that each one
 * resolves to something.
 *
 * @param tree - The root node
 * @returns All full paths; `[[]]` for a tree with no children
 */
export function leafPaths(tree: SentenceNode): string[][] {
	const paths: string[][] = [];
	const visit = (node: SentenceNode, prefix: string[]) => {
		if (!hasChildren(node)) {
			paths.push(prefix);
			return;
		}
		for (const child of node.children) visit(child, [...prefix, child.id]);
	};
	visit(tree, []);
	return paths;
}
