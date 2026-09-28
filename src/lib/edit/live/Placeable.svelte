<script lang="ts">
	import { untrack } from 'svelte';
	import Icon from '../../components/ui/Icon.svelte';
	import IconButton from '../../components/ui/IconButton.svelte';
	import { getUiConfig } from '../../config/context.js';
	import type { PlaceableProps, PlacementBounds } from '../chrome-props.js';
	import { getEditAdapter } from '../context.js';
	import type { Placement } from '../types.js';

	/**
	 * A canvas item's handles: drag it, nudge it with the arrow keys from its
	 * grip, drag its corner to resize it, send it a layer up or down. Each
	 * gesture ends in ONE `savePlacement` patch holding only what changed.
	 *
	 * The canvas says whether it is one: its custom properties
	 * (`--vit-placement: on`, `--vit-placement-handles`, `--vit-placement-touch`)
	 * are set only while it lays items out by position, so a canvas that has
	 * fallen back to a flowing list — a narrow viewport — shows no handles and
	 * takes no gesture, and its touch scrolling is left alone. Lengths come
	 * back as thousandths of the width of the `[data-vit-placement-canvas]`
	 * element around the item.
	 *
	 * While a gesture runs and until the host's refresh brings the stored
	 * placement back, the item is PREVIEWED where it will land: a translate
	 * and a scale on this wrapper, never a write per pointer move. A failed
	 * save drops the preview, so the item returns to where it is stored.
	 */
	let { spec, children }: PlaceableProps = $props();

	const adapter = getEditAdapter();
	const config = getUiConfig();

	/** Pointer travel before a press becomes a drag: a click on the figure stays a click. */
	const THRESHOLD = 4;
	/** Snap steps: position in ‰, size in percent. Alt drags without snapping. */
	const STEP = 10;
	const FINE = 1;
	const BIG_STEP = 50;
	const SIZE_STEP = 5;
	/** How long the arrow keys wait for a pause before saving. */
	const KEY_SETTLE = 400;

	let root: HTMLDivElement | undefined = $state();
	/** The preview: where the item will land, relative to where it is stored. */
	let dx = $state(0);
	let dy = $state(0);
	let size = $state<number | null>(null);
	let active = $state(false);
	let announcement = $state('');

	let gesture: {
		kind: 'move' | 'resize';
		pointer: number;
		startX: number;
		startY: number;
		/** The item's and the canvas's width in px when the press began. */
		width: number;
		canvas: number;
		dragging: boolean;
	} | null = null;
	let keyTimer: ReturnType<typeof setTimeout> | undefined;

	const clamp = (value: number, bounds: PlacementBounds): number =>
		Math.min(bounds.max, Math.max(bounds.min, Math.round(value)));
	const snap = (value: number, step: number): number => Math.round(value / step) * step;

	// The stored placement moved (the host refreshed after a save, or another
	// editor's change arrived): the preview has landed, drop it — unless a
	// gesture is still running.
	$effect(() => {
		void spec?.placement.x;
		void spec?.placement.y;
		void spec?.placement.size;
		untrack(() => {
			if (gesture === null && keyTimer === undefined) resetPreview();
		});
	});

	function resetPreview(): void {
		dx = 0;
		dy = 0;
		size = null;
	}

	function canvasOf(): HTMLElement | null {
		return root?.closest<HTMLElement>('[data-vit-placement-canvas]') ?? null;
	}

	/** The canvas is laying items out by position right now. */
	function isPlacing(): boolean {
		if (!root) return false;
		return getComputedStyle(root).getPropertyValue('--vit-placement').trim() === 'on';
	}

	/** How far right the item may go and still fit: the canvas less its own width. */
	function xBounds(width: number, canvas: number): PlacementBounds {
		if (!spec) return { min: 0, max: 0 };
		const fit = 1000 - (width / canvas) * 1000;
		return {
			min: spec.bounds.x.min,
			max: Math.max(spec.bounds.x.min, Math.min(spec.bounds.x.max, fit))
		};
	}

	function onpointerdown(event: PointerEvent): void {
		if (!spec || !root || event.button !== 0 || !isPlacing()) return;
		const target = event.target as Element;
		const kind = target.closest('.resize') ? 'resize' : 'move';
		// The frame's own buttons, a dialog it opened, the toolbar here: a
		// press there is theirs.
		if (
			kind === 'move' &&
			target.closest('button, a, input, textarea, select, dialog, [contenteditable]')
		) {
			return;
		}
		const canvas = canvasOf();
		if (!canvas) return;
		gesture = {
			kind,
			pointer: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			width: root.getBoundingClientRect().width,
			canvas: canvas.getBoundingClientRect().width,
			dragging: false
		};
		if (kind === 'resize') event.preventDefault();
	}

	function onpointermove(event: PointerEvent): void {
		if (!spec || !root || gesture === null || event.pointerId !== gesture.pointer) return;
		const moveX = event.clientX - gesture.startX;
		const moveY = event.clientY - gesture.startY;
		if (!gesture.dragging) {
			if (Math.hypot(moveX, moveY) < THRESHOLD) return;
			gesture.dragging = true;
			active = true;
			// Capture keeps the drag when the pointer outruns the item; a pointer
			// the browser no longer tracks cannot be captured, and the drag
			// still works without it while the pointer stays over the item.
			try {
				root.setPointerCapture(event.pointerId);
			} catch {
				/* not capturable — carry on uncaptured */
			}
		}
		event.preventDefault();
		const step = event.altKey ? FINE : STEP;
		const { placement, bounds } = spec;
		if (gesture.kind === 'move') {
			const toThousandths = 1000 / gesture.canvas;
			const x = clamp(
				snap(placement.x + moveX * toThousandths, step),
				xBounds(gesture.width, gesture.canvas)
			);
			const y = clamp(snap(placement.y + moveY * toThousandths, step), bounds.y);
			dx = x - placement.x;
			dy = y - placement.y;
		} else {
			const scaled = (placement.size * (gesture.width + moveX)) / gesture.width;
			size = clamp(snap(scaled, event.altKey ? FINE : SIZE_STEP), bounds.size);
		}
	}

	function onpointerup(event: PointerEvent): void {
		if (gesture === null || event.pointerId !== gesture.pointer) return;
		const { dragging } = gesture;
		gesture = null;
		active = false;
		if (root?.hasPointerCapture(event.pointerId)) root.releasePointerCapture(event.pointerId);
		if (dragging) void commit();
	}

	function onpointercancel(event: PointerEvent): void {
		if (gesture === null || event.pointerId !== gesture.pointer) return;
		gesture = null;
		active = false;
		resetPreview();
	}

	/** The grip's keys: arrows move, + and − resize, Escape drops an unsaved nudge. */
	function onkeydown(event: KeyboardEvent): void {
		if (!spec || !root || !isPlacing()) return;
		const canvas = canvasOf();
		if (!canvas) return;
		const step = event.shiftKey ? BIG_STEP : STEP;
		const { placement, bounds } = spec;
		const width = root.getBoundingClientRect().width;
		const move = (byX: number, byY: number) => {
			dx =
				clamp(placement.x + dx + byX, xBounds(width, canvas.getBoundingClientRect().width)) -
				placement.x;
			dy = clamp(placement.y + dy + byY, bounds.y) - placement.y;
		};
		const resize = (by: number) => {
			size = clamp((size ?? placement.size) + by, bounds.size);
		};
		switch (event.key) {
			case 'ArrowLeft':
				move(-step, 0);
				break;
			case 'ArrowRight':
				move(step, 0);
				break;
			case 'ArrowUp':
				move(0, -step);
				break;
			case 'ArrowDown':
				move(0, step);
				break;
			case '+':
			case '=':
				resize(SIZE_STEP);
				break;
			case '-':
				resize(-SIZE_STEP);
				break;
			case 'Escape':
				if (keyTimer === undefined) return;
				clearTimeout(keyTimer);
				keyTimer = undefined;
				resetPreview();
				event.preventDefault();
				return;
			default:
				return;
		}
		event.preventDefault();
		clearTimeout(keyTimer);
		keyTimer = setTimeout(() => {
			keyTimer = undefined;
			void commit();
		}, KEY_SETTLE);
	}

	/** One patch with only what the preview changed. */
	async function commit(extra: Placement = {}): Promise<void> {
		if (!spec || !adapter?.savePlacement) return;
		const { placement } = spec;
		const patch: Placement = { ...extra };
		// A move always writes both axes: an unplaced item's automatic place
		// is not stored, and a stored x with an automatic y would drift.
		if (dx !== 0 || dy !== 0) {
			patch.x = placement.x + dx;
			patch.y = placement.y + dy;
		}
		if (size !== null && size !== placement.size) patch.size = size;
		if (Object.keys(patch).length === 0) {
			resetPreview();
			return;
		}
		try {
			await adapter.savePlacement(spec.target, patch);
			announcement = config.editMessages.edit_placed();
		} catch {
			resetPreview();
			announcement = config.editMessages.edit_saveError();
		}
	}

	const front = $derived(
		spec ? clamp(Math.max(spec.layers.max + 1, spec.placement.z), spec.bounds.z) : 0
	);
	const back = $derived(
		spec ? clamp(Math.min(spec.layers.min - 1, spec.placement.z), spec.bounds.z) : 0
	);
	// Already above every other item, or below: the button has nothing to do.
	const onTop = $derived(!spec || spec.placement.z > spec.layers.max || front === spec.placement.z);
	const atBottom = $derived(
		!spec || spec.placement.z < spec.layers.min || back === spec.placement.z
	);

	const scale = $derived(spec && size !== null ? size / spec.placement.size : 1);
	const hintId = $props.id();
