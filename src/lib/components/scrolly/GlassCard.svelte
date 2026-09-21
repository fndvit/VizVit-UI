<!--
  @component GlassCard

  A frosted panel: padding plus a backdrop blur, and nothing else. It exists
  because the same two declarations were being written at ten call sites.

  | property             | default  |
  |----------------------|----------|
  | `--glass-padding`| `2.25rem`|
  | `--glass-blur`   | `4px`    |

  @prop {string} [class] - Extra classes appended to the panel
  @prop {Snippet} children - The panel's contents
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		children,
		...rest
	}: {
		class?: string;
		children: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

<div class="vit-glass {className}" {...rest}>
	{@render children()}
</div>

<style>
	.vit-glass {
		padding: var(--glass-padding, 2.25rem);
		backdrop-filter: blur(var(--glass-blur, 4px));
		-webkit-backdrop-filter: blur(var(--glass-blur, 4px));
	}
</style>
