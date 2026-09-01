import { describe, expect, it } from 'vitest';
import { renderBody } from './richtext.js';

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
