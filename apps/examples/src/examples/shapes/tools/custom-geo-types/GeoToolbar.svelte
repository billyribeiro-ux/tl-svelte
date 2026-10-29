<script lang="ts">
	import {
		DefaultToolbar,
		DefaultToolbarContent,
		ToolbarItem,
		type DefaultToolbarProps,
	} from 'svelte-draw'

	let props: Omit<DefaultToolbarProps, 'children'> = $props()
</script>

<DefaultToolbar {...props}>
	<ToolbarItem tool="rounded-rect" />
	<ToolbarItem tool="cross" />
	<DefaultToolbarContent />
</DefaultToolbar>
