/**
 * The drawing behind `FigureBody`, `FigureHead` and `PersonFigure`: the
 * survey's stroke paths, where each part sits in the composed box, and the
 * arithmetic of the label's callout. Data and arithmetic only, so it tests in
 * node and a host that wants line people without heads or labels — a chart, a
 * decorative band — can draw from the same set.
 *
 * The paths are the ones `mwc-enquesta-bretxa-digital` built its survey
 * avatars from (`paths.json`). They are closed sets: extending one is a
 * package change, so every consumer's `ArmsPose` stays honest (the `Icon`
 * rule).
 */

/**
 * The closed sets, in DISPLAY ORDER. A host's zod enum and every select that
 * offers a pose derive from these (`./contract` carries them — the
 * `MILESTONE_CATEGORIES` precedent), and the path maps below are bound to them
 * with `satisfies`: a pose in a map without its tuple entry, or the reverse,
 * fails `check` in either direction.
 */
export const ARM_POSES = ['down', 'raised', 'one-bent'] as const;
export type ArmsPose = (typeof ARM_POSES)[number];
export const LEG_POSES = ['standing', 'walking', 'stride', 'step', 'kneel', 'sit'] as const;
export type LegsPose = (typeof LEG_POSES)[number];

/** Shoulder line and two hanging arms, in the survey's 153×111 torso box. */
export const ARMS = {
	down: 'M27 107L39.375 8H113.625L126 107',
	raised: 'M7 25L32.9376 57.5L39.125 8H113.375L119.563 57.5L145.5 25',
	'one-bent': 'M51.899 91.3976L19 53.7671L38.9562 8H113.565L126 107'
} as const satisfies Record<ArmsPose, string>;

/** Two legs in the survey's 91×187 box (its adult set). */
export const LEGS = {
	standing: 'M21 7V179H8M70 7V179H82',
	walking: 'M69 7L85 129.857L69 179H81.4218M21 7L36 129.857L21 179H32.6453',
	stride: 'M21 7V80.7143L38 179H25.0024M71 7V80.7143L54 179H65.3333',
	step: 'M21 7V179H8M70 7L85 129.857L70 179H81.6545',
	kneel: 'M21 7V179H9M71 7V130.087L46 168.589V182',
	sit: 'M21 7V130.087L45 168.589V182M69 7L54 129.857L69 179H57.3546'
} as const satisfies Record<LegsPose, string>;

/** The drawn outlines, in display order — a host row may store which one it wears. */
export const HEAD_SHAPES = ['round', 'cup', 'd'] as const;
export type HeadShape = (typeof HEAD_SHAPES)[number];

/** Drawn head outlines in the survey's 49×48 box, for a figure with no photo. */
export const HEADS = {
	round:
		'M25 41C33.8366 41 41 33.6127 41 24.5C41 15.3873 33.8366 8 25 8C16.1634 8 9 15.3873 9 24.5C9 33.6127 16.1634 41 25 41Z',
	cup: 'M8 8V24.4952C7.99874 26.6662 8.4255 28.8161 9.25592 30.8216C10.0863 32.8271 11.3042 34.6488 12.8393 36.1822C14.3745 37.7155 16.1968 38.9304 18.2019 39.7571C20.207 40.5839 22.3554 41.0062 24.5239 40.9999C28.8936 40.9999 33.0843 39.262 36.1742 36.1686C39.2641 33.0751 41 28.8795 41 24.5047V8.00955L8 8Z',
	d: 'M27.571 8H38V41H27.571C23.1726 40.9949 18.9563 39.2535 15.8489 36.1585C12.7415 33.0636 10.9975 28.8684 11 24.4952C11 20.1237 12.7453 15.931 15.8524 12.8381C18.9595 9.74519 23.1743 8.00507 27.571 8V8Z'
} as const satisfies Record<HeadShape, string>;

/**
 * How a figure gets its head: a cut-out photo sat on the neck, a portrait
 * masked into a circle, or the drawn outline regardless of photo. A MODE, not
 * a `HeadShape` — the outline's shape is the drawing's business.
 */
export const HEAD_MODES = ['cutout', 'circle', 'drawn'] as const;
export type HeadMode = (typeof HEAD_MODES)[number];

/** Bounds a host's integer columns share with `TeamFigure`: px of vertical shift, and percents. */
export const FIGURE_OFFSET = { min: 0, max: 400 } as const;
export const FIGURE_PERCENT = { min: 50, max: 200 } as const;
/**
 * Where a figure stands on a canvas, and on which layer. Both axes are in
 * thousandths of the canvas WIDTH — y too, so a collage scales as one piece
 * and does not depend on the canvas's height, which follows from the figures.
 * y runs to three widths, room for a tall collage.
 */
export const FIGURE_POSITION = {
	x: { min: 0, max: 1000 },
	y: { min: 0, max: 3000 }
} as const;
export const FIGURE_LAYER = { min: 0, max: 99 } as const;

/**
 * The composed box. The survey stacked three svgs on a grid (rows 48 / 111 /
 * 100, the legs' 187 hanging out of the last row); this is that stack
 * flattened into one viewBox, plus 20 of headroom so a photo can rise above
 * where the drawn head would be. Landmarks: shoulder line y 76 from x 39 to
 * 114, legs from y 99, feet at y 271.
 */
export const FIGURE_WIDTH = 153;
export const FIGURE_HEIGHT = 280;
export const FIGURE_VIEWBOX = `0 0 ${FIGURE_WIDTH} ${FIGURE_HEIGHT}`;
export const HEAD_AT = 'translate(52 20)';
export const ARMS_AT = 'translate(0 68)';
export const LEGS_AT = 'translate(31 92)';
/** The neck: a photo's chin lands here, and `headScale` scales about it. */
export const NECK = { x: 76.5, y: 84 } as const;
/** Where the callout leaves the body — the ends of the shoulder line. */
export const SHOULDER = { y: 76, left: 39.5, right: 113.5 } as const;

export const LABEL_SIDES = ['left', 'right'] as const;
export type LabelSide = (typeof LABEL_SIDES)[number];
export const LABEL_ALIGNS = ['top', 'bottom'] as const;
export type LabelAlign = (typeof LABEL_ALIGNS)[number];

/**
 * The height of the label's rule: beside the head, or beside the legs.
 * `PersonFigure` sizes the caption's grid row to it, so the caption's
 * baseline meets the rule whatever the font size.
 */
export const RULE_Y = { top: 50, bottom: 200 } as const satisfies Record<LabelAlign, number>;
/** How far the callout runs out of the art before the rule, and the rule's length. */
export const CALLOUT_RUN = 24;
export const CALLOUT_RULE = 90;

/**
 * Shoulder → the rule's inner end → along the rule. Mirrored for a label on
 * the left, where it runs into negative x — the art's svg draws with
 * `overflow: visible` for exactly this.
 */
export function calloutPath(side: LabelSide, align: LabelAlign): string {
	const y = RULE_Y[align];
	if (side === 'right') {
		const inner = FIGURE_WIDTH + CALLOUT_RUN;
		return `M${SHOULDER.right} ${SHOULDER.y}L${inner} ${y}H${inner + CALLOUT_RULE}`;
	}
	const inner = -CALLOUT_RUN;
	return `M${SHOULDER.left} ${SHOULDER.y}L${inner} ${y}H${inner - CALLOUT_RULE}`;
}
