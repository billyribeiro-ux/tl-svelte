<script lang="ts">
	import type { TLComponents, TLStoreSnapshot } from 'svelte-draw'
	import TlaEditorErrorFallback from './editor-components/TlaEditorErrorFallback.svelte'
	import RestoreVersionButton from './RestoreVersionButton.svelte'
	import TlaLegacySnapshotEditor from './TlaLegacySnapshotEditor.svelte'
	import { withComponentProps } from './withComponentProps'

	let {
		fileSlug,
		snapshot,
		onRestore,
	}: {
		fileSlug: string
		snapshot: TLStoreSnapshot
		onRestore(): Promise<void>
	} = $props()

	const components: TLComponents = {
		ErrorFallback: TlaEditorErrorFallback,
		SharePanel: withComponentProps(RestoreVersionButton, {
			onRestore: () => onRestore(),
		}),
	}
</script>

<TlaLegacySnapshotEditor {fileSlug} {snapshot} {components} />
