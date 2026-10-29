<script lang="ts">
	import { DefaultToolbar, DefaultToolbarContent } from 'svelte-draw'
	import { getMcpAppContext } from './app-context'

	const ctx = getMcpAppContext()
</script>

<DefaultToolbar orientation={ctx.displayMode === 'fullscreen' ? 'vertical' : 'horizontal'}>
	<DefaultToolbarContent />
</DefaultToolbar>
