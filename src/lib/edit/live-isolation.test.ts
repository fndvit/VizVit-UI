import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { importSpecifiers, sourceFiles } from '../testing/imports.js';

const LIB_ROOT = resolve(import.meta.dirname, '..');
const COMPONENTS = join(LIB_ROOT, 'components');

/**
 * No renderer reaches the live edit chrome.
 *
 * `edit/live/` is the editing: the contenteditable, the property panel, the
 * link modal and the Modal primitive under it. Every renderer imports the
 * GATES (`edit/Editable.svelte`, `edit/chrome/*`), and a host that edits
 * installs the live half through `setEditAdapter(adapter, EDIT_CHROME)`. The
 * page tests already prove a read-only host's DOM is byte-identical with or
 * without descriptors; this proves the read-only host's BUNDLE is too, which
 * is the property the site actually pays for. Before this seam the nine page
 * modules imported `Editable` statically and the site shipped `dist/edit`
 * (176 KB) to render nothing with it.
 *
 * Same walker as `contract.test.ts`, same anchors discipline: the walk must
 * reach the gates from the page modules, or it has stopped seeing imports and
 * an empty offender list would mean nothing.
 */
const isRelative = (specifier: string): boolean => specifier.startsWith('.');

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
		for (const specifier of importSpecifiers(readFileSync(file, 'utf-8')).filter(isRelative)) {
			const resolved = resolveSource(file, specifier);
			if (resolved !== null) queue.push(resolved);
		}
	}
	return [...seen].map((file) => relative(LIB_ROOT, file).replaceAll('\\', '/'));
}

/** Renderers: every component a host can import, minus the test and story trees. */
const RENDERERS = sourceFiles(COMPONENTS, [
	'pages/HomePage.svelte',
	'pages/WhoWeArePage.svelte',
	'account/NewsletterSignup.svelte',
	'layout/Nav.svelte'
]).filter(
	(file) => file.endsWith('.svelte') && !/\/components\/(tests|stories)\//.test(file)
);

const isLive = (module: string): boolean => module.startsWith('edit/live/');

describe('the live edit chrome', () => {
	it('is reached by no renderer', () => {
		const offenders = RENDERERS.map((file) => ({
			renderer: relative(LIB_ROOT, file),
			live: importGraph(file).filter(isLive)
		})).filter(({ live }) => live.length > 0);
		expect(offenders).toEqual([]);
	});

	it('is fenced by gates the renderers DO reach — so the walk is seeing imports', () => {
		const pages = RENDERERS.filter((file) => file.includes('/components/pages/'));
		expect(pages.length).toBe(9);
		for (const page of pages) {
			expect(importGraph(page), relative(LIB_ROOT, page)).toContain('edit/Editable.svelte');
		}
	});

	it('is installed through exactly one module outside its directory', () => {
		const importers = sourceFiles(LIB_ROOT, ['edit/live/index.ts', 'edit/index.ts'])
			.filter((file) => !file.includes('/edit/live/') && !file.endsWith('.test.ts'))
			.filter((file) =>
				importSpecifiers(readFileSync(file, 'utf-8')).some((specifier) =>
					/(^|\/)live\//.test(specifier)
				)
			)
			.map((file) => relative(LIB_ROOT, file).replaceAll('\\', '/'));
		// The barrel forwards EDIT_CHROME and two dialogs a host may compose;
		// the probes and the story are a host, which is why they are exempt.
		expect(importers.filter((file) => !/^components\/(tests|stories)\//.test(file))).toEqual([
			'edit/index.ts'
		]);
	});
});
