import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const LIB_ROOT = import.meta.dirname;

/**
 * `./contract` "adds nothing: every name below is already exported from a
 * semantic subpath and stays there" (contract.ts). That sentence was prose.
 * Twenty-five names are spelled twice — the weeklies contract here and in
 * content-components.ts, the form bounds here and in forms/index.ts, the six
 * factories here and in edit/index.ts — and nothing checked the spellings
 * agree. A name added to a semantic door and not to this one is invisible
 * until a host's server module needs it, and then the fix is a release.
 *
 * So: every (name, source module) the contract re-exports must be re-exported
 * by at least one semantic door from the SAME source module. Same-source, not
 * same-name, because two doors forwarding one name from two modules would be
 * two facts wearing one label. The reverse direction — every component-free
 * name of a semantic door is on the contract — is not asserted: whether a
 * name belongs on the server is a judgement per name (`isPathUnder` is kept
 * off it on purpose), and a guard cannot make it.
 */
const SEMANTIC_DOORS = [
	// The root barrel counts for the one name it carries itself
	// (`buildQueryString`) — index.ts says why it is not on a subpath.
	'index.ts',
	'config/index.ts',
	'edit/index.ts',
	'content-components.ts',
	'forms/index.ts',
	'primitives.ts',
	'chrome.ts',
	'community.ts',
	'admin.ts',
	'testing.ts'
].filter((door) => existsSync(join(LIB_ROOT, door)));

interface ReExport {
	name: string;
	source: string;
}

function resolveSource(fromFile: string, specifier: string): string {
	const base = resolve(dirname(fromFile), specifier);
	const candidates = [base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.svelte'), base];
	const found = candidates.find((candidate) => existsSync(candidate)) ?? base;
	return relative(LIB_ROOT, found).replaceAll('\\', '/');
}

/** Every `export [type] { a, b as c } from '…'` in one barrel, as exported names. */
function reExports(file: string): ReExport[] {
	const source = readFileSync(file, 'utf-8');
	return [
		...source.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]/g)
	].flatMap(([, names, specifier]) =>
		names
			.split(',')
			.map((entry) => entry.trim().replace(/^type\s+/, ''))
			.filter((entry) => entry.length > 0)
			.map((entry) => ({
				name: entry.includes(' as ') ? (entry.split(/\s+as\s+/)[1] as string) : entry,
				source: resolveSource(file, specifier)
			}))
	);
}

/**
 * Names reachable ONLY through the contract, each with the reason on record:
 * the two destination classifiers are server-side rules (a CHECK constraint's
 * TypeScript twin — utils/paths.ts), and the title format's component reader
 * reaches it by relative import while its second reader is a host's error
 * page (contract.ts). A name landing here without a reason is the defect.
 */
const CONTRACT_ONLY = new Set([
	'isExternalUrl@utils/paths.ts',
	'isInternalPath@utils/paths.ts',
	'documentTitle@utils/document-title.ts'
]);

const contract = reExports(join(LIB_ROOT, 'contract.ts'));
const semantic = new Set(
	SEMANTIC_DOORS.flatMap((door) => reExports(join(LIB_ROOT, door))).map(
		({ name, source }) => `${name}@${source}`
	)
);

describe('the contract door', () => {
	it('re-exports a real surface — the anchors this walk must see', () => {
		const names = new Set(contract.map(({ name }) => name));
		for (const anchor of ['LOCALES', 'localize', 'WEEKLY_LIST_DEFAULTS', 'EMAIL', 'entityEdit']) {
			expect(names, anchor).toContain(anchor);
		}
		expect(SEMANTIC_DOORS.length).toBeGreaterThanOrEqual(9);
	});

	it('keeps the contract-only list honest — each entry really is absent from every door', () => {
		const stale = [...CONTRACT_ONLY].filter((entry) => semantic.has(entry));
		expect(stale).toEqual([]);
	});

	it('names nothing a semantic door does not name from the same module', () => {
		const orphans = contract
			.filter(({ name, source }) => !semantic.has(`${name}@${source}`))
			.filter(({ name, source }) => !CONTRACT_ONLY.has(`${name}@${source}`))
			.map(({ name, source }) => `${name} from ${source}`);
		expect(orphans).toEqual([]);
	});
});
