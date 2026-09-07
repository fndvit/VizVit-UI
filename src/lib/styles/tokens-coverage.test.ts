import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const LIB_ROOT = fileURLToPath(new URL('..', import.meta.url));
const sheet = (name: string): string => readFileSync(join(LIB_ROOT, 'styles', name), 'utf-8');

/**
 * Every `var(--x)` a component's style block reads is declared: in
 * tokens.css, in base.css, or in the block itself (a local, not a token).
 *
 * The rule existed — fndvit-website asserts it in its own tree, over its own
 * files (`src/lib/styles/tokens.test.ts`). It did not exist over the ninety
 * style blocks that read most of the tokens, which are this package's. A
 * token renamed here and read under its old name in one component fails no
 * build anywhere: the property resolves to nothing and the colour is simply
 * wrong. The one apparent violation when this was written,
 * `--milestone-color`, is a local set inline on the element it is read from,
 * which is exactly why the check needs the same-component allowance and
 * cannot be done by eye.
 */
const declaredIn = (css: string): Set<string> =>
	new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1] as string));
const usedIn = (css: string): Set<string> =>
	new Set([...css.matchAll(/var\(\s*(--[\w-]+)/g)].map((match) => match[1] as string));

interface StyleBlock {
	file: string;
	css: string;
	/** Custom properties the component sets anywhere — its style block, an
	 * inline `style="--x: …"` or a `style:--x` directive. `--milestone-color`
	 * is the second kind: set on the element in markup, read in the block. */
	local: Set<string>;
}

function styleBlocks(dir: string): StyleBlock[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return styleBlocks(path);
		if (!entry.name.endsWith('.svelte')) return [];
		const source = readFileSync(path, 'utf-8');
		const local = new Set([
			...declaredIn(source),
			...[...source.matchAll(/style:(--[\w-]+)/g)].map((match) => match[1] as string)
		]);
		return [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((match) => ({
			file: relative(LIB_ROOT, path),
			css: match[1] as string,
			local
		}));
	});
}

describe('the package token contract, over the package', () => {
	const blocks = styleBlocks(LIB_ROOT);
	const shared = new Set([...declaredIn(sheet('tokens.css')), ...declaredIn(sheet('base.css'))]);

	it('resolves every token a component reads', () => {
		const unresolved = blocks.flatMap(({ file, css, local }) => {
			return [...usedIn(css)]
				.filter((token) => !shared.has(token) && !local.has(token))
				.map((token) => `${file} reads ${token}`);
		});
		expect(unresolved).toEqual([]);
	});

	it('walked the tree — floors above what an empty or narrowed walk would clear', () => {
		const used = new Set(blocks.flatMap(({ css }) => [...usedIn(css)]));
		expect(blocks.length).toBeGreaterThan(60);
		expect(used.size).toBeGreaterThan(25);
		expect(shared.size).toBeGreaterThan(40);
	});
});
