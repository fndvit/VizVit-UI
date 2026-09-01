import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const LIB_ROOT = fileURLToPath(new URL('..', import.meta.url));

/**
 * What makes this package publishable: nothing under src/lib may import a
 * SvelteKit app virtual module or an app-compiled i18n runtime. The app
 * hands those in through UiConfig; a component that reaches for them
 * directly compiles here and breaks in every consumer.
 */
const FORBIDDEN = [/from\s+['"]\$app\//, /from\s+['"]\$env\//, /['"]\$lib\/paraglide/];

function sourceFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return sourceFiles(path);
		return /\.(ts|svelte)$/.test(entry.name) ? [path] : [];
	});
}

describe('package purity', () => {
	it('imports no $app, $env, or app-compiled i18n module anywhere under src/lib', () => {
		const offenders = sourceFiles(LIB_ROOT).filter((file) => {
			const source = readFileSync(file, 'utf-8');
			return FORBIDDEN.some((pattern) => pattern.test(source));
		});
		expect(offenders).toEqual([]);
	});
});
