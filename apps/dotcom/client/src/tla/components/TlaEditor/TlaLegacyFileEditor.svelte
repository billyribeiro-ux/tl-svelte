<script lang="ts">
	import type { RoomOpenMode } from '@svelte-draw/dotcom-shared'
	import ReadyWrapper from '../../hooks/ReadyWrapper.svelte'
	import SneakySetDocumentTitle from './sneaky/SneakySetDocumentTitle.svelte'
	import TlaLegacyFileEditorInner from './TlaLegacyFileEditorInner.svelte'

	let { roomOpenMode, fileSlug }: { roomOpenMode: RoomOpenMode; fileSlug: string } = $props()
</script>

<SneakySetDocumentTitle />
{#key fileSlug}
	<ReadyWrapper>
		<TlaLegacyFileEditorInner {roomOpenMode} {fileSlug} />
	</ReadyWrapper>
{/key}
