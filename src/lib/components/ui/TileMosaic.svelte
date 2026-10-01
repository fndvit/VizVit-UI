<script lang="ts">
	/**
	 * The brand's geometric mosaic: a grid of tiles — squares, quarter and
	 * half circles, triangles, discs and a hatched square — in navy, magenta,
	 * cream and wine. It is décor, not content: nothing in it is a fact a
	 * reader needs, so it is `aria-hidden` and no CMS edits it.
	 *
	 * Deterministic from `seed`: the same seed draws the same mosaic on the
	 * server and in the browser, so hydration never repaints it, and a story
	 * or a screenshot test sees one picture. mulberry32 is enough of a PRNG
	 * for a picture and small enough to own.
	 *
	 * Sized by its container: the SVG fills whatever box it is given and
	 * `slice` crops rather than letterboxes, so a wide hero and a 2×2 corner
	 * cluster take the same component.
	 */
	interface Props {
		cols?: number;
		rows?: number;
		seed?: number;
		/** Share of cells that draw a tile at all (the rest stay white). */
		density?: number;
		/**
		 * A denser CLUSTER around one cell — the splash's picture is a crowd
		 * of tiles left of centre thinning out towards the edges. Within
		 * `radius` cells of (col, row) the share is `density`; from there it
		 * falls linearly to the grid's own over another radius.
		 */
		focus?: { col: number; row: number; radius: number; density: number };
		/**
		 * Rectangles, in cell units, that draw nothing — where the splash
		 * lays its text and its mark, so the picture leaves them room the way
		 * the design does rather than by luck of the seed.
		 */
		clear?: { col: number; row: number; cols: number; rows: number }[];
		/**
		 * An ENTRANCE: the tiles arrive as the picture first shows — each
		 * born a way in towards the focus (or the grid's middle), turned and
		 * small, travelling out to its place with a little overshoot — in
		 * waves from the centre outwards, so the picture grows. Pure CSS
		 * from the server's markup, so it starts with the first paint; off
		 * under reduced motion. The splash asks for it; a corner cluster
		 * does not.
		 */
		arrive?: boolean;
		/**
		 * The tiles' colours, drawn at random from this list — a hue listed
		 * twice is twice as likely. The brand's four by default; the
		 * newsletter band asks for navy, the mark's pink and cream.
		 */
		hues?: readonly string[];
	}

	let {
		cols = 8,
		rows = 5,
		seed = 1,
		density = 0.8,
		focus,
		clear = [],
		arrive = false,
		hues
	}: Props = $props();

	/** A cell is cleared when ANY of it lies under a zone — text never meets a tile's edge. */
	const isCleared = (col: number, row: number): boolean =>
		clear.some(
			(zone) =>
				col < zone.col + zone.cols &&
				col + 1 > zone.col &&
				row < zone.row + zone.rows &&
				row + 1 > zone.row
		);

	/** The share of a cell at (col, row), the focus cluster applied. */
	function shareAt(col: number, row: number): number {
		if (!focus) return density;
		const distance = Math.hypot(col + 0.5 - focus.col, row + 0.5 - focus.row);
		const t = Math.min(1, Math.max(0, (distance - focus.radius) / focus.radius));
		return focus.density * (1 - t) + density * t;
	}

	/** The cell size in viewBox units — every path below is drawn in it. */
	const U = 100;

	type Kind = 'square' | 'quarter' | 'half' | 'triangle' | 'disc' | 'hatched';
	interface Tile {
		x: number;
		y: number;
		kind: Kind;
		fill: string;
		/** Quarter turns, for the shapes that have an orientation. */
		turn: number;
	}

	/** Weighted so squares and quarters carry the picture, as in the mock. */
	const KINDS: readonly Kind[] = [
		'square',
		'square',
		'quarter',
		'quarter',
		'quarter',
		'half',
		'triangle',
		'disc',
		'hatched'
	];
	const FILLS: readonly string[] = [
		'var(--color-navy)',
		'var(--color-navy)',
		'var(--color-cream)',
		'var(--color-cream)',
		'var(--color-magenta)',
		'var(--color-wine)'
	];

	/** The hues drawn, and what a tile turns into under the pointer: the next of them. */
	const fills = $derived(hues ?? FILLS);
	const palette = $derived([...new Set(fills)]);
	const nextHue = (fill: string): string =>
		palette[(palette.indexOf(fill) + 1) % palette.length] as string;

	function mulberry32(a: number): () => number {
		return () => {
			a = (a + 0x6d2b79f5) | 0;
			let t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	const tiles = $derived.by((): Tile[] => {
		const next = mulberry32(seed);
		const pick = <T,>(list: readonly T[]): T => list[Math.floor(next() * list.length)] as T;
		const drawn: Tile[] = [];
		for (let row = 0; row < rows; row += 1) {
			for (let col = 0; col < cols; col += 1) {
				// Draw the four numbers whether or not the cell is used, so a
				// density change moves nothing that is still drawn.
				const roll = next();
				const kind = pick(KINDS);
				const fill = pick(fills);
				const turn = Math.floor(next() * 4);
				if (roll < shareAt(col, row) && !isCleared(col, row)) {
					drawn.push({ x: col * U, y: row * U, kind, fill, turn });
				}
			}
		}
		return drawn;
	});

	// The hatch <pattern>'s id is the SEED's, not the instance's: two mosaics
	// with different seeds never collide, and two with the same seed define
	// the same pattern twice, which resolves to the first and draws the same.
	// A per-instance id (`$props.id()`) would make two renders of one page
	// differ, and the page tests hold a read-only render byte-identical.
	const hatchId = $derived(`vit-hatch-${seed}`);

	const rotate = (tile: Tile): string =>
		tile.turn === 0 ? '' : `rotate(${tile.turn * 90} ${tile.x + U / 2} ${tile.y + U / 2})`;

	/** How far in, from its place towards the centre, a tile is born. */
	const BORN_IN = 0.4;
	/** The wave: ms per cell of distance from the centre, after a first beat. */
	const WAVE_MS = 55;
	const FIRST_BEAT_MS = 120;
	const JITTER_MS = 140;

	/**
	 * Where each tile comes from and when, as the custom properties the
	 * entrance keyframes read. A second number stream, seeded apart, so the
	 * entrance never consumes a draw of the picture's: asking for one draws
	 * the same tiles. Deterministic, so the server and the browser agree.
	 */
	const arrivals = $derived.by((): string[] => {
		if (!arrive) return [];
		const centre = focus ?? { col: cols / 2, row: rows / 2 };
		const next = mulberry32(seed ^ 0x9e3779b9);
		return tiles.map((tile) => {
			const dx = (centre.col - 0.5) * U - tile.x;
			const dy = (centre.row - 0.5) * U - tile.y;
			const distance = Math.hypot(dx, dy) / U;
			const spin = (next() < 0.5 ? -1 : 1) * Math.round(90 + next() * 90);
			const wait = Math.round(FIRST_BEAT_MS + distance * WAVE_MS + next() * JITTER_MS);
			return `; --tile-dx: ${Math.round(dx * BORN_IN)}px; --tile-dy: ${Math.round(dy * BORN_IN)}px; --tile-spin: ${spin}deg; --tile-wait: ${wait}ms`;
		});
	});
</script>

<svg
	class="mosaic"
	viewBox={`0 0 ${cols * U} ${rows * U}`}
	preserveAspectRatio="xMidYMid slice"
	aria-hidden="true"
	focusable="false"
>
	<defs>
		<pattern id={hatchId} width="12" height="12" patternUnits="userSpaceOnUse">
			<path d="M-3 3 L3 -3 M0 12 L12 0 M9 15 L15 9" stroke="var(--color-navy)" stroke-width="3" />
		</pattern>
	</defs>
	<!-- The orientation is the group's, the hover transform the shape's: a CSS
	     transform would replace a presentation attribute on the same element.
	     The pointer is felt by the CELL — an unseen square that never moves —
	     not by the shape: a shape that turned under the pointer would slip
	     out from under it, drop the hover, turn back, and flicker. The cell
	     comes last so the shape stays the group's first child. -->
	{#each tiles as tile, i (`${tile.x}-${tile.y}`)}
		<g
			class="tile"
			class:disc={tile.kind === 'disc'}
			class:arrive
			transform={rotate(tile) || undefined}
			style={`--tile-fill: ${tile.fill}; --tile-next: ${nextHue(tile.fill)}; --tile-hatch: url(#${hatchId})${arrivals[i] ?? ''}`}
		>
			{#if tile.kind === 'square'}
				<rect class="shape" x={tile.x} y={tile.y} width={U} height={U} />
			{:else if tile.kind === 'hatched'}
				<rect class="shape hatch" x={tile.x} y={tile.y} width={U} height={U} />
			{:else if tile.kind === 'disc'}
				<circle class="shape" cx={tile.x + U / 2} cy={tile.y + U / 2} r={U / 2} />
			{:else if tile.kind === 'quarter'}
				<path
					class="shape"
					d={`M${tile.x} ${tile.y} h${U} A${U} ${U} 0 0 1 ${tile.x} ${tile.y + U} Z`}
				/>
			{:else if tile.kind === 'half'}
				<path
					class="shape"
					d={`M${tile.x} ${tile.y + U / 2} A${U / 2} ${U / 2} 0 0 1 ${tile.x + U} ${tile.y + U / 2} Z`}
				/>
			{:else}
				<path class="shape" d={`M${tile.x} ${tile.y} h${U} v${U} Z`} />
			{/if}
			<rect class="cell" x={tile.x} y={tile.y} width={U} height={U} />
		</g>
	{/each}
</svg>

<style>
	/* THE WAKE: a tile answers the pointer at once and takes its time to
	   settle back, so the tiles a hand has passed stay turned and coloured
	   a while and return one after another — a trail behind the pointer.
	   The two paces are the host's to set: a quick `--vit-tile-turn` and a
	   slow `--vit-tile-settle`. */
	.mosaic {
		--vit-tile-turn: 260ms;
		--vit-tile-settle: 1600ms;

		display: block;
		width: 100%;
		height: 100%;
	}

	/* The cell feels the pointer and shows nothing; the shape shows and
	   feels nothing, so its turn never changes what is under the pointer. */
	.cell {
		fill: transparent;
		pointer-events: all;
	}

	/* At rest the transition is the settling: what applies once the pointer
	   has left. */
	.shape {
		fill: var(--tile-fill);
		pointer-events: none;
		transform-box: fill-box;
		transform-origin: center;
		transition:
			transform var(--vit-tile-settle) cubic-bezier(0.2, 0.6, 0.2, 1),
			fill var(--vit-tile-settle) ease-out;
	}

	/* The hatching keeps its pattern, under the pointer too — only its
	   stripes flip with the turn. */
	.tile > .hatch,
	.tile:hover > .hatch {
		fill: var(--tile-hatch);
	}

	/* Under the pointer a tile turns a quarter at once, with a little
	   overshoot, and takes the next hue; a disc has no corner to turn, so
	   it swells instead. */
	.tile:hover > .shape {
		transform: rotate(90deg) scale(1.08);
		fill: var(--tile-next);
		transition:
			transform var(--vit-tile-turn) cubic-bezier(0.3, 1.2, 0.4, 1),
			fill var(--vit-tile-turn) ease-out;
	}

	.tile.disc:hover > .shape {
		transform: scale(1.22);
	}

	/* The entrance rides the individual transform properties, so it never
	   touches `transform` — the hover's — and the two compose. */
	.tile.arrive > .shape {
		animation: vit-tile-arrive 900ms cubic-bezier(0.34, 1.45, 0.64, 1) var(--tile-wait) backwards;
	}

	@keyframes vit-tile-arrive {
		from {
			translate: var(--tile-dx) var(--tile-dy);
			rotate: var(--tile-spin);
			scale: 0.15;
			opacity: 0;
		}

		35% {
			opacity: 1;
		}

		to {
			translate: 0 0;
			rotate: 0deg;
			scale: 1;
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.shape,
		.tile:hover > .shape {
			transition: none;
		}

		.tile.arrive > .shape {
			animation: none;
		}

		.tile:hover > .shape,
		.tile.disc:hover > .shape {
			transform: none;
		}
	}
</style>
