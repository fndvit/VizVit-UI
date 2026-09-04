import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SHEET = fileURLToPath(new URL('./tokens.css', import.meta.url));
const withoutComments = readFileSync(SHEET, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * The shape of the published token sheet: exactly ONE `:root` block and no
 * at-rules. Two hosts read `@vit-foundation/ui/tokens.css` assuming that,
 * and neither can notice it stop being true.
 *
 * vit-brain's page-builder mirror rehomes the whole sheet with
 * `uiTokens.replaceAll(':root', '.cms-mirror')`, so the preview carries
 * website values inside an admin page that has its own theme — a rewrite
 * that is correct only while `:root` occurs once and means the document.
 * fndvit-website imports the sheet whole and overrides properties after it,
 * which needs the same single, unconditional source.
 *
 * So a dark-mode `@media`, a `:root:not([data-theme])`, or an `html`
 * selector added here mis-scopes the mirror — tokens landing on the admin
 * document instead of the preview, or a rewritten selector that no longer
 * matches — with no error anywhere: the CSS parses, the components render,
 * the colors are simply wrong in one host. This test is where the invariant
 * lives; the copies in `vit-brain/src/lib/website/tokens.test.ts` and
 * `fndvit-website/src/lib/styles/tokens.test.ts` are belt, and they assert
 * against node_modules rather than a source of truth.
 *
 * Theming that needs a second scope belongs to the host, or to a new sheet
 * with its own export — not to this file.
 */
describe('tokens.css', () => {
	it('declares exactly one selector block, and it is :root', () => {
		const selectors = [...withoutComments.matchAll(/([^{}]+)\{/g)].map((match) => match[1].trim());
		expect(selectors).toEqual([':root']);
	});

	it('carries no at-rule, so no token has a second conditional value', () => {
		expect(withoutComments).not.toMatch(/@[\w-]+/);
	});
});
