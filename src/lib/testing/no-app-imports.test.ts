import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { importSpecifiers, sourceFiles } from './imports.js';

const LIB_ROOT = fileURLToPath(new URL('..', import.meta.url));

/**
 * What makes this package publishable: nothing under src/lib may import a
 * SvelteKit app virtual module or an app-compiled i18n runtime. The app
 * hands those in through UiConfig; a component that reaches for them
 * directly compiles here and breaks in every consumer.
 *
 * The patterns test the SPECIFIER, not the file's text, which is what the
 * `from` keyword used to smuggle past: two of the three required it, so a
 * dynamic import of an $app specifier and a bare side-effect import of one
 * both walked through. `contract.test.ts` had
 * already found and recorded that exact hole in its own copy of the grammar
 * — and it delegates this half of the promise here — so the grammar is
 * `./imports.js`'s now and each guard only says which specifiers it refuses.
 */
const FORBIDDEN = [/^\$app\//, /^\$env\//, /^\$lib\/paraglide/];

/**
 * Modules the walk MUST enumerate, for the reason `sourceFiles` states:
 * `expect(offenders).toEqual([])` is a clean bill of health over a walk that
 * found nothing. One from each shape the scan has to keep seeing — the
 * barrel, the server-safe entry, a component, and a rune module.
 */
const ANCHORS = [
	'index.ts',
	'contract.ts',
	'components/layout/PageShell.svelte',
	'utils/weekly-list.svelte.ts'
] as const;

describe('package purity', () => {
	it('imports no $app, $env, or app-compiled i18n module anywhere under src/lib', () => {
		const offenders = sourceFiles(LIB_ROOT, ANCHORS)
			.filter((file) =>
				importSpecifiers(readFileSync(file, 'utf-8')).some((specifier) =>
					FORBIDDEN.some((pattern) => pattern.test(specifier))
				)
			)
			.map((file) => relative(LIB_ROOT, file).replaceAll('\\', '/'));

		expect(offenders).toEqual([]);
	});
});
