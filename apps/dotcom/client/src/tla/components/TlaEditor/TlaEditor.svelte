<script lang="ts" module>
	// The components dotcom passes to every editor; also provided to the SDK UI context by the shell.
	export { components } from './tlaEditorComponents'
</script>

<script lang="ts">
	import ReadyWrapper from '../../hooks/ReadyWrapper.svelte'
	import SneakySetDocumentTitle from './sneaky/SneakySetDocumentTitle.svelte'
	import TlaEditorInner from './TlaEditorInner.svelte'

	interface TlaEditorProps {
		fileSlug: string
		isEmbed?: boolean
		deepLinks?: boolean
	}

	let { fileSlug, isEmbed, deepLinks }: TlaEditorProps = $props()
</script>

<SneakySetDocumentTitle />
<!-- force re-mount when the file slug changes to prevent state from leaking between files -->
{#key fileSlug}
	<ReadyWrapper>
		<TlaEditorInner {fileSlug} {deepLinks} {isEmbed} />
	</ReadyWrapper>
{/key}
