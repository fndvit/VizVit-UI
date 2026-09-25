import { describe, expect, it } from 'vitest';
import {
	completePath,
	defaultPath,
	leafPaths,
	replaceAt,
	walkTree,
	type SentenceNode
} from './sentenceTree.js';

/**
 * The path arithmetic behind `<Madlib>`, pinned on a small tree with the two
 * shapes that matter: branches of different depth, and a level whose options
 * repeat under several parents (`by`), which is what `replaceAt` preserves
 * across a sibling change and drops across a branch change.
 */
const by = (): SentenceNode[] => [
	{ id: 'area', label: 'area' },
	{ id: 'percent', label: 'percent' }
];

const tree: SentenceNode = {
	id: 'root',
	label: 'Show me',
	children: [
		{
			id: 'jobs',
			label: 'open positions',
			connector: 'in',
			children: [
				{ id: 'bcn', label: 'Barcelona', connector: 'by', children: by() },
				{ id: 'remote', label: 'remote roles', connector: 'by', children: by() },
				{
					id: 'all',
					label: 'everywhere',
					connector: 'by',
					children: [{ id: 'count', label: 'count' }]
				}
			]
		},
		{
			id: 'projects',
			label: 'projects',
			connector: 'since',
			children: [
				{ id: '2024', label: '2024' },
				{ id: '2025', label: '2025', connector: 'and later' }
			]
		}
	]
};

describe('walkTree', () => {
	it('returns nothing for an empty path', () => {
		expect(walkTree(tree, [])).toEqual([]);
	});

	it('returns each level with the node chosen and the options it was chosen from', () => {
		const levels = walkTree(tree, ['jobs', 'remote', 'percent']);
		expect(levels.map((l) => l.node.id)).toEqual(['jobs', 'remote', 'percent']);
		expect(levels[0].siblings.map((s) => s.id)).toEqual(['jobs', 'projects']);
		expect(levels[1].siblings.map((s) => s.id)).toEqual(['bcn', 'remote', 'all']);
		expect(levels[2].siblings.map((s) => s.id)).toEqual(['area', 'percent']);
	});

	it('stops at the first id that is not a child of the level above', () => {
		expect(walkTree(tree, ['jobs', 'nowhere', 'area']).map((l) => l.node.id)).toEqual(['jobs']);
	});

	it('stops at a leaf even when the path goes on', () => {
		expect(walkTree(tree, ['projects', '2024', 'extra']).map((l) => l.node.id)).toEqual([
			'projects',
			'2024'
		]);
	});
});

describe('completePath', () => {
	it('fills every level below a prefix with the first child', () => {
		expect(completePath(tree, ['jobs'])).toEqual(['jobs', 'bcn', 'area']);
	});

	it('keeps a full valid path unchanged', () => {
		expect(completePath(tree, ['jobs', 'remote', 'percent'])).toEqual([
			'jobs',
			'remote',
			'percent'
		]);
	});

	it('takes the defaults from the first id that does not resolve', () => {
		expect(completePath(tree, ['jobs', 'nowhere', 'percent'])).toEqual(['jobs', 'bcn', 'area']);
	});

	it('follows a branch to its own depth', () => {
		expect(completePath(tree, ['projects'])).toEqual(['projects', '2024']);
	});
});

describe('defaultPath', () => {
	it('is the first child at every level', () => {
		expect(defaultPath(tree)).toEqual(['jobs', 'bcn', 'area']);
	});

	it('is empty for a tree with no children', () => {
		expect(defaultPath({ id: 'root', label: 'Nothing to choose' })).toEqual([]);
	});
});

describe('replaceAt', () => {
	it('keeps the levels above the change', () => {
		expect(replaceAt(tree, ['jobs', 'bcn', 'percent'], 2, 'area')).toEqual(['jobs', 'bcn', 'area']);
	});

	it('keeps a deeper choice that is still valid under the new node', () => {
		// Switching city keeps "by percent": the same option exists under both.
		expect(replaceAt(tree, ['jobs', 'bcn', 'percent'], 1, 'remote')).toEqual([
			'jobs',
			'remote',
			'percent'
		]);
	});

	it('falls back to the first child where the old choice no longer exists', () => {
		// "everywhere" offers only "count", so "percent" cannot be kept.
		expect(replaceAt(tree, ['jobs', 'bcn', 'percent'], 1, 'all')).toEqual(['jobs', 'all', 'count']);
	});

	it('resets across a branch change', () => {
		expect(replaceAt(tree, ['jobs', 'bcn', 'percent'], 0, 'projects')).toEqual([
			'projects',
			'2024'
		]);
	});

	it('completes from a change on a short path', () => {
		expect(replaceAt(tree, ['projects'], 0, 'jobs')).toEqual(['jobs', 'bcn', 'area']);
	});
});

describe('leafPaths', () => {
	it('lists every root-to-leaf path in declaration order', () => {
		expect(leafPaths(tree)).toEqual([
			['jobs', 'bcn', 'area'],
			['jobs', 'bcn', 'percent'],
			['jobs', 'remote', 'area'],
			['jobs', 'remote', 'percent'],
			['jobs', 'all', 'count'],
			['projects', '2024'],
			['projects', '2025']
		]);
	});

	it('resolves every path it lists', () => {
		for (const path of leafPaths(tree)) {
			expect(walkTree(tree, path)).toHaveLength(path.length);
		}
	});

	it('is the empty path for a tree with no children', () => {
		expect(leafPaths({ id: 'root', label: 'Nothing' })).toEqual([[]]);
	});
});
