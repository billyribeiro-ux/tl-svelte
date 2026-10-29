<script lang="ts">
	import { getMaybeApp } from '../../../hooks/useAppState.svelte'
	import { params } from '../../../../utils/router.svelte'
	import TlaEditorTopRightPanel from '../TlaEditorTopRightPanel.svelte'

	const app = getMaybeApp()
</script>

<TlaEditorTopRightPanel
	isAnonUser={!app.current}
	context={params.fileSlug ? 'file' : 'scratch'}
/>
