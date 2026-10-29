<script lang="ts" module>
	import { createDebugValue, debugFlags } from 'svelte-draw'
	import { LOADS_DEBUG_FLAG } from '../../../utils/loadTracker'

	const DOTCOM_DEBUG_FLAGS = {
		...debugFlags,
		logLoads: createDebugValue(LOADS_DEBUG_FLAG, { defaults: { all: false } }),
	}
</script>

<script lang="ts">
	import {
		DefaultDebugMenu,
		DefaultDebugMenuContent,
		fromComputed,
		getEditor,
		SvelteDrawUiMenuItem,
	} from 'svelte-draw'
	import { getOpenUrlAndTrack } from '../../../hooks/useOpenUrlAndTrack'
	import { getMaybeApp } from '../../hooks/useAppState.svelte'
	import { getSvelteDrawCurrentUser } from '../../hooks/useUser.svelte'
	import TlaDebug from './TlaDebug.svelte'

	const app = getMaybeApp()
	const user = getSvelteDrawCurrentUser()
	const openAndTrack = getOpenUrlAndTrack('unknown')
	const editor = getEditor()
	const isReadOnly = fromComputed('isReadOnly', () => editor.getIsReadonly())
</script>

<DefaultDebugMenu>
	<TlaDebug />
	{#if !isReadOnly.current && app.current && user.current?.isSvelteDraw}
		<SvelteDrawUiMenuItem
			id="file-history"
			label="File history"
			readonlyOk
			onSelect={() => {
				const url = new URL(window.location.href)
				url.pathname += '/history'
				openAndTrack(url.toString())
			}}
		/>
	{/if}
	<DefaultDebugMenuContent customDebugFlags={DOTCOM_DEBUG_FLAGS} />
</DefaultDebugMenu>
