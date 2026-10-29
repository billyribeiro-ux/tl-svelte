<script lang="ts">
	import type { TLComponents } from 'svelte-draw'
	import LocalEditor from '../../components/LocalEditor.svelte'
	import { params } from '../../utils/router.svelte'
	import LocalFileErrorFallback from './LocalFileErrorFallback.svelte'
	import LocalFileMainMenu from './LocalFileMainMenu.svelte'

	const components: TLComponents = {
		ErrorFallback: LocalFileErrorFallback,
		SharePanel: null,
		MainMenu: LocalFileMainMenu,
	}
</script>

<div style="position: fixed; inset: 0">
	<LocalEditor persistenceKey={params.fileSlug} {components} />
</div>
