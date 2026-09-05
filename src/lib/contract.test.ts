import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { importSpecifiers } from './testing/imports.js';

const LIB_ROOT = fileURLToPath(new URL('.', import.meta.url));

/**
 * What `./contract` promises: a host can import it from SERVER code.
 *
 * The promise is only worth the walk that proves it. `localize` and `LOCALES`
 * sit in barrels beside `Editable.svelte` and `UiProvider.svelte`, so the
 * hazard is not hypothetical — it is the reason vit-brain restated four of
 * these values instead of importing them. A `.svelte` added anywhere beneath
 * this entry would put the component graph back into a consumer's server
 * bundle silently, and no type error would say so.
 *
 * Relative specifiers only: this package has no dependencies whose graph
 * could reach a component, and `no-app-imports.test.ts` already forbids the
 * app virtual modules that would be the other way in.
 *
 * The three import forms a bundler follows are `importSpecifiers`' rule, not
 * this file's. Two of them used to be invisible here — the pattern required
 * the `from` keyword, so a side-effect import (`import './Modal.svelte'`) and
 * a dynamic one (`() => import('./Icon.svelte')`) both walked past a guard
 * whose whole job is to see them. The fix was made here and NOT in
 * `no-app-imports.test.ts`, which this file delegates the other half of the
 * promise to and which still required `from`; the grammar has one owner now.
 * A type-only import from a `.svelte` file is reported here for the reason
 * stated there.
 *
 * All this file adds is which specifiers it follows: the relative ones.
 */
const isRelative = (specifier: string): boolean => specifier.startsWith('.');

/** `./config/types.js` as authored resolves to `config/types.ts` on disk. */
function resolveSource(fromFile: string, specifier: string): string | null {
	const base = resolve(dirname(fromFile), specifier);
	const candidates = [
		base.replace(/\.js$/, '.ts'),
		base.replace(/\.js$/, '.svelte'),
		`${base}.ts`,
		`${base}.svelte`,
		join(base, 'index.ts')
	];
	return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

/**
 * The graph beneath `entry`, and the modules it MUST contain.
 *
 * `mustReach` is a required argument rather than a separate assertion, which
 * is the correction this guard needed most. It used to end with
 * `expect(graph.length).toBeGreaterThan(2)` — a threshold, over a real graph
 * of five. A walk that quietly stopped seeing two thirds of the tree, which
 * is exactly what the two missing import forms above allowed, would clear
 * that floor and report a clean bill of health over almost nothing. Both
 * assertions below pass trivially over an empty graph, so a safety net that
 * can narrow in silence was reproducing the defect it exists to prevent.
 *
 * fndvit-website solved this first (`src/lib/testing/source-scan.ts`): a scan
 * cannot walk the tree without saying what it must find, and a walk that
 * comes back without them throws naming them. Vacuity stops being something
 * a test author has to remember. Paths are relative to this directory with
 * `/` separators — one representation crosses this interface, so an anchor
 * cannot silently fail to match an absolute path.
 */
function importGraph(entry: string, mustReach: readonly string[]): string[] {
	const seen = new Set<string>();
	const queue = [entry];
	while (queue.length > 0) {
		const file = queue.shift() as string;
		if (seen.has(file)) continue;
		seen.add(file);
		const source = readFileSync(file, 'utf-8');
		for (const specifier of importSpecifiers(source).filter(isRelative)) {
			const resolved = resolveSource(file, specifier);
			if (resolved !== null) queue.push(resolved);
		}
	}
	const walked = [...seen].map((file) => relative(LIB_ROOT, file).replaceAll('\\', '/'));
	const missing = mustReach.filter((anchor) => !walked.includes(anchor));
	if (missing.length > 0) {
		throw new Error(
			`the contract walk reached ${walked.length} modules but not ${missing.join(', ')} — ` +
				'either the entry stopped importing them or the walk stopped seeing an import form'
		);
	}
	return [...seen];
}

/**
 * Every module the contract is expected to pull in. Adding a re-export to
 * `contract.ts` belongs here too: that is what keeps the walk honest about
 * the surface it is actually guarding.
 */
const CONTRACT_MODULES = [
	'contract.ts',
	'config/types.ts',
	'config/edit-messages.ts',
	'content/types.ts',
	'edit/types.ts',
	'edit/helpers.ts',
	'utils/weekly-list-contract.ts',
	'forms/constraints.ts',
	'forms/transport.ts',
	'forms/types.ts',
	'utils/paths.ts',
	'utils/document-title.ts'
] as const;

describe('the contract subpath', () => {
	const graph = importGraph(join(LIB_ROOT, 'contract.ts'), CONTRACT_MODULES);

	it('reaches no Svelte component, so a server module may import it', () => {
		expect(graph.filter((file) => file.endsWith('.svelte'))).toEqual([]);
	});

	it('reaches no rune module either — those need the Svelte compiler', () => {
		expect(graph.filter((file) => file.endsWith('.svelte.ts'))).toEqual([]);
	});
});
