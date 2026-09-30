import { describe, expect, it } from 'vitest';
import { renderBody, renderInline } from './richtext.js';

describe('renderBody', () => {
	it('splits paragraphs on blank lines', () => {
		const blocks = renderBody('Primer paràgraf.\n\nSegon paràgraf.');

		expect(blocks).toEqual([
			{ type: 'p', text: 'Primer paràgraf.' },
			{ type: 'p', text: 'Segon paràgraf.' }
		]);
	});

	it('turns "## " lines into h2 blocks', () => {
		const blocks = renderBody('Intro.\n\n## Un subtítol\n\nCos.');

		expect(blocks[1]).toEqual({ type: 'h2', text: 'Un subtítol' });
	});

	it('joins single newlines inside a paragraph with spaces', () => {
		const blocks = renderBody('línia u\nlínia dos');

		expect(blocks).toEqual([{ type: 'p', text: 'línia u línia dos' }]);
	});

	it('ignores leading, trailing, and duplicate blank lines', () => {
		const blocks = renderBody('\n\nParàgraf.\n\n\n\nAltre.\n\n');

		expect(blocks).toHaveLength(2);
	});

	it('returns an empty list for empty input', () => {
		expect(renderBody('')).toEqual([]);
	});
});

describe('renderInline', () => {
	it('turns a **pair** into a strong run between plain ones', () => {
		expect(renderInline('La visualització pot **transformar** les dades.')).toEqual([
			{ text: 'La visualització pot ', strong: false },
			{ text: 'transformar', strong: true },
			{ text: ' les dades.', strong: false }
		]);
	});

	it('handles several pairs, including one at the very start and end', () => {
		expect(renderInline('**A** i **B**')).toEqual([
			{ text: 'A', strong: true },
			{ text: ' i ', strong: false },
			{ text: 'B', strong: true }
		]);
	});

	it('keeps an unmatched or empty marker literal', () => {
		expect(renderInline('un ** sol')).toEqual([{ text: 'un ** sol', strong: false }]);
		expect(renderInline('buit **** aquí')).toEqual([{ text: 'buit **** aquí', strong: false }]);
	});

	it('returns one plain run for text without markers, and none for empty text', () => {
		expect(renderInline('pla')).toEqual([{ text: 'pla', strong: false }]);
		expect(renderInline('')).toEqual([]);
	});
});