</script>

{#if spec}
	<!-- The pointer surface; the grip is its keyboard twin. -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="vit-placeable"
		class:active
		bind:this={root}
		style:translate={dx !== 0 || dy !== 0 ? `calc(${dx} * 0.1cqi) calc(${dy} * 0.1cqi)` : undefined}
		style:scale={scale !== 1 ? String(scale) : undefined}
		{onpointerdown}
		{onpointermove}
		{onpointerup}
		{onpointercancel}
	>
		{@render children()}
		<div class="handles">
			<button
				type="button"
				class="grip"
				aria-label={config.editMessages.edit_move({ label: spec.label })}
				aria-describedby={hintId}
				title={config.editMessages.edit_move({ label: spec.label })}
				{onkeydown}
			>
				<Icon name="move" size={18} />
			</button>
			<IconButton
				icon="layer-front"
				label={config.editMessages.edit_bringFront()}
				disabled={onTop}
				onclick={() => void commit({ z: front })}
			/>
			<IconButton
				icon="layer-back"
				label={config.editMessages.edit_sendBack()}
				disabled={atBottom}
				onclick={() => void commit({ z: back })}
			/>
		</div>
		<span class="resize" title={config.editMessages.edit_resize()} aria-hidden="true"></span>
		<span class="hint" id={hintId}>{config.editMessages.edit_moveHint()}</span>
		<span class="hint" role="status">{announcement}</span>
	</div>
{:else}
	{@render children()}
{/if}

<style>
	.vit-placeable {
		position: relative;
		/* Set by the canvas only while it places by position: on a flowing
		   list the page scrolls under a finger as ever. */
		touch-action: var(--vit-placement-touch, auto);
		transform-origin: 0 0;
	}

	.vit-placeable.active {
		cursor: grabbing;
		user-select: none;
		z-index: calc(var(--z-raised) + 2);
	}

	/* The whole item is the drag surface; say so where it can be dragged. */
	.vit-placeable:hover {
		cursor: var(--vit-placement-cursor, auto);
	}

	.handles {
		/* The frame's toolbar owns the top-right corner; these take the left. */
		position: absolute;
		top: var(--space-1);
		left: var(--space-1);
		display: var(--vit-placement-handles, none);
		gap: 2px;
		z-index: calc(var(--z-raised) + 1);
		background: var(--color-surface);
		border: 1px solid var(--color-hairline);
		border-radius: var(--radius);
		box-shadow: var(--shadow-1);
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--transition-fast);
	}

	.vit-placeable:hover .handles,
	.vit-placeable:focus-within .handles,
	.vit-placeable.active .handles {
		opacity: 1;
		pointer-events: auto;
	}

	.grip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.35rem;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: var(--color-ink);
		cursor: grab;
	}

	.grip:hover {
		background: color-mix(in srgb, var(--color-ink) 8%, transparent);
	}

	.grip:focus-visible {
		outline: 2px solid var(--color-brand);
		outline-offset: 1px;
	}

	.resize {
		position: absolute;
		right: 0;
		bottom: 0;
		display: var(--vit-placement-handles, none);
		width: 0.9rem;
		height: 0.9rem;
		border-right: 2px solid var(--color-brand);
		border-bottom: 2px solid var(--color-brand);
		border-bottom-right-radius: 2px;
		cursor: nwse-resize;
		opacity: 0;
		transition: opacity var(--transition-fast);
	}

	.vit-placeable:hover .resize,
	.vit-placeable:focus-within .resize,
	.vit-placeable.active .resize {
		opacity: 1;
	}

	.hint {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.handles,
		.resize {
			transition: none;
		}
	}
</style>
