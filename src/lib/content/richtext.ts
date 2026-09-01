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
