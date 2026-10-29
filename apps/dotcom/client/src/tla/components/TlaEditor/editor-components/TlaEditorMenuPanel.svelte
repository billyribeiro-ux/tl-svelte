<script lang="ts">
	import { getMaybeApp } from '../../../hooks/useAppState.svelte'
	import TlaEditorTopLeftPanel from '../TlaEditorTopLeftPanel.svelte'

	const app = getMaybeApp()
</script>

<TlaEditorTopLeftPanel isAnonUser={!app.current} />
