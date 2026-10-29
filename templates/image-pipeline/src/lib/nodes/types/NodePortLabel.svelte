<script lang="ts">
	import type { Snippet } from 'svelte'
	import { PORT_TYPE_COLORS, type PortDataType } from '../../constants'

	/**
	 * A label for a port row, displayed next to the port.
	 */
	let { children, dataType }: { children?: Snippet; dataType: PortDataType } = $props()
</script>

<span class="NodePortLabel" style:color={PORT_TYPE_COLORS[dataType]}>
	{@render children?.()}
</span>
