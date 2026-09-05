import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { importSpecifiers, sourceFiles } from './imports.js';

const LIB_ROOT = fileURLToPath(new URL('..', import.meta.url));

/**
 * The grammar the two source guards share, tested directly.
 *
 * It had no test of its own in either guard, which is how one of them went on
 * requiring the `from` keyword after the other had recorded why that was
 * wrong. A guard's pattern is a rule like any other: it belongs where it can
 * be handed the input it used to miss.
 */
describe('importSpecifiers', () => {
	it('sees the three forms a bundler follows', () => {
		expect(importSpecifiers("import x from './a.js';")).toEqual(['./a.js']);
		expect(importSpecifiers("import './b.svelte';")).toEqual(['./b.svelte']);
		expect(importSpecifiers("const c = () => import('./c.svelte');")).toEqual(['./c.svelte']);
	});

	it('sees a re-export, which is all `contract.ts` is made of', () => {
		expect(importSpecifiers("export { x } from './d.js';")).toEqual(['./d.js']);
		expect(importSpecifiers("export * from './e.js';")).toEqual(['./e.js']);
	});

	it('sees a type-only import — erasure is a build fact, not a scan’s business', () => {
		expect(importSpecifiers("import type { X } from './f.svelte';")).toEqual(['./f.svelte']);
	});

	/**
	 * The two forms the app-purity guard was blind to, in the shape that
	 * matters: NO `from` keyword. Spelled with a neutral specifier rather than
	 * an app virtual one — the grammar does not know what `$app` is, that is
	 * `no-app-imports.test.ts`'s list, and a quoted `$app` specifier here would
	 * reach `dist` and read as a real SvelteKit import to the packager.
	 */
	it('sees a bare specifier reached without `from`', () => {
		expect(importSpecifiers("await import('virtual:lazy');")).toEqual(['virtual:lazy']);
		expect(importSpecifiers("import 'virtual:side-effect';")).toEqual(['virtual:side-effect']);
	});

	it('reports every specifier in a file, in source order', () => {
		const source = ["import a from 'virtual:first';", "import './side.css';"].join('\n');
		expect(importSpecifiers(source)).toEqual(['virtual:first', './side.css']);
	});

	it('answers nothing for a module that imports nothing', () => {
		expect(importSpecifiers('export const value = 1;')).toEqual([]);
	});
});

describe('sourceFiles', () => {
	it('enumerates the package’s .ts and .svelte modules', () => {
		const files = sourceFiles(LIB_ROOT, ['index.ts']);
		expect(files.length).toBeGreaterThan(1);
		expect(files.every((file) => /\.(ts|svelte)$/.test(file))).toBe(true);
	});

	/**
	 * The assertion the anchors exist for. Without them a walk that enumerated
	 * nothing would satisfy every `toEqual([])` downstream of it.
	 */
	it('throws naming the anchor it did not reach, rather than returning a short list', () => {
		expect(() => sourceFiles(LIB_ROOT, ['index.ts', 'no/such/module.ts'])).toThrow(
			'no/such/module.ts'
		);
	});
});
