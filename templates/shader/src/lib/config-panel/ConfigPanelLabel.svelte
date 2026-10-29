<script lang="ts">
	import type { Snippet } from 'svelte'

	let { children }: { children?: Snippet } = $props()
</script>

<span class="shader-config-panel__label">{@render children?.()}</span>
