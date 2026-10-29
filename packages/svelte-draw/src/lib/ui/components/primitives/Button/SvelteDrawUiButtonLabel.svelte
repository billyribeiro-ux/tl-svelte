<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiButtonLabelProps {
		children?: Snippet
	}
</script>

<script lang="ts">
	let { children }: TLUiButtonLabelProps = $props()
</script>

<span class="tlui-button__label">{@render children?.()}</span>
