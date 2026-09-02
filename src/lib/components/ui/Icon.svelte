<script lang="ts" module>
	/** Stroke-based 24×24 icon paths. A closed set: extending it is a package
	 * change, so every consumer's `IconName` stays honest. */
	const PATHS = {
		home: 'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z',
		clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4v5l3.5 2',
		gear: 'M12 9.5A2.5 2.5 0 1 0 12 14.5 2.5 2.5 0 0 0 12 9.5zm8-.5-1.8-.5a6.6 6.6 0 0 0-.6-1.4l.9-1.6-1.9-1.9-1.6.9c-.5-.3-.9-.5-1.4-.6L13 2h-2l-.5 1.8c-.5.2-1 .4-1.4.6l-1.6-.9-1.9 1.9.9 1.6c-.3.5-.5.9-.6 1.4L4 9v2l1.8.5c.2.5.4 1 .6 1.4l-.9 1.6 1.9 1.9 1.6-.9c.5.3.9.5 1.4.6L11 22h2l.5-1.8c.5-.2 1-.4 1.4-.6l1.6.9 1.9-1.9-.9-1.6c.3-.5.5-.9.6-1.4L20 15z',
		pencil: 'M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19zm10.5-13.5l3 3',
		trash:
			'M5 7h14M10 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2m3 0v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7m3 4v6m4-6v6',
		duplicate: 'M9 9h10v12H9zM5 15V3h10',
		plus: 'M12 5v14M5 12h14',
		'chevron-right': 'M9 5l7 7-7 7',
		'chevron-left': 'M15 5l-7 7 7 7',
		close: 'M6 6l12 12M18 6L6 18',
		globe:
			'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c-2.5 2.4-3.8 5.5-3.8 9s1.3 6.6 3.8 9c2.5-2.4 3.8-5.5 3.8-9S14.5 5.4 12 3z',
		logout: 'M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h10'
	} as const;

	export type IconName = keyof typeof PATHS;
</script>

<script lang="ts">
	interface Props {
		name: IconName;
		size?: number;
	}

	let { name, size = 20 }: Props = $props();
</script>

<svg
	viewBox="0 0 24 24"
	width={size}
	height={size}
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	focusable="false"
>
	<path d={PATHS[name]} />
</svg>
