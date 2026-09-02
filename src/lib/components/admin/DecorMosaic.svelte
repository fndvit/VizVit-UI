<script lang="ts">
	interface Props {
		/**
		 * 'login' — full-page geometric mosaic behind an auth card;
		 * 'app' — lighter scatter on app pages (top-right + bottom strip).
		 */
		variant?: 'login' | 'app';
	}

	let { variant = 'app' }: Props = $props();
</script>

<!-- Decorative geometric mosaic (brand shapes: squares, circles, quarter
     circles, triangles). Purely visual; pointer events pass through. Named
     apart from DecorShapes: that one is the website's corner composition,
     this is the admin apps' full mosaic. -->
<div class="decor" aria-hidden="true">
	{#if variant === 'login'}
		<svg class="cluster tl" viewBox="0 0 320 400" width="320" height="400">
			<circle cx="120" cy="40" r="40" fill="var(--color-navy)" />
			<rect x="240" y="0" width="80" height="80" fill="var(--color-navy)" />
			<circle cx="40" cy="160" r="40" fill="var(--color-navy)" />
			<path d="M80 120h80v80l-80-80z" fill="var(--color-ink)" />
			<path d="M80 200 L160 120 L160 200 Z" fill="var(--color-navy)" />
			<rect x="160" y="120" width="80" height="80" fill="var(--color-navy)" />
			<rect x="0" y="80" width="60" height="60" fill="var(--color-cream)" />
			<path d="M80 200 A80 80 0 0 1 160 280 L80 280 Z" fill="var(--color-navy)" />
			<rect x="160" y="200" width="80" height="80" fill="var(--color-cream)" />
			<path d="M160 200 L240 200 L160 280 Z" fill="var(--color-brand)" />
			<path d="M0 280 L80 280 L80 360 Z" fill="var(--color-ink)" />
			<path d="M0 280 L80 360 L0 360 Z" fill="var(--color-brand)" />
			<rect x="80" y="280" width="80" height="80" fill="var(--color-navy)" />
			<circle cx="120" cy="320" r="40" fill="var(--color-cream)" />
		</svg>
		<svg class="cluster tr" viewBox="0 0 280 280" width="280" height="280">
			<path d="M0 0h80v80H0z" fill="var(--color-navy)" />
			<path d="M0 0 L80 0 L0 80 Z" fill="var(--color-ink)" />
			<rect x="80" y="0" width="80" height="80" fill="var(--color-brand)" />
			<path d="M80 0 L160 0 L80 80 Z" fill="var(--color-ink)" />
			<circle cx="220" cy="60" r="45" fill="var(--color-cream)" />
			<path d="M0 80 L80 160 L0 160 Z" fill="var(--color-ink)" />
			<path d="M0 80 L80 80 L80 160 Z" fill="var(--color-navy)" />
			<path d="M80 160 L160 80 L160 160 Z" fill="var(--color-brand)" />
		</svg>
		<svg class="cluster br" viewBox="0 0 400 160" width="400" height="160">
			<path
				d="M0 0 A80 80 0 0 1 80 80 L0 80 Z"
				fill="color-mix(in srgb, var(--color-brand) 70%, var(--color-ink))"
			/>
			<rect x="80" y="0" width="80" height="80" fill="var(--color-ink)" />
			<path d="M80 0 L160 80 L80 80 Z" fill="var(--color-navy)" />
			<circle cx="240" cy="60" r="42" fill="var(--color-brand)" />
			<circle cx="330" cy="60" r="42" fill="var(--color-brand)" />
			<rect x="180" y="100" width="60" height="60" fill="var(--color-navy)" opacity="0.15" />
		</svg>
		<svg class="cluster bl" viewBox="0 0 300 120" width="300" height="120">
			<circle cx="60" cy="60" r="50" fill="var(--color-cream)" />
			<rect x="150" y="10" width="90" height="90" fill="var(--color-brand)" />
		</svg>
	{:else}
		<svg class="cluster tr" viewBox="0 0 560 180" width="560" height="180">
			<rect x="0" y="0" width="90" height="90" fill="var(--color-navy)" />
			<path d="M0 0 L90 0 L0 90 Z" fill="var(--color-ink)" />
			<path d="M90 0 A90 90 0 0 1 180 90 L90 90 Z" fill="var(--color-cream)" />
			<circle cx="300" cy="45" r="55" fill="var(--color-brand)" />
			<circle cx="420" cy="45" r="55" fill="var(--color-brand)" />
			<circle cx="120" cy="160" r="60" fill="var(--color-brand)" />
			<rect x="470" y="120" width="90" height="90" fill="var(--color-navy)" />
		</svg>
		<svg class="cluster bottom" viewBox="0 0 900 120" width="900" height="120">
			<circle cx="80" cy="90" r="70" fill="var(--color-cream)" />
			<rect x="380" y="30" width="110" height="110" fill="var(--color-brand)" />
			<circle cx="800" cy="100" r="70" fill="var(--color-navy)" />
		</svg>
	{/if}
</div>

<style>
	.decor {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		z-index: 0;
	}

	.cluster {
		position: absolute;
	}

	.tl {
		top: 4%;
		left: 3%;
	}

	.tr {
		top: 0;
		right: 0;
	}

	.br {
		bottom: 10%;
		right: 0;
	}

	.bl {
		bottom: -2%;
		left: 12%;
	}

	.bottom {
		bottom: -3rem;
		left: 8%;
	}

	@media (max-width: 900px) {
		.tl,
		.bl,
		.br {
			display: none;
		}
	}

	@media print {
		.decor {
			display: none;
		}
	}
</style>
