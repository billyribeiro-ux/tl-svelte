<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface StylePanelSubheadingProps {
		children: Snippet
	}
</script>

<script lang="ts">
	let { children }: StylePanelSubheadingProps = $props()
</script>

<h3 class="tlui-style-panel__subheading">{@render children()}</h3>
