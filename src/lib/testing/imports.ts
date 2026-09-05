import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * What a source scan needs to see, and the anchors that keep it honest.
 *
 * Two guards in this package walk the source: `contract.test.ts` follows the
 * relative import graph beneath `./contract`, and `no-app-imports.test.ts`
 * scans every module for an app virtual specifier. They ask different
 * questions of the same rule — WHICH MODULES DOES THIS ONE NAME — and each
 * used to answer it with a pattern of its own. `contract.test.ts` found the
 * defect in its copy and fixed it there:
 *
 *     "THREE import forms, because two of them used to be invisible here. The
 *     pattern required the `from` keyword, so a side-effect import and a
 *     dynamic one both walked past a guard whose whole job is to see them."
 *
 * The other copy was not fixed and still required `from`, so a dynamic import
 * of an $app specifier walked past the gate that decides whether this package
 * is publishable. Copying the lesson a third time is how a guard
 * starts missing things again; the grammar lives here instead, and each guard
 * filters the specifiers it cares about.
 */

/**
 * Every module specifier a source file names, in all three forms a bundler
 * follows: `from '…'` (import and re-export alike), a bare side-effect
 * `import '…'`, and a dynamic `import('…')`.
 *
 * A type-only import is reported like any other. That is deliberate, and it
 * is `contract.test.ts`'s standing argument: erasure is a build-time fact, and
 * a pattern that has to understand `import type` is a pattern with a second
 * way to be wrong.
 */
export function importSpecifiers(source: string): readonly string[] {
	return [...source.matchAll(/(?:\bfrom|\bimport)\s*\(?\s*['"]([^'"]*)['"]/g)].map(
		([, specifier]) => specifier
	);
}

/**
 * Every `.ts` and `.svelte` file beneath `root`, and the ones the walk MUST
 * find.
 *
 * `mustReach` is a required argument for the reason `contract.test.ts` gives
 * at length: an assertion over an empty list passes. `expect(offenders)
 * .toEqual([])` is a clean bill of health over a walk that enumerated nothing
 * — a directory renamed, a `readdirSync` that threw and was caught upstream,
 * an entry filter that stopped matching — and a safety net that can narrow in
 * silence reproduces the defect it exists to prevent. fndvit-website's
 * `src/lib/testing/source-scan.ts` settled the shape: a scan cannot walk the
 * tree without saying what it must find.
 *
 * Anchors are relative to `root` with `/` separators, so one representation
 * crosses this interface and an anchor cannot silently fail to match an
 * absolute path. A FLOOR was the alternative and is the thing being replaced:
 * a walk that quietly stopped seeing two thirds of the tree clears any floor
 * worth setting.
 */
export function sourceFiles(root: string, mustReach: readonly string[]): readonly string[] {
	const walk = (dir: string): string[] =>
		readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
			const path = join(dir, entry.name);
			if (entry.isDirectory()) return walk(path);
			return /\.(ts|svelte)$/.test(entry.name) ? [path] : [];
		});

	const files = walk(root);
	const found = new Set(files.map((file) => relative(root, file).replaceAll('\\', '/')));
	const missing = mustReach.filter((anchor) => !found.has(anchor));
	if (missing.length > 0) {
		throw new Error(
			`the source scan enumerated ${files.length} files but not ${missing.join(', ')} — ` +
				'either the module moved or the walk stopped seeing it'
		);
	}
	return files;
}
