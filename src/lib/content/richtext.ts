export interface RichTextBlock {
	type: 'h2' | 'p';
	text: string;
}

/**
 * Renders the lightweight markdown used for editorial body fields
 * (paragraphs separated by blank lines, subheadings as `## ` lines)
 * into typed blocks. Rendered with real elements — never `{@html}`.
 */
export function renderBody(body: string): RichTextBlock[] {
	return body
		.split(/\n{2,}/)
		.map((chunk) => chunk.trim())
		.filter((chunk) => chunk.length > 0)
		.map((chunk) =>
			chunk.startsWith('## ')
				? { type: 'h2' as const, text: chunk.slice(3).trim() }
				: { type: 'p' as const, text: chunk.replace(/\n/g, ' ') }
		);
}

/** One run of a paragraph: plain, or emphasised (`**…**` in the source). */
export interface InlineRun {
	text: string;
	strong: boolean;
}

/**
 * The inline half of the mini-format: `**text**` is a strong run. Everything
 * else is one plain run. An unmatched `**` is literal — the format has no
 * escape and needs none, since a stray marker stays visible rather than
 * swallowing the rest of the paragraph. Rendered by `InlineText` with real
 * `<strong>` elements — never `{@html}`.
 *
 * Kept OUT of `renderBody`: `RichTextBlock` is `{ type, text }` on
 * `./content`, and the hosts' previews read `text` as the paragraph. Runs are
 * derived where a block renders, not stored on it.
 */
export function renderInline(text: string): InlineRun[] {
	const runs: InlineRun[] = [];
	let rest = text;
	while (rest.length > 0) {
		const open = rest.indexOf('**');
		const close = open === -1 ? -1 : rest.indexOf('**', open + 2);
		if (open === -1 || close === -1 || close === open + 2) {
			// No pair left (or an empty one): the remainder is plain.
			runs.push({ text: rest, strong: false });
			break;
		}
		if (open > 0) runs.push({ text: rest.slice(0, open), strong: false });
		runs.push({ text: rest.slice(open + 2, close), strong: true });
		rest = rest.slice(close + 2);
	}
	return runs;
}

/** The paragraph without its markers — for a meta description, an aria-label. */
export function plainInline(text: string): string {
	return renderInline(text)
		.map((run) => run.text)
		.join('');
}
