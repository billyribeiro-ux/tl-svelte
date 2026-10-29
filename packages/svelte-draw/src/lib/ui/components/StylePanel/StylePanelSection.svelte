<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface StylePanelSectionProps {
		children: Snippet
	}
</script>

<script lang="ts">
	let { children }: StylePanelSectionProps = $props()
</script>

<div class="tlui-style-panel__section">{@render children()}</div>
