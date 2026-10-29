<script lang="ts" module>
	import type { TLComponents } from 'svelte-draw'
	import TlaEditorErrorFallback from './editor-components/TlaEditorErrorFallback.svelte'
	import TlaEditorLegacySharePanel from './editor-components/TlaEditorLegacySharePanel.svelte'
	import TlaEditorMenuPanel from './editor-components/TlaEditorMenuPanel.svelte'
	import TlaEditorTopPanel from './editor-components/TlaEditorTopPanel.svelte'

	const legacyComponents: TLComponents = {
		ErrorFallback: TlaEditorErrorFallback,
		MenuPanel: TlaEditorMenuPanel,
		SharePanel: TlaEditorLegacySharePanel,
		TopPanel: TlaEditorTopPanel,
	}
</script>

<script lang="ts">
	import type { TLStoreSnapshot } from 'svelte-draw'
	import ReadyWrapper from '../../hooks/ReadyWrapper.svelte'
	import SneakySetDocumentTitle from './sneaky/SneakySetDocumentTitle.svelte'
	import TlaLegacySnapshotEditorInner from './TlaLegacySnapshotEditorInner.svelte'

	/** A read-only editor over a static snapshot. Legacy snapshot pages use the default legacy
	 *  panels; history snapshot pages pass their own `components`. */
	let {
		snapshot,
		fileSlug,
		components = legacyComponents,
	}: {
		fileSlug: string
		snapshot: TLStoreSnapshot
		components?: TLComponents
	} = $props()
</script>

<SneakySetDocumentTitle />
{#key fileSlug}
	<ReadyWrapper>
		<TlaLegacySnapshotEditorInner {snapshot} {components} />
	</ReadyWrapper>
{/key}
