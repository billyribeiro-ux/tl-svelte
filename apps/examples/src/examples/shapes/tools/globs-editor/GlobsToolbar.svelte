<script lang="ts">
	import { DefaultToolbar, DefaultToolbarContent, type DefaultToolbarProps } from 'svelte-draw'
	import GlobToolWithPopover from './GlobToolWithPopover.svelte'

	let props: Omit<DefaultToolbarProps, 'children'> = $props()
</script>

<DefaultToolbar {...props}>
	<GlobToolWithPopover />
	<DefaultToolbarContent />
</DefaultToolbar>
