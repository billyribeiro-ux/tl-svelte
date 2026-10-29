<script lang="ts">
	import { fromComputed, tryGetEditor } from 'svelte-draw'
	import { isDevelopmentEnv } from '../../../utils/env'
	import DebugSubmenu from './DebugSubmenu.svelte'

	const maybeEditor = tryGetEditor()
	const isDebugMode = fromComputed('debug', () => maybeEditor?.getInstanceState().isDebugMode)
</script>

<!-- These are internal developer tools, so only surface them in local development —
     not on staging/preview deploys or to production users who enable debug mode. -->
{#if isDevelopmentEnv && isDebugMode.current}
	<DebugSubmenu />
{/if}
