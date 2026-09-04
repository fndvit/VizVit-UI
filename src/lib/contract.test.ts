import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

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
 */
const RELATIVE_IMPORT = /from\s+['"](\.[^'"]*)['"]/g;

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

function importGraph(entry: string): string[] {
	const seen = new Set<string>();
	const queue = [entry];
	while (queue.length > 0) {
		const file = queue.shift() as string;
		if (seen.has(file)) continue;
		seen.add(file);
		const source = readFileSync(file, 'utf-8');
		for (const [, specifier] of source.matchAll(RELATIVE_IMPORT)) {
			const resolved = resolveSource(file, specifier);
			if (resolved !== null) queue.push(resolved);
		}
	}
	return [...seen];
}

describe('the contract subpath', () => {
	const graph = importGraph(join(LIB_ROOT, 'contract.ts'));

	it('reaches no Svelte component, so a server module may import it', () => {
		expect(graph.filter((file) => file.endsWith('.svelte'))).toEqual([]);
	});

	it('reaches no rune module either — those need the Svelte compiler', () => {
		expect(graph.filter((file) => file.endsWith('.svelte.ts'))).toEqual([]);
	});

	/** A guard that walked an empty graph would pass and prove nothing. */
	it('walks the modules it claims to', () => {
		expect(graph.length).toBeGreaterThan(2);
	});
});
